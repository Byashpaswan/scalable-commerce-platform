import jwt from 'jsonwebtoken';
import { IUser } from '../models/user';

export class TokenService {
  public static generateAccessToken(user: IUser): string {
    const secret = process.env.JWT_ACCESS_SECRET || 'your_super_secret_jwt_access_key_123!';
    const expiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    return jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      secret,
      { expiresIn: expiry as any }
    );
  }

  public static generateRefreshToken(user: IUser): string {
    const secret = process.env.JWT_REFRESH_SECRET || 'your_super_secret_jwt_refresh_key_456!';
    const expiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    return jwt.sign(
      { id: user._id, version: user.refreshTokenVersion, email: user.email },
      secret,
      { expiresIn: expiry as any }
    );
  }

  public static verifyRefreshToken(token: string): any {
    const secret = process.env.JWT_REFRESH_SECRET || 'your_super_secret_jwt_refresh_key_456!';
    return jwt.verify(token, secret);
  }
}
