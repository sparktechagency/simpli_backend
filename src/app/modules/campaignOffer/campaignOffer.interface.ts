import { Types } from 'mongoose';
import { ENUM_DELIVERY_STATUS } from '../../utilities/enum';
import { CampaignOfferStatus } from './campaignOffer.constant';

export interface ICampaignOffer extends Document {
  campaign: Types.ObjectId;
  product: Types.ObjectId;
  business: Types.ObjectId;
  reviewer: Types.ObjectId;
  shippingAddress: Types.ObjectId;
  status: (typeof CampaignOfferStatus)[keyof typeof CampaignOfferStatus];
  deliveryStatus: (typeof ENUM_DELIVERY_STATUS)[keyof typeof ENUM_DELIVERY_STATUS];
  amount: number;
  shipping?: IShippingInfo;
}

export interface IShippingInfo {
  rateId: string;
  provider: string;
  service?: string;
  amount: number;
  currency: string;
  shipmentId: string;
  status?: string; // e.g., "PENDING", "SHIPPED", "DELIVERED"
  trackingNumber?: string;
  labelUrl?: string;
  trackingUrl?: string;
  shippoTransactionId: string;
}
