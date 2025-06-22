import express, { NextFunction, Request, Response } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import categoryValidation from './category.validation';
import categoryController from './category.controller';
import { uploadFile } from '../../aws/multer-s3-uploader';

const router = express.Router();

router.post(
  '/create-category',
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(categoryValidation.createCategoryValidationSchema),
  categoryController.createCategory,
);
router.patch(
  '/update-category/:id',
  uploadFile(),
  validateRequest(categoryValidation.updateCategoryValidationSchema),
  categoryController.updateCategory,
);

router.get('/all-categories', categoryController.getAllCategories);
router.get('/get-single-category/:id', categoryController.getSingleCategory);
router.delete('/delete-category/:id', categoryController.deleteCategory);

export const categoryRoutes = router;
