import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import BussinessController from './bussiness.controller';
import validateRequest from '../../middlewares/validateRequest';
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
  validateRequest(bussinessValidations.addBussinessDocumentValidationSchema),
  BussinessController.addBussinessDocument,
);
export const bussinessRoutes = router;
