import mongoose from 'mongoose';

const creatorApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    identityProof: { type: String, default: '' },
    expertiseAreas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    portfolio: [String],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewNote: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CreatorApplication = mongoose.model(
  'CreatorApplication',
  creatorApplicationSchema
);
export default CreatorApplication;
