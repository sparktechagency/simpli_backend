import { Types } from 'mongoose';

export interface IComment {
  _id?: Types.ObjectId;
  reviewId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  image: string;
  likers: Types.ObjectId[];
  parentCommentId: Types.ObjectId;
}
