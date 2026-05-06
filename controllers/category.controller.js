import Category from '../models/Category.js';
import { AppError, asyncHandler, sendResponse } from '../utils/errorHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const filter = type ? { type } : {};
  const categories = await Category.find(filter).sort('name').lean();
  sendResponse(res, 200, { categories });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) throw new AppError('Category not found', 404);
  sendResponse(res, 200, { category });
});

export const createCategory = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const category = await Category.create(req.body);
  sendResponse(res, 201, { category }, 'Category created');
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw new AppError('Category not found', 404);
  sendResponse(res, 200, { category }, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError('Category not found', 404);
  sendResponse(res, 200, null, 'Category deleted');
});
