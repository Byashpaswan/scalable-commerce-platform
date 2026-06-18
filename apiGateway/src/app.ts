import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import proxy from 'express-http-proxy';
import { randomUUID } from 'crypto';

import { rateLimiter } from './middleware/rateLimiter';
import { authGateway } from './middleware/authGateway';

const app = express();

app.use((req, res, next) => {
  const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
  req.headers['x-correlation-id'] = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
});

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(helmet());
app.use(compression());

app.use(rateLimiter(200, 60));

app.use(authGateway);

const services = {
  identity: process.env.IDENTITY_SERVICE_URL || 'http://127.0.0.1:3002',
  user: process.env.USER_SERVICE_URL || 'http://127.0.0.1:3001',
  product: process.env.PRODUCT_SERVICE_URL || 'http://127.0.0.1:3003',
  order: process.env.ORDER_SERVICE_URL || 'http://127.0.0.1:3004',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://127.0.0.1:3005',
  inventory: process.env.INVENTORY_SERVICE_URL || 'http://127.0.0.1:3006',
  cart: process.env.CART_SERVICE_URL || 'http://127.0.0.1:3007',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://127.0.0.1:3008',
};

app.use('/api/v1/auth', proxy(services.identity, {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/api/v1/auth', '/api/auth')
}));

app.use('/api/v1/users', proxy(services.user, {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/api/v1/users', '/api/users')
}));

app.use('/api/v1/products', proxy(services.product, {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/api/v1/products', '/api/products')
}));

app.use('/api/v1/orders', proxy(services.order, {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/api/v1/orders', '/api/orders')
}));

app.use('/api/v1/payments', proxy(services.payment, {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/api/v1/payments', '/api/payments')
}));

app.use('/api/v1/inventory', proxy(services.inventory, {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/api/v1/inventory', '/api/inventory')
}));

app.use('/api/v1/cart', proxy(services.cart, {
  proxyReqPathResolver: (req) => req.originalUrl.replace('/api/v1/cart', '/api/cart')
}));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'API-Gateway' });
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error('Gateway Error:', err);
  res.status(500).json({
    success: false,
    message: 'Bad gateway or downstream service unavailable',
  });
});

export default app;
