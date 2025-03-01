import { model, Schema } from 'mongoose';
import { REPORT_REASONS } from './reviewReport.constant';
import { IReviewReport } from './reviewReport.interface';

const reviewReportSchema = new Schema<IReviewReport>(
  {
    review: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    reportReason: {
      type: String,
      enum: Object.values(REPORT_REASONS),
      required: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'Reviewer',
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

reviewReportSchema.index({ review: 1, reviewer: 1 });

const ReviewReport = model<IReviewReport>('ReviewReport', reviewReportSchema);
export default ReviewReport;
