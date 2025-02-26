// import paypal from '@paypal/checkout-server-sdk';
// import paypalClient from '../utilities/paypal';
// import { Request, Response } from 'express';
// import Campaign from '../modules/campaign/campaign.model';
// import { ENUM_PAYMENT_STATUS } from '../utilities/enum';

// const capturePayPalPayment = async (req: Request, res: Response) => {
//   const orderId = req.query.token;
//   try {
//     const captureRequest = new paypal.orders.OrdersCaptureRequest(
//       orderId as string,
//     );
//     captureRequest.requestBody({});
//     const captureResponse = await paypalClient.execute(captureRequest);
//     if (captureResponse.result.status !== 'COMPLETED') {
//       console.error('Payment Capture Failed:', captureResponse);
//       return res.redirect(`${process.env.PAYPAL_CANCEL_URL}`);
//     }
//     const orderRequest = new paypal.orders.OrdersGetRequest(orderId as string);
//     const orderResponse = await paypalClient.execute(orderRequest);

//     const purchaseUnit = orderResponse.result.purchase_units[0];
//     const campaignId = purchaseUnit.custom_id || 'UNKNOWN_CAMPAIGN';
//     const paymentPurpose = purchaseUnit.reference_id || 'UNKNOWN_PURPOSE';

//     const transactionId = captureResponse.result.id;
//     const amount = purchaseUnit.amount.value;
//     await Campaign.findByIdAndUpdate(campaignId, {
//       paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
//     });
//     console.log(
//       `Transaction ID: ${transactionId}, Amount: ${amount}, Campaign ID: ${campaignId}, Payment Purpose: ${paymentPurpose}`,
//     );
//     return res.redirect(
//       `${process.env.PAYPAL_SUCCESS_URL}?campaign_id=${campaignId}&transaction_id=${transactionId}&amount=${amount}`,
//     );
//   } catch (error) {
//     console.error('PayPal Capture Error:', error);
//     return res.redirect(`${process.env.PAYPAL_CANCEL_URL}`);
//   }
// };

// export default capturePayPalPayment;

import paypal from '@paypal/checkout-server-sdk';
import paypalClient from '../utilities/paypal';
import { Request, Response } from 'express';
import Campaign from '../modules/campaign/campaign.model';
import { ENUM_PAYMENT_PURPOSE, ENUM_PAYMENT_STATUS } from '../utilities/enum';
import handleOrderPaymentSuccess from './handleOrderPaymentSuccess';

const capturePayPalPayment = async (req: Request, res: Response) => {
  const orderId = req.query.token;
  try {
    const captureRequest = new paypal.orders.OrdersCaptureRequest(
      orderId as string,
    );
    captureRequest.requestBody({});
    const captureResponse = await paypalClient.execute(captureRequest);
    if (captureResponse.result.status !== 'COMPLETED') {
      console.error('Payment Capture Failed:', captureResponse);
      return res.redirect(`${process.env.PAYPAL_CANCEL_URL}`);
    }
    const orderRequest = new paypal.orders.OrdersGetRequest(orderId as string);
    const orderResponse = await paypalClient.execute(orderRequest);

    const purchaseUnit = orderResponse.result.purchase_units[0];
    const id = purchaseUnit.custom_id || 'UNKNOWN_CAMPAIGN';
    const paymentPurpose = purchaseUnit.reference_id || 'UNKNOWN_PURPOSE';
    const transactionId = captureResponse.result.id;
    const amount = purchaseUnit.amount.value;

    if (paymentPurpose === ENUM_PAYMENT_PURPOSE.ORDER) {
      await handleOrderPaymentSuccess(req, res, id, transactionId, amount);
    }

    // await Campaign.findByIdAndUpdate(campaignId, {
    //   paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
    // });
    // console.log(
    //   `Transaction ID: ${transactionId}, Amount: ${amount}, Campaign ID: ${campaignId}, Payment Purpose: ${paymentPurpose}`,
    // );
    // return res.redirect(
    //   `${process.env.PAYPAL_SUCCESS_URL}?campaign_id=${campaignId}&transaction_id=${transactionId}&amount=${amount}`,
    // );
  } catch (error) {
    console.error('PayPal Capture Error:', error);
    return res.redirect(`${process.env.PAYPAL_CANCEL_URL}`);
  }
};

export default capturePayPalPayment;
