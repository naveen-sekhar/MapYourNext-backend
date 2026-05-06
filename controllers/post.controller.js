import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, community, destination, type } = req.query;
  const filter = { status: 'active' };
  if (community) filter.community = community;
  if (destination) filter.destination = destination;
  if (type) filter.type = type;

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Math.min(Number(limit), 50);

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'profile.name profile.avatar')
      .populate('community', 'name')
      .populate('destination', 'name slug')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Post.countDocuments(filter),
  ]);

  sendResponse(res, 200, {
    posts,
    pagination: { page: Number(page), limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({ ...req.body, author: req.user._id });
  sendResponse(res, 201, { post }, 'Post created');
});

export const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id, status: 'active' })
    .populate('author', 'profile.name profile.avatar')
    .sort('createdAt')
    .lean();

  sendResponse(res, 200, { comments });
});

export const addComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({
    ...req.body,
    post: req.params.id,
    author: req.user._id,
  });
  sendResponse(res, 201, { comment }, 'Comment added');
});

export const upvotePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { upvotes: 1 } },
    { new: true }
  );
  if (!post) throw new AppError('Post not found', 404);
  sendResponse(res, 200, { upvotes: post.upvotes });
});
