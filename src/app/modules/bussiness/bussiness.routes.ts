import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import BussinessController from './bussiness.controller';
import validateRequest from '../../middlewares/validateRequest';
import bussinessValidations from './bussiness.validation';
import { uploadFile } from '../../helper/fileUploader';

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
router.post(
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
export const bussinessRoutes = router;
