import { Router } from 'express';
import { createOrder, getOrderById, getMyOrders } from '../controller/orderController';
import { authenticate } from '../middlware/auth';
import { validate } from '../middlware/validate';
import { orderCreateSchema } from '../utils/validators';

const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post('/', validate(orderCreateSchema), createOrder);
orderRouter.get('/my-orders', getMyOrders);
orderRouter.get('/:id', getOrderById);

export default orderRouter;
