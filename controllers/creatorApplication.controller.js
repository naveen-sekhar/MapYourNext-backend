import CreatorApplication from '../models/CreatorApplication.js';
import User from '../models/User.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const applyAsCreator = asyncHandler(async (req, res) => {
  const existing = await CreatorApplication.findOne({ user: req.user._id });
  if (existing) throw new AppError('Application already submitted', 409);

  const application = await CreatorApplication.create({
    ...req.body,
    user: req.user._id,
  });

  sendResponse(res, 201, { application }, 'Application submitted');
});

export const getApplications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [applications, total] = await Promise.all([
    CreatorApplication.find(filter)
      .populate('user', 'email profile.name profile.avatar')
      .populate('expertiseAreas', 'name slug')
      .sort('-appliedAt')
      .skip(skip)
      .limit(Math.min(Number(limit), 50))
      .lean(),
    CreatorApplication.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    applications,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

export const reviewApplication = asyncHandler(async (req, res) => {
  const { status, reviewNote } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    throw new AppError('Status must be approved or rejected', 400);
  }

  const application = await CreatorApplication.findByIdAndUpdate(
    req.params.id,
    { status, reviewNote, reviewedBy: req.user._id },
    { new: true }
  );

  if (!application) throw new AppError('Application not found', 404);

  // If approved, upgrade user role to verified
  if (status === 'approved') {
    await User.findByIdAndUpdate(application.user, { role: 'verified' });
  }

  sendResponse(res, 200, { application }, `Application ${status}`);
});
