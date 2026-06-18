import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string().required().max(100),
  lastName: Joi.string().allow('').max(100),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phoneNumber: Joi.string().optional(),
  role: Joi.string().valid('CUSTOMER', 'SELLER', 'ADMIN', 'SUPPORT').default('CUSTOMER')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
