import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['destination', 'guide'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    body: { type: String, default: '' },
    photos: [String],
    helpfulCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'flagged', 'removed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Compound index for querying reviews by target
reviewSchema.index({ targetType: 1, targetId: 1 });
// Prevent duplicate reviews by same user on same target
reviewSchema.index({ author: 1, targetType: 1, targetId: 1 }, { unique: true });

/**
 * After save/remove: recalculate avgRating on the target document.
 */
async function updateAvgRating(targetType, targetId) {
  const result = await mongoose
    .model('Review')
    .aggregate([
      { $match: { targetType, targetId, status: 'active' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

  const avg = result.length ? Math.round(result[0].avg * 10) / 10 : 0;
  const ModelName = targetType === 'destination' ? 'Destination' : 'Guide';
  await mongoose.model(ModelName).findByIdAndUpdate(targetId, { avgRating: avg });
}

reviewSchema.post('save', async function () {
  await updateAvgRating(this.targetType, this.targetId);
});

reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) await updateAvgRating(doc.targetType, doc.targetId);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
