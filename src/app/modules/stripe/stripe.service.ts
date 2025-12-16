/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../config';
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

const createConnectedAccountAndOnboardingLink = async (
  userData: JwtPayload,
) => {
  if (userData.role == USER_ROLE.bussinessOwner) {
    const businessInfo = await Bussiness.findById(userData.profileId);
    if (!businessInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    if (businessInfo?.isStripeAccountConnected) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Stripe is already connected');
    }

    if (businessInfo.stripeConnectedAccountId) {
      const onboardingLink = await stripe.accountLinks.create({
        account: businessInfo.stripeConnectedAccountId.toString(),
        refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${businessInfo.stripeConnectedAccountId.toString()}`,
        return_url: `${config.stripe.onboarding_return_url_for_business}`,
        type: 'account_onboarding',
      });
      return onboardingLink.url;
    } else {
      const account = await stripe.accounts.create({
        type: 'express',
        email: businessInfo.email,
        country: 'US',
        capabilities: {
          // card_payments: { requested: true },
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual',
            },
          },
        },
      });
      const updateBusinessData = await Bussiness.findByIdAndUpdate(
        userData.profileId,
        {
          stripeConnectedAccountId: account?.id,
        },
      );
      if (!updateBusinessData) {
        throw new AppError(
          httpStatus.SERVICE_UNAVAILABLE,
          'Unable to add account id in business data',
        );
      }
      const onboardingLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${account?.id}`,
        return_url: `${config.stripe.onboarding_return_url_for_business}`,
        type: 'account_onboarding',
      });
      return onboardingLink.url;
    }
  } else {
    const reviewerInfo = await Reviewer.findById(userData.profileId);
    if (!reviewerInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'Reviewer not found');
    }
    if (reviewerInfo?.isStripeAccountConnected) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Stripe is already connected');
    }
    if (reviewerInfo.stripeConnectedAccountId) {
      const onboardingLink = await stripe.accountLinks.create({
        account: reviewerInfo.stripeConnectedAccountId.toString(),
        refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${reviewerInfo.stripeConnectedAccountId.toString()}`,
        return_url: `${config.stripe.onboarding_return_url_for_reviewer}`,
        type: 'account_onboarding',
      });
      return onboardingLink.url;
    } else {
      const account = await stripe.accounts.create({
        type: 'express',
        email: reviewerInfo.email,
        country: 'US',
        capabilities: {
          // card_payments: { requested: true },
          transfers: { requested: true },
        },
        settings: {
          payouts: {
            schedule: {
              interval: 'manual',
            },
          },
        },
      });
      const updateReviewerData = await Reviewer.findByIdAndUpdate(
        userData.profileId,
        {
          stripeConnectedAccountId: account?.id,
        },
      );
      if (!updateReviewerData) {
        throw new AppError(
          httpStatus.SERVICE_UNAVAILABLE,
          'Unable to add account id in reviewer data',
        );
      }
      const onboardingLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${account?.id}`,
        return_url: `${config.stripe.onboarding_return_url_for_reviewer}`,
        type: 'account_onboarding',
      });
      return onboardingLink.url;
    }
  }
};

const updateOnboardingLink = async (userData: JwtPayload) => {
  if (userData.role == USER_ROLE.bussinessOwner) {
    const user = await Bussiness.findById(userData.profileId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeConnectedAccountId.toString(),
      refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${user.stripeConnectedAccountId}`,
      return_url: config.stripe.onboarding_return_url_for_business,
      type: 'account_onboarding',
    });

    return { link: accountLink.url };
  } else {
    const user = await Reviewer.findById(userData.profileId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'Reviewer not found');
    }
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeConnectedAccountId.toString(),
      refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${user.stripeConnectedAccountId}`,
      return_url: config.stripe.onboarding_return_url_for_reviewer,
      type: 'account_onboarding',
    });

    return { link: accountLink.url };
  }
};

