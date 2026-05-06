import User from '../models/User.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, location, avatar, hobbies, preferences } = req.body;
  const update = {};

  if (name) update['profile.name'] = name;
  if (bio !== undefined) update['profile.bio'] = bio;
  if (location !== undefined) update['profile.location'] = location;
  if (avatar) update['profile.avatar'] = avatar;
  if (hobbies) update.hobbies = hobbies;
  if (preferences) update.preferences = preferences;

  const user = await User.findByIdAndUpdate(req.user._id, update, {
    new: true,
    runValidators: true,
  }).populate('hobbies', 'name slug type icon');

  sendResponse(res, 200, { user }, 'Profile updated');
});

export const saveQuizAnswers = asyncHandler(async (req, res) => {
  const { quizAnswers, preferences } = req.body;
  const update = {};
  if (quizAnswers) update.quizAnswers = quizAnswers;
  if (preferences) update.preferences = preferences;

  const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
  sendResponse(res, 200, { user }, 'Quiz answers saved');
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: req.params.id } },
    { new: true }
  );
  sendResponse(res, 200, { wishlist: user.wishlist }, 'Added to wishlist');
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: req.params.id } },
    { new: true }
  );
  sendResponse(res, 200, { wishlist: user.wishlist }, 'Removed from wishlist');
});

export const addToVisited = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { visited: req.params.id } },
    { new: true }
  );
  sendResponse(res, 200, { visited: user.visited }, 'Marked as visited');
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('profile role hobbies createdAt')
    .populate('hobbies', 'name slug icon');

  if (!user) throw new AppError('User not found', 404);
  sendResponse(res, 200, { user });
});

export const searchUsers = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  if (!q) return sendResponse(res, 200, { users: [] });

  const limitNum = Math.min(Number(limit), 20);
  const users = await User.find({
    'profile.name': { $regex: q, $options: 'i' },
    status: 'active'
  })
    .select('profile role createdAt')
    .limit(limitNum)
    .lean();

  sendResponse(res, 200, { users });
});

// Admin: list/search users
export const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, status } = req.query;
  const filter = {};
  if (search) filter['profile.name'] = { $regex: search, $options: 'i' };
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    users,
    pagination: { page: Number(page), limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// Admin: change role or status
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role, status } = req.body;
  const update = {};
  if (role) update.role = role;
  if (status) update.status = status;

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-passwordHash');
  if (!user) throw new AppError('User not found', 404);
  sendResponse(res, 200, { user }, 'User updated');
});
