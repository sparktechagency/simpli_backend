import { Types } from 'mongoose';

export interface IComment {
  _id?: Types.ObjectId;
  review: Types.ObjectId;
  commentor: Types.ObjectId;
  text: string;
  image: string;
  likers: Types.ObjectId[];
  parent: Types.ObjectId;
  rootId: string | null;
}
