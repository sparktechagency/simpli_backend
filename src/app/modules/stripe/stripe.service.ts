import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../error/appError';
import stripe from '../../utilities/stripe';
import Bussiness from '../bussiness/bussiness.model';
import Reviewer from '../reviewer/reviewer.model';
import { USER_ROLE } from '../user/user.constant';
import { User } from '../user/user.model';

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
      return_url: `${config.stripe.onboarding_return_url}`,
      type: 'account_onboarding',
    });
    return onboardingLink.url;
  } else {
    const reviewerInfo = await Reviewer.findById(userData.profileId);
    if (!reviewerInfo) {
      throw new AppError(httpStatus.NOT_FOUND, 'Reviewer not found');
    }
    if (reviewerInfo?.isStripeAccountConnected) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Stripe is already connected');
    }

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
    const updateReviewerData = await User.findByIdAndUpdate(
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
      return_url: `${config.stripe.onboarding_return_url}`,
      type: 'account_onboarding',
    });
    return onboardingLink.url;
  }
};

const updateOnboardingLink = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shop not found');
  }

  const accountLink = await stripe.accountLinks.create({
    account: user.stripeConnectedAccountId as string,
    refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${user.stripeConnectedAccountId}`,
    return_url: config.stripe.onboarding_return_url,
    type: 'account_onboarding',
  });

  return { link: accountLink.url };
};

const StripeService = {
  createConnectedAccountAndOnboardingLink,
  updateOnboardingLink,
};

export default StripeService;
