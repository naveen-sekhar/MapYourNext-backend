import mongoose from 'mongoose';
import slugify from 'slugify';

const guideSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Destination is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: 120,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    gallery: {
      type: [String],
      validate: [(arr) => arr.length <= 15, 'Gallery cannot exceed 15 images'],
    },
    itinerary: [mongoose.Schema.Types.Mixed],
    budget: [mongoose.Schema.Types.Mixed],
    hotels: [mongoose.Schema.Types.Mixed],
    restaurants: [mongoose.Schema.Types.Mixed],
    pros: {
      type: [String],
      validate: [(arr) => arr.length <= 10, 'Pros cannot exceed 10 items'],
    },
    cons: {
      type: [String],
      validate: [(arr) => arr.length <= 10, 'Cons cannot exceed 10 items'],
    },
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'review', 'published', 'hidden'],
      default: 'draft',
    },
    viewCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    aiSummary: {
      pros: [String],
      cons: [String],
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

// Auto-generate slug
guideSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug =
      slugify(this.title, { lower: true, strict: true }) +
      '-' +
      this._id.toString().slice(-6);
  }
  next();
});

guideSchema.set('toJSON', { virtuals: true });

const Guide = mongoose.model('Guide', guideSchema);
export default Guide;
