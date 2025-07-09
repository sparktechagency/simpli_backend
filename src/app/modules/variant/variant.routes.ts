import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import VariantValidations from './variant.validation';
import VariantController from './variant.controller';
import { uploadFile } from '../../aws/multer-s3-uploader';

const router = express.Router();

router.post(
  '/create-variant',
  auth(USER_ROLE.bussinessOwner),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(VariantValidations.createVariantValidationSchema),
  VariantController.createVariant,
);
router.patch(
  '/update-variant/:id',
  auth(USER_ROLE.bussinessOwner),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(VariantValidations.updateVariantValidationSchema),
  VariantController.updateVariant,
);
// delete variant
router.delete(
  '/delete-variant/:id',
  auth(USER_ROLE.bussinessOwner),
  VariantController.deleteVariant,
);

router.get('/get-product-variant/:id', VariantController.getProductVariant);

export const variantRoutes = router;
