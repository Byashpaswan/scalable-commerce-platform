import { Router } from 'express';
import authRouter from './auth';
import userRouter from './user.route';

const indexRouter = Router();

indexRouter.use('/auth', authRouter);
indexRouter.use('/users', userRouter);

export default indexRouter;
