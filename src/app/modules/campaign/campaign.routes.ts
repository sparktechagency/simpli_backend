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

export const campaignRoutes = router;
