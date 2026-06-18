import { Router } from 'express';
import { 
  getProfile, 
  updateProfile, 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress,
  getAllUsers,
  getUserById,
  updateUserStatus
} from '../controller/users/userController';
import { authenticate, restrictTo } from '../middlware/auth';
import { validate } from '../middlware/validate';
import { updateProfileSchema, addressSchema } from '../utils/validators';

const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/profile', getProfile);
userRouter.patch('/profile', validate(updateProfileSchema), updateProfile);

userRouter.get('/addresses', getAddresses);
userRouter.post('/addresses', validate(addressSchema), addAddress);
userRouter.put('/addresses/:addressId', validate(addressSchema), updateAddress);
userRouter.delete('/addresses/:addressId', deleteAddress);

userRouter.get('/', restrictTo('ADMIN', 'SUPER_ADMIN'), getAllUsers);
userRouter.get('/:id', restrictTo('ADMIN', 'SUPER_ADMIN'), getUserById);
userRouter.patch('/:id/status', restrictTo('ADMIN', 'SUPER_ADMIN'), updateUserStatus);

export default userRouter;
