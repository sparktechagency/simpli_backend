/* eslint-disable @typescript-eslint/no-explicit-any */
// src/controllers/handleShippoWebhook.ts

import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { CampaignOffer } from '../modules/campaignOffer/campaignOffer.model';
import { Order } from '../modules/order/order.model';
import shippo from '../utilities/shippo';

export const handleShippoWebhook = async (req: Request, res: Response) => {
  try {
    const event = JSON.parse(req.body.toString());

    // -------------------------------------
    // TRANSACTION CREATED
    // -------------------------------------
    if (
      event.event === 'transaction_created' &&
      event.data.status === 'SUCCESS'
    ) {
      const transactionId = event.data.object_id;
      const transaction = await shippo.transactions.get(transactionId);

      const shippingUpdate = {
        status: 'PURCHASED',
        trackingNumber: transaction.trackingNumber,
        labelUrl: transaction.labelUrl,
        trackingUrl: transaction.trackingUrlProvider,
      };

      const models: { model: Model<any>; label: string }[] = [
        { model: Order, label: 'Order' },
        { model: CampaignOffer, label: 'CampaignOffer' },
      ];

      for (const { model, label } of models) {
        const doc = await model.findOneAndUpdate(
          { 'shipping.shippoTransactionId': transactionId },
          { $set: { shipping: shippingUpdate } },
          { new: true },
        );

        if (doc) {
          console.log(`${label} ${doc._id} updated with shipping info`);
        }
      }
    }

    // -------------------------------------
    // TRACK UPDATED
    // -------------------------------------
    if (event.event === 'track_updated') {
      console.log('Track update event:', event.data);
      const trackingNumber = event.data?.tracking_number;
      const status = event.data?.tracking_status?.status;

      if (!trackingNumber || !status) {
        return res.status(200).send('No tracking info');
      }

      const models: { model: Model<any>; label: string }[] = [
        { model: Order, label: 'Order' },
        { model: CampaignOffer, label: 'CampaignOffer' },
      ];

      for (const { model, label } of models) {
        const doc = await model.findOneAndUpdate(
          { 'shipping.trackingNumber': trackingNumber },
          { $set: { 'shipping.status': status } },
          { new: true },
        );

        if (doc) {
          console.log(`${label} ${doc._id} tracking updated to: ${status}`);
        }
      }
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Shippo webhook error:', err);
    return res.status(500).send('Webhook handler failed');
  }
};
