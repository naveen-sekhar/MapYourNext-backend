import Trip from '../models/Trip.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const getTrips = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50);

  const [trips, total] = await Promise.all([
    Trip.find(filter)
      .populate('destination', 'name slug media.coverImage')
      .populate('guide', 'title slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Trip.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    trips,
    pagination: { page: Number(page), limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const createTrip = asyncHandler(async (req, res) => {
  req.body.user = req.user._id;
  const trip = await Trip.create(req.body);
  sendResponse(res, 201, { trip }, 'Trip created');
});

export const updateTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
  if (!trip) throw new AppError('Trip not found', 404);

  Object.assign(trip, req.body);
  await trip.save();
  sendResponse(res, 200, { trip }, 'Trip updated');
});

export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!trip) throw new AppError('Trip not found', 404);
  sendResponse(res, 200, null, 'Trip deleted');
});
