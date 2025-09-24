import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import CampaignOfferController from './campaignOffer.controller';
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
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  CampaignOfferController.getMyCampaignOffer,
);

router.get(
  '/get-single-campaign-offer/:id',
  auth(USER_ROLE.reviewer, USER_ROLE.bussinessOwner),
  CampaignOfferController.getSingleCampaignOffer,
);
router.post(
  '/proceed-delivery',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(
    CampaignOfferValidations.proceedDeliveryForCampaignOfferValidationSchema,
  ),
  CampaignOfferController.proceedDeliveryForCampaignOffer,
);

router.get(
  '/track-offer-shipment/:id',
  auth(USER_ROLE.bussinessOwner, USER_ROLE.reviewer),
  CampaignOfferController.trackingOfferShipment,
);

export const campaignOfferRoutes = router;
