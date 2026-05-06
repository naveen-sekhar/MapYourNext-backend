import { verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import { AppError } from '../utils/errorHandler.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      throw new AppError('Not authenticated', 401);
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (user.status === 'suspended') {
      throw new AppError('Account suspended', 403);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error.isOperational ? error : new AppError('Not authenticated', 401));
  }
};

export default authMiddleware;
