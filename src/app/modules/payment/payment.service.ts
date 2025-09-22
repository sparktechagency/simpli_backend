import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../error/appError';
import Bussiness from '../bussiness/bussiness.model';
import Reviewer from '../reviewer/reviewer.model';
import { USER_ROLE } from '../user/user.constant';

const makeWithDraw = async (userData: JwtPayload, amount: number) => {
  if (userData.role == USER_ROLE.bussinessOwner) {
    const business = await Bussiness.findById(userData.profileId);
    if (!business) {
      throw new AppError(404, 'Business not found');
    }
    if (business.currentBalance < amount) {
      throw new AppError(400, 'Insufficient balance');
    }
  } else {
    const reviewer = await Reviewer.findById(userData.profileId);
    if (!reviewer) {
      throw new AppError(404, 'Reviewer not found');
    }
    if (reviewer.currentBalance < amount) {
      throw new AppError(400, 'Insufficient balance');
    }
  }
};

const PaymentService = {
  makeWithDraw,
};

export default PaymentService;
