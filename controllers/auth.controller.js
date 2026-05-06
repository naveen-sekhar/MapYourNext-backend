import User from '../models/User.js';
import { signToken, cookieOptions } from '../config/jwt.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw new AppError('Email, password, and name are required', 400);
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const user = await User.create({
    email,
    passwordHash: password, // pre-save hook hashes it
    profile: { name },
  });

  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());

  const userObj = user.toJSON();
  delete userObj.passwordHash;

  sendResponse(res, 201, { user: userObj, token }, 'Registration successful');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status === 'suspended') {
    throw new AppError('Account suspended', 403);
  }

  const token = signToken(user._id);
  res.cookie('token', token, cookieOptions());

  const userObj = user.toJSON();
  delete userObj.passwordHash;

  sendResponse(res, 200, { user: userObj, token }, 'Login successful');
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('hobbies', 'name slug type icon')
    .populate('wishlist', 'name slug media.coverImage')
    .populate('visited', 'name slug media.coverImage');

  sendResponse(res, 200, { user });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', { ...cookieOptions(), maxAge: 1 });
  sendResponse(res, 200, null, 'Logged out');
});
