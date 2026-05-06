import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: {
    type: String,
    enum: ['view', 'search', 'save', 'book', 'review', 'share'],
    required: true,
  },
  targetType: { type: String, default: '' },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  metadata: mongoose.Schema.Types.Mixed,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    expires: 90 * 24 * 60 * 60, // TTL: 90 days auto-expire
  },
});

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;
