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

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().max(100),
  lastName: Joi.string().allow('').max(100),
  phoneNumber: Joi.string().optional()
});

export const addressSchema = Joi.object({
  type: Joi.string().valid('HOME', 'WORK', 'OTHER').default('HOME'),
  fullName: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().allow(''),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().default('India'),
  postalCode: Joi.string().required(),
  isDefault: Joi.boolean().default(false)
});
