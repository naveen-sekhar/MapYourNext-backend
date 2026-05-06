import Community from '../models/Community.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const getCommunities = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, hobby } = req.query;
  const filter = {};
  if (hobby) filter.hobby = hobby;

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50);

  const [communities, total] = await Promise.all([
    Community.find(filter)
      .populate('hobby', 'name slug icon')
      .populate('createdBy', 'profile.name')
      .sort('-memberCount')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Community.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    communities,
    pagination: { page: Number(page), limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const createCommunity = asyncHandler(async (req, res) => {
  const community = await Community.create({
    ...req.body,
    createdBy: req.user._id,
    members: [req.user._id],
    memberCount: 1,
  });
  sendResponse(res, 201, { community }, 'Community created');
});

export const joinCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw new AppError('Community not found', 404);

  if (community.members.includes(req.user._id)) {
    throw new AppError('Already a member', 400);
  }

  community.members.push(req.user._id);
  community.memberCount = community.members.length;
  await community.save();

  sendResponse(res, 200, { community }, 'Joined community');
});

export const leaveCommunity = asyncHandler(async (req, res) => {
  const community = await Community.findById(req.params.id);
  if (!community) throw new AppError('Community not found', 404);

  community.members = community.members.filter(
    (m) => m.toString() !== req.user._id.toString()
  );
  community.memberCount = community.members.length;
  await community.save();

  sendResponse(res, 200, null, 'Left community');
});
