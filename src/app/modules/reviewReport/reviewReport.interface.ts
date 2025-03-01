import { Types } from 'mongoose';
import { REPORT_REASONS } from './reviewReport.constant';

export interface IReviewReport {
  review: Types.ObjectId;
  reportReason: (typeof REPORT_REASONS)[keyof typeof REPORT_REASONS];
  reporter: Types.ObjectId;
  description: string;
}
