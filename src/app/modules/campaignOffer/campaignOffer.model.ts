import { model, Schema } from 'mongoose';
import { ENUM_DELIVERY_STATUS } from '../../utilities/enum';
import { CampaignOfferStatus } from './campaignOffer.constant';
import { ICampaignOffer } from './campaignOffer.interface';

const CampaignOfferSchema: Schema = new Schema<ICampaignOffer>(
  {
    campaign: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    business: { type: Schema.Types.ObjectId, ref: 'Bussiness', required: true },
    reviewer: { type: Schema.Types.ObjectId, ref: 'Reviewer', required: true },
    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: 'ShippingAddress',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CampaignOfferStatus),
      required: true,
      default: CampaignOfferStatus.accept,
    },
    deliveryStatus: {
      type: String,
      enum: Object.values(ENUM_DELIVERY_STATUS),
      required: true,
      default: ENUM_DELIVERY_STATUS.waiting,
    },
    amount: { type: Number, required: true },
    shipping: {
      rateId: { type: String, required: false },
      provider: { type: String, required: false },
      service: { type: String, required: false },
      amount: { type: Number, required: false, default: 0 },
      currency: { type: String, required: false },
      shipmentId: { type: String, required: false },
      status: { type: String, default: 'PENDING' }, // PENDING until shipped
      trackingNumber: { type: String, default: null },
      labelUrl: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
      shippoTransactionId: { type: String, default: '' },
    },
  },
  { timestamps: true },
);

export const CampaignOffer = model<ICampaignOffer>(
  'CampaignOffer',
  CampaignOfferSchema,
);
