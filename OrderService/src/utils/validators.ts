import Joi from 'joi';

export const orderCreateSchema = Joi.object({
  idempotencyKey: Joi.string().required(),
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    variantSku: Joi.string().required(),
    name: Joi.string().required(),
    price: Joi.number().required().min(0),
    quantity: Joi.number().required().min(1)
  })).required().min(1),
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    addressLine1: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    postalCode: Joi.string().required()
  }).required()
});
