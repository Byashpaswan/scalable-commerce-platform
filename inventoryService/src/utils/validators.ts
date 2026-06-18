import Joi from 'joi';

export const updateStockSchema = Joi.object({
  productId: Joi.string().required(),
  sku: Joi.string().required(),
  quantity: Joi.number().required().min(0),
  reorderLevel: Joi.number().optional().min(0)
});

export const reserveStockSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    sku: Joi.string().required(),
    quantity: Joi.number().required().min(1)
  })).required()
});
