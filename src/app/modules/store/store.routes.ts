import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import StoreValidations from './store.validation';
import StoreController from './store.controller';

const router = express.Router();

router.post(
  '/create-store',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(StoreValidations.createStoreValidationSchema),
  StoreController.createStore,
);
router.patch(
  '/update-store/:id',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(StoreValidations.updateStoreValidationSchema),
  StoreController.updateStore,
);

router.get('/get-bussiness-store/:id', StoreController.getBussinessStore);

export const storeRoutes = router;
