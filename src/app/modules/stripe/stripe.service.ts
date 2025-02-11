import httpStatus from 'http-status';
import AppError from '../../error/appError';
import stripe from '../../utilities/stripe';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../user/user.model';

const createConnectedAccountAndOnboardingLink = async (
  userData: JwtPayload,
) => {
  const userInfo = await User.findById(userData.id);
  if (!userInfo) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (userInfo?.isStripeAccountConnected) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Stripe is already connected');
  }

  const account = await stripe.accounts.create({
    type: 'express',
    email: userInfo.email,
    country: 'US',
    capabilities: {
      transfers: { requested: true },
    },
    tos_acceptance: {
      service_agreement: 'recipient',
    },
  });

  const updateUserData = await User.findByIdAndUpdate(userData.id, {
    stripeConnectedAccountId: account?.id,
  });
  if (!updateUserData) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      'Unable to add account id in user data',
    );
  }
  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${account?.id}`,
    return_url: `${config.stripe.onboarding_return_url}`,
    type: 'account_onboarding',
  });
  return onboardingLink.url;
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