const updateStripeConnectedAccountStatus = async (accountId: string) => {
  if (!accountId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Stripe account ID is required.',
    );
  }

  try {
    // Try updating Business first
    const updatedBusiness = await Bussiness.findOneAndUpdate(
      { stripeConnectedAccountId: accountId },
      { isStripeAccountConnected: true },
      { new: true, runValidators: true },
    );

    if (updatedBusiness) {
      return {
        success: true,
        message: 'Business Stripe account connected successfully.',
        data: updatedBusiness,
      };
    }

    // If not found, try updating Reviewer
    const updatedReviewer = await Reviewer.findOneAndUpdate(
      { stripeConnectedAccountId: accountId },
      { isStripeAccountConnected: true },
      { new: true, runValidators: true },
    );

    if (updatedReviewer) {
      return {
        success: true,
        message: 'Reviewer Stripe account connected successfully.',
        data: updatedReviewer,
      };
    }

    // If neither found
    throw new AppError(
      httpStatus.NOT_FOUND,
      `No business or reviewer found with Stripe account ID: ${accountId}`,
    );
  } catch (err) {
    console.error('Error updating Stripe account status:', err);
    return {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'An error occurred while updating the client status.',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
};
const withdrawMoney = async (userData: JwtPayload, amount: number) => {
  if (userData.role == USER_ROLE.reviewer) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const amountInCent = Math.round(amount * 100);

      const reviewer = await Reviewer.findById(userData.profileId).session(
        session,
      );
      if (!reviewer) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
      }

      if (reviewer.currentBalance < amount) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You don't have enough balance",
        );
      }

      if (!reviewer.isStripeAccountConnected) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'For withdraw you need to connect your bank info with Stripe',
        );
      }

      const stripe_account_id = reviewer.stripeConnectedAccountId;
      if (!stripe_account_id) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Stripe account not found');
      }

      // ---------- STRIPE TRANSFER ----------
      const transfer = await stripe.transfers.create({
        amount: amountInCent,
        currency: 'usd',
        destination: stripe_account_id.toString(),
      });

      // ---------- STRIPE PAYOUT ----------
      const payout = await stripe.payouts.create(
        {
          amount: amountInCent,
          currency: 'usd',
        },
        {
          stripeAccount: stripe_account_id.toString(),
        },
      );

      await Reviewer.findByIdAndUpdate(
        userData.profileId,
        {
          $inc: {
            currentBalance: -amount,
          },
        },
        { session },
      );

      await Transaction.create(
        [
          {
            amount,
            type: ENUM_TRANSACTION_TYPE.CREDIT,
            transactionReason: ENUM_TRANSACTION_REASON.WITHDRAWAL,
            user: userData.profileId,
            transactionId: transfer.id,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return { transfer, payout };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();

      console.error('Withdraw error:', error);

      // If it's already AppError, throw it as it is
      if (error instanceof AppError) {
        throw error;
      }

      // Otherwise send fallback error
      throw new AppError(
        httpStatus.BAD_REQUEST,
        error.message || 'Withdrawal failed. Update your bank info.',
      );
    }
  } else if (USER_ROLE.bussinessOwner) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const amountInCent = Math.round(amount * 100);

      const business = await Bussiness.findById(userData.profileId).session(
        session,
      );
      if (!business) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
      }

      if (business.currentBalance < amount) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          "You don't have enough balance",
        );
      }

      if (!business.isStripeAccountConnected) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'For withdraw you need to connect your bank info with Stripe',
        );
      }

      const stripe_account_id: any = business.stripeConnectedAccountId;
      if (!stripe_account_id) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Stripe account not found');
      }

      // ---------- STRIPE TRANSFER ----------
      const transfer = await stripe.transfers.create({
        amount: amountInCent,
        currency: 'usd',
        destination: stripe_account_id,
      });

      // ---------- STRIPE PAYOUT ----------
      const payout = await stripe.payouts.create(
        {
          amount: amountInCent,
          currency: 'usd',
        },
        {
          stripeAccount: stripe_account_id,
        },
      );

      await Bussiness.findByIdAndUpdate(
        userData.profileId,
        {
          $inc: {
            currentBalance: -amount,
          },
        },
        { session },
      );

      await Transaction.create(
        [
          {
            amount,
            type: ENUM_TRANSACTION_TYPE.CREDIT,
            user: userData.profileId,
            transactionId: transfer.id,
            transactionReason: ENUM_TRANSACTION_REASON.WITHDRAWAL,
          },
        ],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return { transfer, payout };
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();

      console.error('Withdraw error:', error);

      // If it's already AppError, throw it as it is
      if (error instanceof AppError) {
        throw error;
      }

      // Otherwise send fallback error
      throw new AppError(
        httpStatus.BAD_REQUEST,
        error.message || 'Withdrawal failed. Update your bank info.',
      );
    }
  }
};
const StripeService = {
  createConnectedAccountAndOnboardingLink,
  updateOnboardingLink,
  updateStripeConnectedAccountStatus,
  withdrawMoney,
};

export default StripeService;
