import { Types } from 'mongoose';

export interface IComment {
  _id?: Types.ObjectId;
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  likers: Types.ObjectId[];
  replies: Types.ObjectId[];
}
