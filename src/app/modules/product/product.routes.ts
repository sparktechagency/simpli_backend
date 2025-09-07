import express, { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../../aws/multer-s3-uploader';
import auth from '../../middlewares/auth';
import simpleAuth from '../../middlewares/simpleAuth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import ProductController from './product.controller';
import ProductValidations from './product.validation';
// import { uploadDynamicFile } from '../../helper/dynamicFileUploader';
const router = express.Router();

router.post(
  '/create-product',
  auth(USER_ROLE.bussinessOwner),
  // uploadDynamicFile(),
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
// router.post(
//   '/save-product-as-draft',
//   auth(USER_ROLE.bussinessOwner),
//   uploadFile(),
//   (req: Request, res: Response, next: NextFunction) => {
//     if (req.body.data) {
//       req.body = JSON.parse(req.body.data);
//     }
//     next();
//   },
//   validateRequest(ProductValidations.saveAsDraftProductValidationSchema),
//   ProductController.saveProductAsDraft,
// );

router.post(
  '/publish-product-from-draft/:id',
  auth(USER_ROLE.bussinessOwner),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  // validateRequest(ProductValidations.createProductValidationSchema),
  ProductController.publishProductFromDraft,
);

router.delete(
  '/delete-product/:id',
  auth(USER_ROLE.bussinessOwner),
  ProductController.deleteSingleProduct,
);
router.delete(
  '/soft-delete-product/:id',
  auth(USER_ROLE.bussinessOwner),
  ProductController.softDeleteSingleProduct,
);
router.patch(
  '/change-status/:id',
  auth(USER_ROLE.bussinessOwner),
  ProductController.changeProductStatus,
);
router.get(
  '/get-all-product',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  ProductController.getAllProduct,
);
router.get(
  '/get-single-product/:id',
  simpleAuth,
  ProductController.getSingleProduct,
);

router.patch(
  '/update-product/:id',
  auth(USER_ROLE.bussinessOwner),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  ProductController.updateProduct,
);
export const productRoutes = router;
