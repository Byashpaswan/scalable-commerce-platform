import { Router } from 'express';
import orderRouter from './order.route';

const indexRouter = Router();

indexRouter.use('/orders', orderRouter);

export default indexRouter;
