import mongoose from 'mongoose';
import { IComment } from './comment.interface';

const commentSchema = new mongoose.Schema<IComment>(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reviewer',
      required: true,
    },
    text: { type: String, required: true },
    image: { type: String, default: '' },
    likers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reviewer' }],
    parentCommentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  { timestamps: true },
);

commentSchema.index({ reviewId: 1, parentCommentId: 1, createdAt: -1 });
commentSchema.index({ likers: 1 });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
