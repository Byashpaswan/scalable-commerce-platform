import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import Category from '../models/category';
import { CacheService } from '../services/cache.service';
import { AppError } from '../utils/errors';

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') + '-' + Date.now().toString().slice(-4);
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, categoryId, brand, images, basePrice, attributes, variants } = req.body;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 400));
    }

    const sellerId = req.user?.id;
    if (!sellerId) {
      return next(new AppError('Seller context missing', 400));
    }

    const slug = slugify(name);

    const product = await Product.create({
      sellerId,
      name,
      slug,
      description,
      categoryId,
      brand,
      images,
      basePrice,
      attributes,
      variants,
      status: 'ACTIVE'
    });

    // Invalidate product listing caches
    await CacheService.invalidatePattern('products:list:*');

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Owner check or Admin check
    if (product.sellerId.toString() !== userId && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return next(new AppError('Unauthorized to update this product', 403));
    }

    if (updateData.name) {
      updateData.slug = slugify(updateData.name);
    }

    Object.assign(product, updateData);
    await product.save();

    // Cache invalidation
    await CacheService.del(`product:${id}`);
    await CacheService.invalidatePattern('products:list:*');

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const categoryId = (req.query.categoryId as string) || '';
    const brand = (req.query.brand as string) || '';
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice = parseFloat(req.query.maxPrice as string) || Infinity;

    // Cache key based on query filters to isolate cached results
    const cacheKey = `products:list:page=${page}:limit=${limit}:search=${search}:cat=${categoryId}:brand=${brand}:price=${minPrice}-${maxPrice}`;
    const cachedProducts = await CacheService.get(cacheKey);

    if (cachedProducts) {
      return res.status(200).json({
        success: true,
        cached: true,
        ...cachedProducts
      });
    }

    const query: any = { status: 'ACTIVE' };

    if (search) {
      query.$text = { $search: search };
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (brand) {
      query.brand = brand;
    }
    if (minPrice > 0 || maxPrice < Infinity) {
      query.basePrice = { $gte: minPrice };
      if (maxPrice < Infinity) {
        query.basePrice.$lte = maxPrice;
      }
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 });

    const result = {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      data: products
    };

    // Cache for 5 minutes (300 seconds)
    await CacheService.set(cacheKey, result, 300);

    res.status(200).json({
      success: true,
      cached: false,
      ...result
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;
    
    const cachedProduct = await CacheService.get(cacheKey);
    if (cachedProduct) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cachedProduct
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    await CacheService.set(cacheKey, product, 3600); // Cache for 1 hour

    res.status(200).json({
      success: true,
      cached: false,
      data: product
    });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const product = await Product.findById(id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.sellerId.toString() !== userId && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return next(new AppError('Unauthorized to delete this product', 403));
    }

    // Perform soft delete
    product.status = 'INACTIVE';
    await product.save();

    await CacheService.del(`product:${id}`);
    await CacheService.invalidatePattern('products:list:*');

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully (deactivated)'
    });
  } catch (err) {
    next(err);
  }
};
