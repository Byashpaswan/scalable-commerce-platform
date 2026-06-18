import { Request, Response, NextFunction } from 'express';
import User from '../../models/user';
import { AppError } from '../../utils/errors';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, phoneNumber } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (firstName) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber, _id: { $ne: userId } });
      if (existingPhone) {
        return next(new AppError('Phone number already in use', 400));
      }
      user.phoneNumber = phoneNumber;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const getAddresses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('addresses');
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const addAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const addressData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    if (addressData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(addressData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;
    const addressData = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const address = user.addresses.find((addr) => addr._id?.toString() === addressId);
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    if (addressData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    Object.assign(address, addressData);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter((addr) => addr._id?.toString() !== addressId);
    
    if (user.addresses.length === initialLength) {
      return next(new AppError('Address not found', 404));
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

// Admin handlers
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'BLOCKED', 'SUSPENDED'].includes(status)) {
      return next(new AppError('Invalid status value', 400));
    }

    const user = await User.findById(id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
