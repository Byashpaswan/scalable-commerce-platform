import { Router } from 'express';
import productRouter from './product.route';
import categoryRouter from './category.route';

const indexRouter = Router();

indexRouter.use('/products', productRouter);
indexRouter.use('/categories', categoryRouter);

export default indexRouter;
