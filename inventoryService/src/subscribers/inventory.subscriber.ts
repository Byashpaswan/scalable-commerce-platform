import { randomUUID } from 'crypto';
import Inventory from '../models/inventory';
import { RabbitMQService } from '../services/rabbitmq.service';

export const setupInventorySubscribers = async () => {
  // 1. Subscribe to order.created
  await RabbitMQService.subscribe(
    'inventory-order-created-queue',
    'order.exchange',
    'order.event.created',
    async (content: any) => {
      const { orderId, userId, items, totalAmount, email } = content.data;
      console.log(`Saga: Consuming order.created for order: ${orderId}. Attempting stock reservation...`);

      const reservedItems: any[] = [];
      let isSuccess = true;

      try {
        for (const item of items) {
          const { sku, quantity } = item;

          const updated = await Inventory.findOneAndUpdate(
            {
              sku,
              $expr: {
                $gte: [
                  { $subtract: ['$quantity', '$reservedQuantity'] },
                  quantity
                ]
              }
            },
            {
              $inc: { reservedQuantity: quantity }
            },
            { new: true }
          );

          if (!updated) {
            isSuccess = false;
            for (const rolled of reservedItems) {
              await Inventory.findOneAndUpdate(
                { sku: rolled.sku },
                { $inc: { reservedQuantity: -rolled.quantity } }
              );
            }
            break;
          }

          reservedItems.push({ sku, quantity });
        }

        if (isSuccess) {
          console.log(`Saga: Stock reservation successful for order: ${orderId}. Publishing inventory.reserved...`);
          await RabbitMQService.publish('inventory.exchange', 'inventory.event.reserved', {
            eventId: randomUUID(),
            timestamp: new Date().toISOString(),
            correlationId: content.correlationId || 'N/A',
            data: {
              orderId,
              userId,
              email,
              totalAmount
            }
          });
        } else {
          console.warn(`Saga: Stock reservation failed for order: ${orderId} (insufficient stock)`);
          await RabbitMQService.publish('inventory.exchange', 'inventory.event.reservation_failed', {
            eventId: randomUUID(),
            timestamp: new Date().toISOString(),
            correlationId: content.correlationId || 'N/A',
            data: {
              orderId,
              reason: 'insufficient_stock'
            }
          });
        }
      } catch (err: any) {
        console.error('Failed to reserve stock in subscriber:', err);
        for (const rolled of reservedItems) {
          await Inventory.findOneAndUpdate(
            { sku: rolled.sku },
            { $inc: { reservedQuantity: -rolled.quantity } }
          );
        }
        await RabbitMQService.publish('inventory.exchange', 'inventory.event.reservation_failed', {
          eventId: randomUUID(),
          timestamp: new Date().toISOString(),
          correlationId: content.correlationId || 'N/A',
          data: {
            orderId,
            reason: err.message || 'internal_error'
          }
        });
      }
    }
  );

  // 2. Subscribe to order.failed
  await RabbitMQService.subscribe(
    'inventory-order-failed-queue',
    'order.exchange',
    'order.event.failed',
    async (content: any) => {
      const { orderId, items } = content.data;
      console.log(`Saga: Consuming order.failed for order: ${orderId}. Releasing stock...`);

      try {
        for (const item of items) {
          const { sku, quantity } = item;
          await Inventory.findOneAndUpdate(
            { sku },
            { $inc: { reservedQuantity: -quantity } }
          );
        }
        console.log(`Saga: Stock released successfully for order: ${orderId}`);
      } catch (err) {
        console.error(`Saga: Failed to release stock for order ${orderId}:`, err);
      }
    }
  );

  // 3. Subscribe to order.completed to commit stock
  await RabbitMQService.subscribe(
    'inventory-order-completed-queue',
    'order.exchange',
    'order.event.completed',
    async (content: any) => {
      const { orderId, items } = content.data;
      console.log(`Saga: Consuming order.completed for order: ${orderId}. Committing stock...`);

      try {
        for (const item of items) {
          const { sku, quantity } = item;
          await Inventory.findOneAndUpdate(
            { sku },
            { 
              $inc: { 
                quantity: -quantity,
                reservedQuantity: -quantity
              } 
            }
          );
        }
        console.log(`Saga: Stock committed successfully for order: ${orderId}`);
      } catch (err) {
        console.error(`Saga: Failed to commit stock for order ${orderId}:`, err);
      }
    }
  );
};
