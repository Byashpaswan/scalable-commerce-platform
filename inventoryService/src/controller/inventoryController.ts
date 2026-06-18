import { Request, Response, NextFunction } from 'express';
import Inventory from '../models/inventory';
import { AppError } from '../utils/errors';

export const updateStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, sku, quantity, reorderLevel } = req.body;

    let inventory = await Inventory.findOne({ sku });
    if (!inventory) {
      inventory = new Inventory({
        productId,
        sku,
        quantity,
        reorderLevel: reorderLevel || 10
      });
    } else {
      inventory.quantity = quantity;
      if (reorderLevel !== undefined) {
        inventory.reorderLevel = reorderLevel;
      }
    }

    await inventory.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: inventory
    });
  } catch (err) {
    next(err);
  }
};

export const getStockBySku = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sku } = req.params;
    const inventory = await Inventory.findOne({ sku });

    if (!inventory) {
      return res.status(200).json({
        success: true,
        data: {
          sku,
          availableStock: 0
        }
      });
    }

    const availableStock = Math.max(0, inventory.quantity - inventory.reservedQuantity);

    res.status(200).json({
      success: true,
      data: {
        sku,
        quantity: inventory.quantity,
        reservedQuantity: inventory.reservedQuantity,
        availableStock
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Reserve stock atomic operation.
 * Uses atomic MongoDB updates to prevent double-reservation race conditions.
 */
export const reserveStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body; // array of { productId, sku, quantity }
    const reservedItems: any[] = [];

    // To be atomic, we try to reserve one by one.
    // If any reservation fails, we roll back (release) all previously reserved items in this request.
    for (const item of items) {
      const { sku, quantity } = item;

      // Find the inventory doc, ensuring (quantity - reservedQuantity >= request_quantity)
      // Mongoose update query returns null if document doesn't match criteria
      const updated = await Inventory.findOneAndUpdate(
        {
          sku,
          $expr: {
            $gte: [
              { $subtract: ['$quantity', '$reservedQuantity'] },
              quantity
            ]
          }
        },
        {
          $inc: { reservedQuantity: quantity }
        },
        { new: true }
      );

      if (!updated) {
        // Rollback already reserved items
        for (const rolled of reservedItems) {
          await Inventory.findOneAndUpdate(
            { sku: rolled.sku },
            { $inc: { reservedQuantity: -rolled.quantity } }
          );
        }
        return next(new AppError(`Insufficient stock for SKU: ${sku}`, 400));
      }

      reservedItems.push({ sku, quantity });
    }

    res.status(200).json({
      success: true,
      message: 'Stock reserved successfully',
      data: reservedItems
    });
  } catch (err) {
    next(err);
  }
};

export const releaseStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body; // array of { sku, quantity }

    for (const item of items) {
      const { sku, quantity } = item;
      await Inventory.findOneAndUpdate(
        { sku },
        { $inc: { reservedQuantity: -quantity } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Stock released successfully'
    });
  } catch (err) {
    next(err);
  }
};

export const commitStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { items } = req.body; // array of { sku, quantity }

    for (const item of items) {
      const { sku, quantity } = item;
      
      // Decrease both actual quantity and reserved quantity (since order is paid/shipped)
      await Inventory.findOneAndUpdate(
        { sku },
        { 
          $inc: { 
            quantity: -quantity,
            reservedQuantity: -quantity
          } 
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Stock committed successfully'
    });
  } catch (err) {
    next(err);
  }
};
