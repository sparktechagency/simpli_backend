/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import Stripe from 'stripe';
import config from '../config';
import StripeService from '../modules/stripe/stripe.service';

const stripe = new Stripe(config.stripe.stripe_secret_key as string);
const handleConnectedAccountWebhook = async (req: Request, res: Response) => {
  const endpointSecret = config.stripe
    .webhook_endpoint_secret_for_connected as string;
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      endpointSecret,
    );
    console.log('webhook hit from connected account', event.type);

    // Handle different event types
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        console.log('account-============<', account);
        if (account.details_submitted) {
          try {
            await StripeService.updateStripeConnectedAccountStatus(account.id);
          } catch (err) {
            console.error(
              `Failed to update client status for Stripe account ID: ${account.id}`,
              err,
            );
          }
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { userId, subscriptionId } = paymentIntent.metadata;

        console.log(
          `Payment failed for user ${userId}, subscription ${subscriptionId}`,
        );

        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send('Success');
  } catch (err: any) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export default handleConnectedAccountWebhook;
