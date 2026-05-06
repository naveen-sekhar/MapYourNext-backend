import mongoose from 'mongoose';
import slugify from 'slugify';

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Destination name is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    location: {
      address: { type: String, required: [true, 'Address is required'] },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
        index: '2dsphere',
      },
      state: { type: String, required: [true, 'State is required'] },
      country: { type: String, default: 'India' },
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    hobbies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    entryFee: {
      amount: { type: Number, default: 0 },
    },
    budgetRange: {
      min: { type: Number, required: [true, 'Minimum budget is required'] },
      max: { type: Number, required: [true, 'Maximum budget is required'] },
    },
    bestSeasons: {
      type: [String],
      required: [true, 'Best seasons are required'],
    },
    safetyRating: {
      overall: { type: Number, min: 1, max: 10, default: 5 },
      soloWomen: { type: Number, min: 1, max: 5, default: 3 },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },
    },
    accessibility: {
      wheelchairFriendly: { type: Boolean, default: false },
      ageSuitability: {
        type: String,
        enum: ['all', 'family', 'adult', 'senior'],
        default: 'all',
      },
    },
    media: {
      coverImage: {
        type: String,
        required: [true, 'Cover image is required'],
      },
      gallery: {
        type: [String],
        validate: [
          (arr) => arr.length <= 20,
          'Gallery cannot exceed 20 images',
        ],
      },
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'hidden'],
      default: 'published',
    },
    avgRating: { type: Number, default: 0 },
    aiSummary: {
      pros: [String],
      cons: [String],
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before save
destinationSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

destinationSchema.set('toJSON', { virtuals: true });

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
