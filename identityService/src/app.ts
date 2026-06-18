import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { database } from './config/db';
import authRouter from './routes/auth';
import { correlationIdMiddleware } from './middlware/correlation';
import { errorHandler } from './middlware/error';
import { RabbitMQService } from './services/rabbitmq.service';

const app = express();

database.connect();
RabbitMQService.connect();

app.use(correlationIdMiddleware);
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    correlationId: req.correlationId,
  });
});

app.use(errorHandler);

export default app;
