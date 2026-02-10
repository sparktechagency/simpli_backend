import { Request, Response } from 'express';
import handlePaypalPaymentSucess from './handlePaypalPaymentSuccess';

const handlePaypalWebhook = async (req: Request, res: Response) => {
  const event = req.body;

  try {
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaypalPaymentSucess(event.resource);
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        // await handlePaymentFailure(event.resource);
        break;

      case 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED':
        // await handlePayoutSuccess(event.resource);
        break;

      case 'PAYMENT.PAYOUTS-ITEM.DENIED':
        // await handlePayoutFailure(event.resource);
        break;

      case 'PAYMENT.SALE.REFUNDED':
        // await handleRefund(event.resource);
        break;

      default:
        console.log(`🚨 Unhandled Event: ${event.event_type}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Webhook Handling Error: ', error);
    res.sendStatus(500);
  }
};

export default handlePaypalWebhook;
