import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const followUser = asyncHandler(async (req, res) => {
  if (req.params.userId === req.user._id.toString()) {
    throw new AppError('Cannot follow yourself', 400);
  }

  const follow = await Follow.create({
    follower: req.user._id,
    following: req.params.userId,
  });

  // Create notification
  await Notification.create({
    recipient: req.params.userId,
    type: 'follow',
    referenceType: 'user',
    referenceId: req.user._id,
    message: `${req.user.profile.name} started following you`,
  });

  sendResponse(res, 201, { follow }, 'Followed');
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const result = await Follow.findOneAndDelete({
    follower: req.user._id,
    following: req.params.userId,
  });
  if (!result) throw new AppError('Not following this user', 404);
  sendResponse(res, 200, null, 'Unfollowed');
});

export const getFollowers = asyncHandler(async (req, res) => {
  const followers = await Follow.find({ following: req.params.userId })
    .populate('follower', 'profile.name profile.avatar')
    .lean();
  sendResponse(res, 200, { followers, count: followers.length });
});

export const getFollowing = asyncHandler(async (req, res) => {
  const following = await Follow.find({ follower: req.params.userId })
    .populate('following', 'profile.name profile.avatar')
    .lean();
  sendResponse(res, 200, { following, count: following.length });
});
