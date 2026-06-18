import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';

import { database } from './config/db';
import indexRouter from './routes/index.route';
import { correlationIdMiddleware } from './middlware/correlation';
import { errorHandler } from './middlware/error';
import { RabbitMQService } from './services/rabbitmq.service';
import { setupOrderSubscribers } from './subscribers/order.subscriber';

const app = express();

database.connect();

RabbitMQService.connect().then(() => {
  setupOrderSubscribers();
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

app.use('/api', indexRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    correlationId: req.correlationId,
  });
});

app.use(errorHandler);

export default app;
