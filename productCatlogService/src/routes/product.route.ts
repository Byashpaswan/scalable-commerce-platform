import { Router } from 'express';
import { createProduct, updateProduct, getProducts, getProductById, deleteProduct } from '../controller/productController';
import { authenticate, restrictTo } from '../middlware/auth';
import { validate } from '../middlware/validate';
import { productCreateSchema, productUpdateSchema } from '../utils/validators';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.get('/:id', getProductById);

productRouter.post('/', authenticate, restrictTo('SELLER', 'ADMIN', 'SUPER_ADMIN'), validate(productCreateSchema), createProduct);
productRouter.patch('/:id', authenticate, restrictTo('SELLER', 'ADMIN', 'SUPER_ADMIN'), validate(productUpdateSchema), updateProduct);
productRouter.delete('/:id', authenticate, restrictTo('SELLER', 'ADMIN', 'SUPER_ADMIN'), deleteProduct);

export default productRouter;
