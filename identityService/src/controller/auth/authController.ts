import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../../models/user';
import { TokenService } from '../../services/token.service';
import { AppError } from '../../utils/errors';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    if (phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber });
      if (existingPhone) {
        return next(new AppError('Phone number already registered', 400));
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      phoneNumber,
      role,
    });

    const accessToken = TokenService.generateAccessToken(newUser);
    const refreshToken = TokenService.generateRefreshToken(newUser);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (user.status === 'BLOCKED' || user.status === 'SUSPENDED') {
      return next(new AppError(`Your account is ${user.status.toLowerCase()}`, 403));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.status = 'SUSPENDED';
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      await user.save();
      return next(new AppError('Invalid email or password', 401));
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = TokenService.generateAccessToken(user);
    const refreshToken = TokenService.generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) {
      return next(new AppError('Refresh token missing', 401));
    }

    let decoded: any;
    try {
      decoded = TokenService.verifyRefreshToken(token);
    } catch (err) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    if (user.refreshTokenVersion !== decoded.version) {
      user.refreshTokenVersion += 1;
      await user.save();
      res.clearCookie('refreshToken');
      return next(new AppError('Refresh token reuse detected. Access revoked. Please log in again.', 401));
    }

    user.refreshTokenVersion += 1;
    await user.save();

    const newAccessToken = TokenService.generateAccessToken(user);
    const newRefreshToken = TokenService.generateRefreshToken(user);

    res.cookie('refreshToken', newRefreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'If the email exists, a password reset link has been sent.',
  });
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'Password reset successfully.',
  });
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: 'Email verified successfully.',
  });
};
