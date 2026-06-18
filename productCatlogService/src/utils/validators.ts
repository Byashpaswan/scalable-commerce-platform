import Joi from 'joi';

export const productCreateSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().required(),
  categoryId: Joi.string().required(),
  brand: Joi.string().required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  basePrice: Joi.number().required().min(0),
  attributes: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    value: Joi.string().required()
  })).default([]),
  variants: Joi.array().items(Joi.object({
    sku: Joi.string().required(),
    price: Joi.number().required().min(0),
    attributes: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required()
    })).default([]),
    images: Joi.array().items(Joi.string().uri()).default([])
  })).default([])
});

export const productUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string(),
  categoryId: Joi.string(),
  brand: Joi.string(),
  images: Joi.array().items(Joi.string().uri()),
  basePrice: Joi.number().min(0),
  status: Joi.string().valid('DRAFT', 'ACTIVE', 'INACTIVE'),
  attributes: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    value: Joi.string().required()
  })),
  variants: Joi.array().items(Joi.object({
    sku: Joi.string().required(),
    price: Joi.number().required().min(0),
    attributes: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required()
    })).default([]),
    images: Joi.array().items(Joi.string().uri()).default([])
  }))
});

export const categoryCreateSchema = Joi.object({
  name: Joi.string().required().trim(),
  description: Joi.string().optional(),
  parentId: Joi.string().allow(null).optional(),
  isActive: Joi.boolean().default(true)
});
