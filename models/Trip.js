import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guide',
    },
    title: { type: String, required: [true, 'Trip title is required'] },
    travelDates: {
      start: Date,
      end: Date,
    },
    budget: {
      planned: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    schedule: [mongoose.Schema.Types.Mixed],
    status: {
      type: String,
      enum: ['planning', 'upcoming', 'ongoing', 'completed'],
      default: 'planning',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
