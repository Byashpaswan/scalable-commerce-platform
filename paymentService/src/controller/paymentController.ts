import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import Payment from '../models/payment';
import { RabbitMQService } from '../services/rabbitmq.service';
import { AppError } from '../utils/errors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_12345', {
  apiVersion: '2024-04-10' as any
});

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, items } = req.body;
    const userEmail = req.headers['x-user-email'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!orderId || !items || items.length === 0) {
      return next(new AppError('OrderId and items are required', 400));
    }

    const amountTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_stripe_key_12345';
    const isMock = stripeKey === 'sk_test_mock_stripe_key_12345' || stripeKey.includes('mock');

    if (isMock) {
      console.log(`[Payment Service] Mock Stripe key detected. Generating mock checkout session for order ${orderId}`);
      const mockSessionId = `mock_cs_${randomUUID().replace(/-/g, '')}`;
      const mockUrl = `http://localhost:4200/checkout/mock-stripe-payment?orderId=${orderId}&sessionId=${mockSessionId}&amount=${amountTotal}&email=${encodeURIComponent(userEmail || '')}&userId=${userId || ''}`;

      await Payment.create({
        orderId,
        userId,
        amount: amountTotal,
        currency: 'USD',
        status: 'PENDING',
        method: 'STRIPE',
        transactionId: mockSessionId
      });

      return res.status(200).json({
        success: true,
        url: mockUrl,
        sessionId: mockSessionId
      });
    }

    // Otherwise use real Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          metadata: { productId: item.productId }
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `http://localhost:4200/checkout/success?orderId=${orderId}`,
        cancel_url: `http://localhost:4200/checkout/cancel?orderId=${orderId}`,
        metadata: {
          orderId,
          userId,
          email: userEmail
        }
      });

      await Payment.create({
        orderId,
        userId,
        amount: (session.amount_total || 0) / 100,
        currency: 'USD',
        status: 'PENDING',
        method: 'STRIPE',
        transactionId: session.id
      });

      res.status(200).json({
        success: true,
        url: session.url,
        sessionId: session.id
      });
    } catch (stripeErr: any) {
      console.error('[Payment Service] Stripe API call failed. Falling back to mock session:', stripeErr.message);
      const mockSessionId = `mock_cs_${randomUUID().replace(/-/g, '')}`;
      const mockUrl = `http://localhost:4200/checkout/mock-stripe-payment?orderId=${orderId}&sessionId=${mockSessionId}&amount=${amountTotal}&email=${encodeURIComponent(userEmail || '')}&userId=${userId || ''}`;

      await Payment.create({
        orderId,
        userId,
        amount: amountTotal,
        currency: 'USD',
        status: 'PENDING',
        method: 'STRIPE',
        transactionId: mockSessionId
      });

      res.status(200).json({
        success: true,
        url: mockUrl,
        sessionId: mockSessionId
      });
    }
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const event = req.body;
    console.log(`[Payment Webhook] Received Stripe event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;
      const email = session.metadata?.email;
      const amount = (session.amount_total || 0) / 100;

      console.log(`[Payment Webhook] Checkout succeeded for order: ${orderId}`);

      const payment = await Payment.findOne({ orderId });
      if (payment) {
        payment.status = 'COMPLETED';
        payment.transactionId = session.payment_intent as string;
        payment.gatewayResponse = session;
        await payment.save();
      }

      await RabbitMQService.publish('payment.exchange', 'payment.event.completed', {
        eventId: randomUUID(),
        timestamp: new Date().toISOString(),
        correlationId: 'webhook-tracing',
        data: {
          orderId,
          paymentId: payment ? payment._id : randomUUID(),
          transactionId: session.payment_intent as string,
          amount,
          email
        }
      });
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).send('Webhook Error');
  }
};
