import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import validateRequest from '../../middlewares/validateRequest';
import CampaignValidations from './campaign.validation';
import CampaignController from './campaign.controller';

const router = express.Router();

router.post(
  '/create-campaign',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(CampaignValidations.createCampaignValidationSchema),
  CampaignController.createCampaign,
);
router.get(
  '/get-campaign',
  // auth(USER_ROLE.sampler, USER_ROLE.sampler),
  CampaignController.getAllCampaign,
);
router.patch(
  '/change-status/:id',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(CampaignValidations.changeCampaignStatusValidationSchema),
  CampaignController.changeCampaignStatus,
);
export const campaignRoutes = router;
