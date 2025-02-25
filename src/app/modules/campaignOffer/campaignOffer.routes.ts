import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import CampaignOfferController from './campaignOffer.controller';
import validateRequest from '../../middlewares/validateRequest';
import CampaignOfferValidations from './campaignOffer.validation';

const router = express.Router();

router.post(
  '/accept-campaign-offer',
  auth(USER_ROLE.reviewer),
  validateRequest(CampaignOfferValidations.campaignOfferSchema),
  CampaignOfferController.acceptCampaignOffer,
);

router.get(
  '/get-my-campaign-offer',
  auth(USER_ROLE.reviewer),
  CampaignOfferController.getMyCampaignOffer,
);
export const campaignOfferRoutes = router;
