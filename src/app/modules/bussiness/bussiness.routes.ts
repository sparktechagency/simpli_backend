import express, { NextFunction, Request, Response } from 'express';
import { uploadFile } from '../../aws/multer-s3-uploader';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import BussinessController from './bussiness.controller';
import bussinessValidations from './bussiness.validation';

const router = express.Router();

router.post(
  '/add-bussiness-info',
  auth(USER_ROLE.bussinessOwner),
  BussinessController.addBussinessInformation,
);
router.post(
  '/add-bussiness-document',
  auth(USER_ROLE.bussinessOwner),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(bussinessValidations.addBussinessDocumentValidationSchema),
  BussinessController.addBussinessDocument,
);
router.patch(
  '/update-bussiness-info',
  auth(USER_ROLE.bussinessOwner),
  uploadFile(),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  BussinessController.updateBussinessInfo,
);

router.get(
  '/get-profile',
  auth(USER_ROLE.bussinessOwner),
  BussinessController.getBussinessProfile,
);
router.get(
  '/get-business-profile/:id',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  BussinessController.getSingleBusinessById,
);

export const bussinessRoutes = router;
