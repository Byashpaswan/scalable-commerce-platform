import { Request, Response, NextFunction } from 'express';
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
    .replace(/-+$/, '');
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, parentId, isActive } = req.body;

    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) {
        return next(new AppError('Parent category not found', 400));
      }
    }

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      return next(new AppError('Category with this name already exists', 400));
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parentId: parentId || null,
      isActive: isActive !== undefined ? isActive : true
    });

    await CacheService.del('categories:tree');

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cacheKey = 'categories:tree';
    const cachedTree = await CacheService.get(cacheKey);

    if (cachedTree) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cachedTree
      });
    }

    const categories = await Category.find({ isActive: true });
    
    const buildTree = (parentId: string | null = null): any[] => {
      return categories
        .filter((cat) => {
          const parentStr = cat.parentId ? cat.parentId.toString() : null;
          return parentStr === parentId;
        })
        .map((cat) => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          children: buildTree(cat._id.toString())
        }));
    };

    const tree = buildTree(null);

    await CacheService.set(cacheKey, tree, 86400);

    res.status(200).json({
      success: true,
      cached: false,
      data: tree
    });
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    if (updateData.name) {
      updateData.slug = slugify(updateData.name);
    }

    Object.assign(category, updateData);
    await category.save();

    await CacheService.del('categories:tree');

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    next(err);
  }
};
