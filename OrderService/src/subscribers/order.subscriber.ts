import { randomUUID } from 'crypto';
import Order from '../models/order';
import { RabbitMQService } from '../services/rabbitmq.service';

export const setupOrderSubscribers = async () => {
  // 1. Subscribe to payment completed
  await RabbitMQService.subscribe(
    'order-payment-success-queue',
    'payment.exchange',
    'payment.event.completed',
    async (content: any) => {
      const { orderId, paymentId } = content.data;
      console.log(`Saga: Consuming payment.completed for order: ${orderId}`);
      await Order.findByIdAndUpdate(orderId, {
        status: 'PROCESSING',
        paymentId
      });
    }
  );

  // 2. Subscribe to payment failed
  await RabbitMQService.subscribe(
    'order-payment-fail-queue',
    'payment.exchange',
    'payment.event.failed',
    async (content: any) => {
      const { orderId } = content.data;
      console.log(`Saga: Consuming payment.failed for order: ${orderId}`);
      const order = await Order.findByIdAndUpdate(orderId, { status: 'CANCELLED' }, { new: true });
      
      if (order) {
        await RabbitMQService.publish('order.exchange', 'order.event.failed', {
          eventId: randomUUID(),
          timestamp: new Date().toISOString(),
          correlationId: content.correlationId || 'N/A',
          data: {
            orderId: order._id,
            items: order.items.map(item => ({
              sku: item.variantSku,
              quantity: item.quantity
            }))
          }
        });
      }
    }
  );

  // 3. Subscribe to inventory reservation failure
  await RabbitMQService.subscribe(
    'order-inventory-fail-queue',
    'inventory.exchange',
    'inventory.event.reservation_failed',
    async (content: any) => {
      const { orderId } = content.data;
      console.log(`Saga: Consuming inventory.reservation_failed for order: ${orderId}`);
      await Order.findByIdAndUpdate(orderId, { status: 'CANCELLED' });
    }
  );
};
