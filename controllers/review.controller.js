import Review from '../models/Review.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const getReviews = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50);

  const filter = { targetType, targetId, status: 'active' };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('author', 'profile.name profile.avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Review.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    reviews,
    pagination: { page: Number(page), limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const createReview = asyncHandler(async (req, res) => {
  const review = await Review.create({
    ...req.body,
    author: req.user._id,
  });

  sendResponse(res, 201, { review }, 'Review submitted');
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);

  // Author or moderator/admin can delete
  const isOwner = review.author.toString() === req.user._id.toString();
  const isMod = ['moderator', 'admin'].includes(req.user.role);
  if (!isOwner && !isMod) throw new AppError('Not authorized', 403);

  await Review.findByIdAndDelete(req.params.id);
  sendResponse(res, 200, null, 'Review deleted');
});

export const markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulCount: 1 } },
    { new: true }
  );
  if (!review) throw new AppError('Review not found', 404);
  sendResponse(res, 200, { helpfulCount: review.helpfulCount });
});
