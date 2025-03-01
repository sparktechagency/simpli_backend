import { z } from 'zod';
import mongoose from 'mongoose';

const ObjectIdSchema = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .min(1, `${fieldName} cannot be empty`)
    .refine((val) => Types.ObjectId.isValid(val), {
      message: `${fieldName} must be a valid ObjectId`,
    });

const createCommentSchema = z.object({
  body: z.object({
    reviewId: ObjectIdSchema('Review Id'),
    text: z
      .string()
      .trim()
      .min(1, { message: 'Text is required' })
      .max(500, { message: 'Text cannot exceed 500 characters' }),
  }),
});

const createReplySchema = z.object({
  body: z.object({
    parentCommentId: ObjectIdSchema('Parent comment id'),
    text: z
      .string()
      .trim()
      .min(1, { message: 'Text is required' })
      .max(500, { message: 'Text cannot exceed 500 characters' }),
  }),
});

const CommentValidations = {
  createCommentSchema,
  createReplySchema,
};

export default CommentValidations;
