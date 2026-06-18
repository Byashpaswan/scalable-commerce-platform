import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import Order from '../models/order';
import { RabbitMQService } from '../services/rabbitmq.service';
import { AppError } from '../utils/errors';

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items, shippingAddress, idempotencyKey } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User authentication missing', 400));
    }

    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: 'Order already exists (Idempotent response)',
        data: existingOrder
      });
    }

    let subTotal = 0;
    for (const item of items) {
      subTotal += item.price * item.quantity;
    }
    const tax = Math.round(subTotal * 0.08 * 100) / 100;
    const shippingFee = subTotal > 100 ? 0 : 10;
    const grandTotal = Math.round((subTotal + tax + shippingFee) * 100) / 100;

    const newOrder = await Order.create({
      userId,
      idempotencyKey,
      items,
      pricing: {
        subTotal,
        tax,
        shippingFee,
        discount: 0,
        grandTotal
      },
      shippingAddress,
      status: 'PENDING_PAYMENT'
    });

    const eventPayload = {
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
      correlationId: req.correlationId || 'N/A',
      data: {
        orderId: newOrder._id,
        userId,
        email: req.user?.email,
        items: items.map((item: any) => ({
          productId: item.productId,
          sku: item.variantSku,
          quantity: item.quantity
        })),
        totalAmount: grandTotal
      }
    };

    await RabbitMQService.publish('order.exchange', 'order.event.created', eventPayload);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully. Processing payment...',
      data: newOrder
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    if (order.userId.toString() !== userId && userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return next(new AppError('Unauthorized access to order', 403));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};
