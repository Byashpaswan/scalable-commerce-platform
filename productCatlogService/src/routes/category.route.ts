import { Router } from 'express';
import { createCategory, updateCategory, getCategories, getCategoryById } from '../controller/categoryController';
import { authenticate, restrictTo } from '../middlware/auth';
import { validate } from '../middlware/validate';
import { categoryCreateSchema } from '../utils/validators';

const categoryRouter = Router();

categoryRouter.get('/', getCategories);
categoryRouter.get('/:id', getCategoryById);

categoryRouter.post('/', authenticate, restrictTo('ADMIN', 'SUPER_ADMIN'), validate(categoryCreateSchema), createCategory);
categoryRouter.patch('/:id', authenticate, restrictTo('ADMIN', 'SUPER_ADMIN'), updateCategory);

export default categoryRouter;
