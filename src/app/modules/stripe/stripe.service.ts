import httpStatus from 'http-status';
import AppError from '../../error/appError';
import stripe from '../../utilities/stripe';
import config from '../../config';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../user/user.constant';
import Bussiness from '../bussiness/bussiness.model';

const createConnectedAccountAndOnboardingLink = async (
  userData: JwtPayload,
) => {
  let userInfo;
  if (userData?.role === USER_ROLE.bussinessOwner) {
    userInfo = await Bussiness.findById(userData?.profileId);
  } else if (userData?.role === USER_ROLE.reviewer) {
    // TODO: need to work for reviewer--------
    userInfo = null;
  }
  if (!userInfo) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const isStripeConnected = userInfo.isStripeAccountConnected;

  if (isStripeConnected) {
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

  if (userData?.role === USER_ROLE.bussinessOwner) {
    await Bussiness.findByIdAndUpdate(userData?.profileId, {
      stripeConnectedAccountId: account?.id,
    });
  } else if (userData?.role === USER_ROLE.reviewer) {
    //TODO: work with reviewer
  }

  const onboardingLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${config.stripe.onboarding_refresh_url}?accountId=${account?.id}`,
    return_url: `${config.stripe.onboarding_return_url}`,
    type: 'account_onboarding',
  });
  return onboardingLink.url;
};

const StripeService = {
  createConnectedAccountAndOnboardingLink,
};

export default StripeService;
