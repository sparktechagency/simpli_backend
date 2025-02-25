import { Types } from 'mongoose';
import { CampaignOfferStatus } from './campaignOffer.constant';
import { ENUM_DELIVERY_STATUS } from '../../utilities/enum';

export interface ICampaignOffer extends Document {
  campaign: Types.ObjectId;
  product: Types.ObjectId;
  business: Types.ObjectId;
  reviewer: Types.ObjectId;
  shippingAddress: Types.ObjectId;
  status: (typeof CampaignOfferStatus)[keyof typeof CampaignOfferStatus];
  deliveryStatus: (typeof ENUM_DELIVERY_STATUS)[keyof typeof ENUM_DELIVERY_STATUS];
  amount: number;
}
