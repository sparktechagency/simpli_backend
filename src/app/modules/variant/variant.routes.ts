import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import { uploadFile } from '../../helper/fileUploader';
import validateRequest from '../../middlewares/validateRequest';
import VariantValidations from './variant.validation';
import VariantController from './variant.controller';

const router = express.Router();

router.patch(
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
  '/update-variant.:id',
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

router.delete(
  '/delete-variant/:id',
  auth(USER_ROLE.bussinessOwner),
  VariantController.deleteVariant,
);

export const productRoutes = router;
