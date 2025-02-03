import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';
import validateRequest from '../../middlewares/validateRequest';
import ProductValidations from './product.validation';
import ProductController from './product.controller';

const router = express.Router();

router.patch(
  '/create-product',
  auth(USER_ROLE.bussinessOwner),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(ProductValidations.createProductValidationSchema),
  ProductController.createProduct,
);

export const productRoutes = router;
