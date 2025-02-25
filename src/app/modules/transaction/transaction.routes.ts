import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import TransactionController from './transaction.controller';

const router = express.Router();

router.get(
  '/get-all-transaction',
  auth(USER_ROLE.superAdmin),
  TransactionController.getAllTransaction,
);
router.get(
  '/get-my-transaction',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  TransactionController.getMyTransaction,
);

export const transactionRoutes = router;
