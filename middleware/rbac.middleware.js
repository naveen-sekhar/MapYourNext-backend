import { AppError } from '../utils/errorHandler.js';

/**
 * Role guard factory — restricts route to specific roles.
 * Usage: authorize('admin', 'moderator')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission for this action', 403)
      );
    }
    next();
  };
};

export default authorize;
