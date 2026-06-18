import { Router } from 'express';
import { updateStock, getStockBySku, reserveStock, releaseStock, commitStock } from '../controller/inventoryController';
import { authenticate, restrictTo } from '../middlware/auth';
import { validate } from '../middlware/validate';
import { updateStockSchema, reserveStockSchema } from '../utils/validators';

const inventoryRouter = Router();

inventoryRouter.get('/:sku', getStockBySku);

inventoryRouter.post('/update', authenticate, restrictTo('SELLER', 'ADMIN', 'SUPER_ADMIN'), validate(updateStockSchema), updateStock);

inventoryRouter.post('/reserve', validate(reserveStockSchema), reserveStock);
inventoryRouter.post('/release', releaseStock);
inventoryRouter.post('/commit', commitStock);

export default inventoryRouter;
