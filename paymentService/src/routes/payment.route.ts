import { Router } from 'express';
import { createCheckoutSession, stripeWebhook } from '../controller/paymentController';

const paymentRouter = Router();

paymentRouter.post('/create-checkout-session', createCheckoutSession);
paymentRouter.post('/webhook', stripeWebhook);

export default paymentRouter;
