import mongoose from 'mongoose';
import { IComment } from './comment.interface';

const commentSchema = new mongoose.Schema<IComment>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: { type: String, required: true },
    likers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reviewer' }],
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  },
  {
    timestamps: true,
  },
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ likers: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
