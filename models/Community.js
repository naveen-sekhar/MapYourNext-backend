import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Community name is required'], trim: true },
    hobby: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    memberCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rules: [String],
  },
  { timestamps: true }
);

const Community = mongoose.model('Community', communitySchema);
export default Community;
