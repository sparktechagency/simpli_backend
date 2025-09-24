/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import AppError from '../../error/appError';
import stripe from '../../utilities/stripe';
import Bussiness from '../bussiness/bussiness.model';
import Reviewer from '../reviewer/reviewer.model';
import {
  ENUM_TRANSACTION_REASON,
  ENUM_TRANSACTION_TYPE,
} from '../transaction/transaction.enum';
import { Transaction } from '../transaction/transaction.model';
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

    if (!business.stripeConnectedAccountId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'For withdraw you need to connect your ach account',
      );
    }

    const amountInCent = (amount * 100).toFixed(2);

    try {
      // Transfer funds
      const transfer: any = await stripe.transfers.create({
        amount: Number(amountInCent),
        currency: 'usd',
        destination: business.stripeConnectedAccountId.toString(),
      });
      console.log('transfer', transfer);

      //   if (transfer.status !== 'succeeded') {
      //     throw new AppError(httpStatus.BAD_REQUEST, 'Transfer failed');
      //   }

      // Payout to bank
      const payout = await stripe.payouts.create(
        {
          amount: Number(amountInCent),
          currency: 'usd',
        },
        {
          stripeAccount: business.stripeConnectedAccountId.toString(),
        },
      );
      console.log('payout', payout);

      // if (payout.status !== 'paid') {
      //   throw new AppError(
      //     httpStatus.BAD_REQUEST,
      //     `Payout failed: ${payout.failure_message || 'Unknown error'}`,
      //   );
      // }

      const updatedBusiness = await Bussiness.findByIdAndUpdate(
        userData.profileId,
        {
          $inc: { currentBalance: -amount },
        },
      );

      await Transaction.create({
        amount: amount,
        type: ENUM_TRANSACTION_TYPE.CREDIT,
        transactionReason: ENUM_TRANSACTION_REASON.WITHDRAWAL,
        userType: 'Bussiness',
        user: userData.profileId,
        paymentMethod: 'Stripe',
        transactionId: payout.id,
        description: `Withdrawn amount $${amount} to your bank account`,
      });

      return updatedBusiness;
    } catch (error) {
      console.error('Error during transfer or payout:', error);
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Transfer failed update your bank info',
      );
    }
  } else {
    const reviewer = await Reviewer.findById(userData.profileId);
    if (!reviewer) {
      throw new AppError(404, 'Reviewer not found');
    }
    if (reviewer.currentBalance < amount) {
      throw new AppError(400, 'Insufficient balance');
    }

    if (!reviewer.stripeConnectedAccountId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'For withdraw you need to connect your ach account',
      );
    }

    const amountInCent = (amount * 100).toFixed(2);

    try {
      // Transfer funds
      const transfer: any = await stripe.transfers.create({
        amount: Number(amountInCent),
        currency: 'usd',
        destination: reviewer.stripeConnectedAccountId.toString(),
      });
      console.log('transfer', transfer);

      //   if (transfer.status !== 'succeeded') {
      //     throw new AppError(httpStatus.BAD_REQUEST, 'Transfer failed');
      //   }

      // Payout to bank
      const payout = await stripe.payouts.create(
        {
          amount: Number(amountInCent),
          currency: 'usd',
        },
        {
          stripeAccount: reviewer.stripeConnectedAccountId.toString(),
        },
      );
      //   console.log('payout', payout);

      // if (payout.status !== 'paid') {
      //   throw new AppError(
      //     httpStatus.BAD_REQUEST,
      //     `Payout failed: ${payout.failure_message || 'Unknown error'}`,
      //   );
      // }

      // Update player data in database
      const updatedReviewer = await Reviewer.findByIdAndUpdate(
        userData.profileId,
        {
          $inc: { currentBalance: -amount },
        },
      );

      await Transaction.create({
        amount: amount,
        type: ENUM_TRANSACTION_TYPE.CREDIT,
        transactionReason: ENUM_TRANSACTION_REASON.WITHDRAWAL,
        userType: 'Reviewer',
        user: userData.profileId,
        paymentMethod: 'Stripe',
        transactionId: payout.id,
        description: `Withdrawn amount $${amount} to your bank account`,
      });

      return updatedReviewer;
    } catch (error) {
      console.error('Error during transfer or payout:', error);
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Transfer failed update your bank info',
      );
    }
  }
};

const PaymentService = {
  makeWithDraw,
};

export default PaymentService;
