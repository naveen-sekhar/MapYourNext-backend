import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
    type: {
      type: String,
      enum: ['discussion', 'question', 'story'],
      default: 'discussion',
    },
    title: { type: String, required: [true, 'Post title is required'] },
    body: { type: String, default: '' },
    media: [String],
    upvotes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'flagged', 'removed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
