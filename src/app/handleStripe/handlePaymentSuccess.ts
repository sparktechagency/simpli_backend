/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { ENUM_PAYMENT_PURPOSE } from '../utilities/enum';

const handlePaymentSuccess = async (
  metaData: any,
  transactionId: string,
  amount: number,
) => {
  console.log(transactionId, amount);
  if (metaData.paymentPurpose == ENUM_PAYMENT_PURPOSE) {
    console.log('payment purpucse');
  }
};

export default handlePaymentSuccess;
