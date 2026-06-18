import { Router } from 'express';
import cartRouter from './cart.route';

const indexRouter = Router();

indexRouter.use('/cart', cartRouter);

export default indexRouter;
