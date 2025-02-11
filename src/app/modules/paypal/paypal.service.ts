/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import getPayPalAccessToken from '../../handlePaypal/getAccessToken';
import config from '../../config';
import AppError from '../../error/appError';
import httpStatus from 'http-status';
import { User } from '../user/user.model';

const createOnboardingLinkForPartnerAccount = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await axios.post(
      `${config.paypal.base_url}/v2/customer/partner-referrals`,
      {
        operations: [
          {
            operation: 'API_INTEGRATION',
            api_integration_preference: {
              rest_api_integration: {
                integration_method: 'PAYPAL',
                integration_type: 'THIRD_PARTY',
              },
            },
          },
        ],
        // if  need to add more features then-------
        products: ['PAYOUTS'],
        legal_consents: [
          {
            type: 'SHARE_DATA_CONSENT',
            granted: true,
          },
        ],
        partner_config_override: {
          return_url: `https://yourwebsite.com/onboarding-success?userId=${userId}`,
          show_add_credit_card: false,
        },
        tracking_id: userId,
        requested_capabilities: ['PAYOUTS'],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const onboardingLink = response.data.links.find(
      (link: any) => link.rel === 'action_url',
    )?.href;

    if (!onboardingLink) {
      throw new AppError(
        httpStatus.NO_CONTENT,
        'Failed to generate onboarding link',
      );
    }

    return {
      link: onboardingLink,
    };
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
    );
  }
};

// save paypal account
const savePaypalAccount = async (merchantId: string, userId: string) => {
  if (!merchantId || !userId) {
    throw new AppError(
      httpStatus.MISDIRECTED_REQUEST,
      'Missing parametter , failed to connect partner account',
    );
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const result = await User.findByIdAndUpdate(
    userId,
    { paypalMerchantId: merchantId, isPaypalConnected: true },
    { new: true, runValidators: true },
  );
  return result;
};

const PaypalService = {
  createOnboardingLinkForPartnerAccount,
  savePaypalAccount,
};

export default PaypalService;
