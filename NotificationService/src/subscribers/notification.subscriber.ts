import { randomUUID } from 'crypto';
import { RabbitMQService } from '../services/rabbitmq.service';
import { EmailService } from '../services/email.service';

export const setupNotificationSubscribers = async () => {
  // 1. Welcome registration email
  await RabbitMQService.subscribe(
    'notification-user-registered-queue',
    'user.exchange',
    'user.event.registered',
    async (content: any) => {
      const { firstName, email } = content.data;
      console.log(`[Notification] Consuming user.registered for user: ${email}`);

      const subject = `Welcome to Antigravity Shop, ${firstName}! 🎉`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4facfe; text-align: center;">Welcome to Antigravity Shop!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for registering on our multi-vendor platform. We are thrilled to have you here!</p>
          <p>Explore thousands of premium products from diverse vendors or start selling today.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:4200/products" style="background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Shop Premium Hardware</a>
          </div>
          <p>If you have any questions, feel free to reply to this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 0.8rem; color: #888; text-align: center;">&copy; 2026 Antigravity Shop. All rights reserved.</p>
        </div>
      `;

      await EmailService.sendEmail(email, subject, html);
    }
  );

  // 2. Order created notification email
  await RabbitMQService.subscribe(
    'notification-order-created-queue',
    'order.exchange',
    'order.event.created',
    async (content: any) => {
      const { orderId, email, items, totalAmount } = content.data;
      const targetEmail = email || 'customer@example.com';
      console.log(`[Notification] Consuming order.created for order ID: ${orderId}`);

      const subject = `Order Placed Successfully! Order #${orderId.slice(-6).toUpperCase()}`;
      const itemsHtml = items.map((item: any) => `<li>SKU: ${item.sku} (Quantity: ${item.quantity})</li>`).join('');

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #4facfe;">Order Placed! 🚀</h2>
          <p>Thank you for your purchase. Your order has been placed and is currently waiting for payment confirmation.</p>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Total Amount:</strong> $${totalAmount}</p>
          <h3>Items Ordered:</h3>
          <ul>
            ${itemsHtml}
          </ul>
          <p>We will email you again as soon as your payment is processed.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 0.8rem; color: #888;">&copy; 2026 Antigravity Shop. All rights reserved.</p>
        </div>
      `;

      await EmailService.sendEmail(targetEmail, subject, html);
    }
  );

  // 3. Payment completed receipt email
  await RabbitMQService.subscribe(
    'notification-payment-success-queue',
    'payment.exchange',
    'payment.event.completed',
    async (content: any) => {
      const { orderId, transactionId, amount, email } = content.data;
      const targetEmail = email || 'customer@example.com';
      console.log(`[Notification] Consuming payment.completed for order: ${orderId}`);

      const subject = `Payment Confirmed! Receipt for Order #${orderId.slice(-6).toUpperCase()}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #2ed573;">Payment Successful! 🎉</h2>
          <p>Great news! We have successfully received your payment for order #${orderId.slice(-6).toUpperCase()}.</p>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Amount Paid:</strong> $${amount}</p>
          <p>Your order is now being processed by the vendor and will be shipped shortly.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:4200/products" style="background: #2ed573; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Continue Shopping</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 0.8rem; color: #888;">&copy; 2026 Antigravity Shop. All rights reserved.</p>
        </div>
      `;

      await EmailService.sendEmail(targetEmail, subject, html);
    }
  );

  // 4. Payment failed notification email
  await RabbitMQService.subscribe(
    'notification-payment-fail-queue',
    'payment.exchange',
    'payment.event.failed',
    async (content: any) => {
      const { orderId, reason, email } = content.data;
      const targetEmail = email || 'customer@example.com';
      console.log(`[Notification] Consuming payment.failed for order: ${orderId}`);

      const subject = `Payment Failed - Action Required: Order #${orderId.slice(-6).toUpperCase()}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #ff4757;">Payment Declined ⚠️</h2>
          <p>We were unable to process your payment for order #${orderId.slice(-6).toUpperCase()}.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Your order has been cancelled automatically. Please verify your payment details and place the order again.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:4200/cart" style="background: #ff4757; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Shopping Cart</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 0.8rem; color: #888;">&copy; 2026 Antigravity Shop. All rights reserved.</p>
        </div>
      `;

      await EmailService.sendEmail(targetEmail, subject, html);
    }
  );
};
