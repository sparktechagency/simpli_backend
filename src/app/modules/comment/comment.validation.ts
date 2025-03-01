import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format',
  });

const createCommentSchema = z.object({
  body: z.object({
    reviewId: objectIdSchema,
    userId: objectIdSchema,
    text: z
      .string()
      .trim()
      .min(1, { message: 'Text is required' })
      .max(500, { message: 'Text cannot exceed 500 characters' }),
    image: z.string().url().optional().or(z.literal('')),
    parentCommentId: objectIdSchema.nullish(),
  }),
});

const CommentValidations = {
  createCommentSchema,
};

export default CommentValidations;
