import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { AppError } from '../utils/errors';

const CART_TTL = 14 * 24 * 60 * 60; // 14 days in seconds

interface ICartItem {
  productId: string;
  variantSku: string;
  name: string;
  price: number;
  quantity: number;
}

interface ICart {
  items: ICartItem[];
}

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const key = `cart:${userId}`;
    const cartData = await redis.get(key);

    const cart: ICart = cartData ? JSON.parse(cartData) : { items: [] };

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const newItem: ICartItem = req.body;
    const key = `cart:${userId}`;

    const cartData = await redis.get(key);
    const cart: ICart = cartData ? JSON.parse(cartData) : { items: [] };

    const existingIndex = cart.items.findIndex(
      (item) => item.variantSku === newItem.variantSku
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += newItem.quantity;
    } else {
      cart.items.push(newItem);
    }

    await redis.set(key, JSON.stringify(cart), 'EX', CART_TTL);

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

export const updateQuantity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { variantSku, quantity } = req.body;
    const key = `cart:${userId}`;

    const cartData = await redis.get(key);
    if (!cartData) {
      return next(new AppError('Cart not found', 404));
    }

    const cart: ICart = JSON.parse(cartData);
    const itemIndex = cart.items.findIndex((item) => item.variantSku === variantSku);

    if (itemIndex === -1) {
      return next(new AppError('Item not found in cart', 404));
    }

    cart.items[itemIndex].quantity = quantity;

    await redis.set(key, JSON.stringify(cart), 'EX', CART_TTL);

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { variantSku } = req.body;
    const key = `cart:${userId}`;

    const cartData = await redis.get(key);
    if (!cartData) {
      return next(new AppError('Cart not found', 404));
    }

    const cart: ICart = JSON.parse(cartData);
    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.variantSku !== variantSku);

    if (cart.items.length === initialLength) {
      return next(new AppError('Item not found in cart', 404));
    }

    await redis.set(key, JSON.stringify(cart), 'EX', CART_TTL);

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const key = `cart:${userId}`;

    await redis.del(key);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (err) {
    next(err);
  }
};
