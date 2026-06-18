import { Router } from 'express';
import { getCart, addItem, updateQuantity, removeItem, clearCart } from '../controller/cartController';
import { authenticate } from '../middlware/auth';
import { validate } from '../middlware/validate';
import { cartItemSchema, removeCartItemSchema } from '../utils/validators';

const cartRouter = Router();

cartRouter.use(authenticate);

cartRouter.get('/', getCart);
cartRouter.post('/add', validate(cartItemSchema), addItem);
cartRouter.patch('/update-quantity', updateQuantity);
cartRouter.post('/remove', validate(removeCartItemSchema), removeItem);
cartRouter.delete('/clear', clearCart);

export default cartRouter;
