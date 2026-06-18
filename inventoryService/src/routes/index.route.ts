import { Router } from 'express';
import inventoryRouter from './inventory.route';

const indexRouter = Router();

indexRouter.use('/inventory', inventoryRouter);

export default indexRouter;
