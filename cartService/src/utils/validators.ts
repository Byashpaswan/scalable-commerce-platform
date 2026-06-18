import Joi from 'joi';

export const cartItemSchema = Joi.object({
  productId: Joi.string().required(),
  variantSku: Joi.string().required(),
  name: Joi.string().required(),
  price: Joi.number().required().min(0),
  quantity: Joi.number().required().min(1)
});

export const removeCartItemSchema = Joi.object({
  variantSku: Joi.string().required()
});
