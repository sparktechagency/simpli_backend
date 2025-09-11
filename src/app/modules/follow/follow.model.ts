import { Schema, model } from 'mongoose';
import { IFollow } from './follow.interface';

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'NormalUser',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'NormalUser',
      required: true,
    },
  },
  { timestamps: true },
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = model<IFollow>('Follow', followSchema);
export default Follow;
