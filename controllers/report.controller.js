import Report from '../models/Report.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const getReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status = 'pending' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50);

  const [reports, total] = await Promise.all([
    Report.find({ status })
      .populate('reportedBy', 'profile.name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Report.countDocuments({ status }),
  ]);

  sendResponse(res, 200, {
    reports,
    pagination: { page: Number(page), limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({
    ...req.body,
    reportedBy: req.user._id,
  });
  sendResponse(res, 201, { report }, 'Report submitted');
});

export const resolveReport = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['resolved', 'dismissed'].includes(status)) {
    throw new AppError('Status must be resolved or dismissed', 400);
  }

  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolvedBy: req.user._id },
    { new: true }
  );
  if (!report) throw new AppError('Report not found', 404);
  sendResponse(res, 200, { report }, `Report ${status}`);
});
