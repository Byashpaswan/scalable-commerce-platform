import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';

import { RabbitMQService } from './services/rabbitmq.service';
import { setupNotificationSubscribers } from './subscribers/notification.subscriber';

const app = express();

RabbitMQService.connect().then(() => {
  setupNotificationSubscribers();
});

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Notification-Service' });
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

export default app;
