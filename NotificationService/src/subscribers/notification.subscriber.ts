import { RabbitMQService } from '../services/rabbitmq.service';

export const setupNotificationSubscribers = async () => {
  // 1. Order created notification
  await RabbitMQService.subscribe(
    'notification-order-created-queue',
    'order.exchange',
    'order.event.created',
    async (content: any) => {
      const { orderId, userId, totalAmount } = content.data;
      console.log(`[Notification] Sending Email: Order placed successfully! Order ID: ${orderId}, User ID: ${userId}, Amount: $${totalAmount}`);
    }
  );

  // 2. Payment completed notification
  await RabbitMQService.subscribe(
    'notification-payment-success-queue',
    'payment.exchange',
    'payment.event.completed',
    async (content: any) => {
      const { orderId, transactionId, amount } = content.data;
      console.log(`[Notification] Sending Email Receipt: Payment completed! Order ID: ${orderId}, Transaction ID: ${transactionId}, Amount Paid: $${amount}`);
    }
  );

  // 3. Payment failed notification
  await RabbitMQService.subscribe(
    'notification-payment-fail-queue',
    'payment.exchange',
    'payment.event.failed',
    async (content: any) => {
      const { orderId, reason } = content.data;
      console.log(`[Notification] Sending Alert: Payment failed for Order ID: ${orderId}. Reason: ${reason}`);
    }
  );
};
