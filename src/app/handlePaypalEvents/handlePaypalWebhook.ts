import { Request, Response } from 'express';

const handlePaypalWebhook = async (req: Request, res: Response) => {
  const event = req.body;
  console.log('📌 Received PayPal Webhook Event: ', event.event_type);

  try {
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // await handleBusinessOwnerPayment(event.resource);
        console.log('paypal complted');
        break;

      case 'PAYMENT.CAPTURE.DENIED':
        // await handlePaymentFailure(event.resource);
        console.log('payment capture denied');
        break;

      case 'PAYMENT.PAYOUTS-ITEM.SUCCEEDED':
        // await handlePayoutSuccess(event.resource);
        console.log('paymetn payuts item success');
        break;

      case 'PAYMENT.PAYOUTS-ITEM.DENIED':
        // await handlePayoutFailure(event.resource);
        console.log('payment payouts deined');
        break;

      case 'PAYMENT.SALE.REFUNDED':
        // await handleRefund(event.resource);
        console.log('payment sale refunded');
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
