import asyncHandler from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const decoded = verifyToken(token);
    // Use lean() for faster queries - we don't need mongoose document methods
    const user = await User.findById(decoded.id).select('-password').lean();

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    // Normalize _id to id for consistency (token uses 'id', MongoDB uses '_id')
    req.user = { ...user, id: user._id };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    return next();
  };

