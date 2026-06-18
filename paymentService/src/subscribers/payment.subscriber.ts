import { randomUUID } from 'crypto';
import Payment from '../models/payment';
import { RabbitMQService } from '../services/rabbitmq.service';

export const setupPaymentSubscribers = async () => {
  await RabbitMQService.subscribe(
    'payment-inventory-reserved-queue',
    'inventory.exchange',
    'inventory.event.reserved',
    async (content: any) => {
      const { orderId, userId, totalAmount } = content.data;
      console.log(`Saga: Consuming inventory.reserved. Processing payment of $${totalAmount} for order: ${orderId}`);

      try {
        const paymentRecord = await Payment.create({
          orderId,
          userId,
          amount: totalAmount,
          currency: 'USD',
          status: 'PENDING',
          method: 'STRIPE'
        });

        // 90% success rate simulation
        const isSuccess = Math.random() > 0.1; 

        if (isSuccess) {
          const mockTransactionId = 'txn_' + randomUUID().replace(/-/g, '').slice(0, 16);
          paymentRecord.status = 'COMPLETED';
          paymentRecord.transactionId = mockTransactionId;
          paymentRecord.gatewayResponse = { gateway: 'stripe', status: 'succeeded' };
          await paymentRecord.save();

          console.log(`Payment successful. TxnId: ${mockTransactionId}`);

          await RabbitMQService.publish('payment.exchange', 'payment.event.completed', {
            eventId: randomUUID(),
            timestamp: new Date().toISOString(),
            correlationId: content.correlationId || 'N/A',
            data: {
              orderId,
              paymentId: paymentRecord._id,
              transactionId: mockTransactionId,
              amount: totalAmount
            }
          });
        } else {
          paymentRecord.status = 'FAILED';
          paymentRecord.gatewayResponse = { gateway: 'stripe', error: 'card_declined' };
          await paymentRecord.save();

          console.warn(`Payment failed for order: ${orderId}`);

          await RabbitMQService.publish('payment.exchange', 'payment.event.failed', {
            eventId: randomUUID(),
            timestamp: new Date().toISOString(),
            correlationId: content.correlationId || 'N/A',
            data: {
              orderId,
              reason: 'card_declined'
            }
          });
        }
      } catch (err: any) {
        console.error('Failed to process payment in subscriber:', err);
        await RabbitMQService.publish('payment.exchange', 'payment.event.failed', {
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
};
