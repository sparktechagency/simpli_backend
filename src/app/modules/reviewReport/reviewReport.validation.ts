import { z } from 'zod';
import { REPORT_REASONS } from './reviewReport.constant';

const createReviewReportSchema = z.object({
  body: z.object({
    review: z.string({ required_error: 'Review id is required' }),
    reportReason: z.enum(
      Object.values(REPORT_REASONS) as [string, ...string[]],
    ),
    description: z
      .string()
      .trim()
      .max(500, { message: 'Description cannot exceed 500 characters' })
      .optional(),
  }),
});

const ReviewReportValidations = {
  createReviewReportSchema,
};

export default ReviewReportValidations;
