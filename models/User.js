import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['traveler', 'verified', 'moderator', 'admin'],
      default: 'traveler',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
    },
    profile: {
      name: { type: String, required: [true, 'Name is required'], trim: true },
      avatar: { type: String, default: '' },
      bio: { type: String, maxlength: 500, default: '' },
      location: { type: String, default: '' },
    },
    hobbies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    preferences: {
      budgetRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100000 },
      },
      ageGroup: { type: String, default: '' },
      travelStyle: { type: String, default: '' },
    },
    quizAnswers: [mongoose.Schema.Types.Mixed],
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
      validate: [
        (arr) => arr.length <= 500,
        'Wishlist cannot exceed 500 items',
      ],
    },
    visited: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
      validate: [
        (arr) => arr.length <= 2000,
        'Visited list cannot exceed 2000 items',
      ],
    },
    savedGuides: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Guide' }],
      validate: [
        (arr) => arr.length <= 500,
        'Saved guides cannot exceed 500 items',
      ],
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Virtual: isVerified
userSchema.virtual('isVerified').get(function () {
  return this.role === 'verified' || this.role === 'admin';
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);
export default User;
