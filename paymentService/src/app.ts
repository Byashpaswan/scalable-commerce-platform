import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';

import { database } from './config/db';
import { correlationIdMiddleware } from './middlware/correlation';
import { errorHandler } from './middlware/error';
import { RabbitMQService } from './services/rabbitmq.service';
import { setupPaymentSubscribers } from './subscribers/payment.subscriber';
import paymentRouter from './routes/payment.route';

const app = express();

database.connect();

RabbitMQService.connect().then(() => {
  setupPaymentSubscribers();
});

app.use(correlationIdMiddleware);
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/payments', paymentRouter);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Payment-Service' });
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    correlationId: req.correlationId,
  });
});

app.use(errorHandler);

export default app;
