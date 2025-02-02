import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import BussinessController from './bussiness.controller';

const router = express.Router();

router.post(
  '/add-bussiness-info',
  auth(USER_ROLE.bussinessOwner),
  BussinessController.addBussinessInformation,
);

export const bussinessRoutes = router;
