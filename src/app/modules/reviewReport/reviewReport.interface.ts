import { Types } from 'mongoose';
import { REPORT_REASONS } from './reviewReport.constant';

export interface IReviewReport {
  review: Types.ObjectId;
  reportReason: (typeof REPORT_REASONS)[keyof typeof REPORT_REASONS];
  reviewer: Types.ObjectId;
  description: string;
}
