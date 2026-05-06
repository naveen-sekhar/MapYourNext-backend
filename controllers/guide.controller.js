import Guide from '../models/Guide.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const getGuides = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, destination, author, status, sort = '-createdAt' } = req.query;
  const filter = {};

  // Public sees only published; authors can see their own drafts
  if (req.user && author === req.user._id.toString()) {
    filter.author = req.user._id;
  } else {
    filter.status = 'published';
  }

  if (destination) filter.destination = destination;

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50);

  const [guides, total] = await Promise.all([
    Guide.find(filter)
      .populate('author', 'profile.name profile.avatar')
      .populate('destination', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Guide.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    guides,
    pagination: { page: Number(page), limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const getGuideBySlug = asyncHandler(async (req, res) => {
  const guide = await Guide.findOne({ slug: req.params.slug })
    .populate('author', 'profile.name profile.avatar role')
    .populate('destination', 'name slug location safetyRating budgetRange');

  if (!guide) throw new AppError('Guide not found', 404);

  // Increment view count
  guide.viewCount += 1;
  await guide.save({ validateBeforeSave: false });

  sendResponse(res, 200, { guide });
});

export const createGuide = asyncHandler(async (req, res) => {
  req.body.author = req.user._id;
  const guide = await Guide.create(req.body);
  sendResponse(res, 201, { guide }, 'Guide created as draft');
});

export const updateGuide = asyncHandler(async (req, res) => {
  const guide = await Guide.findById(req.params.id);
  if (!guide) throw new AppError('Guide not found', 404);

  // Only author or admin can edit
  if (guide.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to edit this guide', 403);
  }

  Object.assign(guide, req.body);
  await guide.save();

  sendResponse(res, 200, { guide }, 'Guide updated');
});

export const deleteGuide = asyncHandler(async (req, res) => {
  const guide = await Guide.findById(req.params.id);
  if (!guide) throw new AppError('Guide not found', 404);

  if (guide.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this guide', 403);
  }

  guide.status = 'hidden';
  await guide.save({ validateBeforeSave: false });
  sendResponse(res, 200, null, 'Guide deleted');
});

export const publishGuide = asyncHandler(async (req, res) => {
  const guide = await Guide.findById(req.params.id);
  if (!guide) throw new AppError('Guide not found', 404);

  if (guide.author.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  guide.status = 'review';
  await guide.save({ validateBeforeSave: false });
  sendResponse(res, 200, { guide }, 'Guide submitted for review');
});

export const compareGuides = asyncHandler(async (req, res) => {
  const { ids } = req.query; // comma-separated guide IDs
  if (!ids) throw new AppError('Provide guide IDs to compare (ids=id1,id2)', 400);

  const idArr = ids.split(',').slice(0, 2);
  const guides = await Guide.find({ _id: { $in: idArr } })
    .populate('author', 'profile.name profile.avatar')
    .populate('destination', 'name slug')
    .lean();

  sendResponse(res, 200, { guides });
});
