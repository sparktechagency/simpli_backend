import express from 'express';
import auth from '../../middlewares/auth';
import simpleAuth from '../../middlewares/simpleAuth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLE } from '../user/user.constant';
import CampaignController from './campaign.controller';
import CampaignValidations from './campaign.validation';

const router = express.Router();

router.post(
  '/create-campaign',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(CampaignValidations.createCampaignValidationSchema),
  CampaignController.createCampaign,
);

router.patch(
  '/update-campaign/:id',
  auth(USER_ROLE.bussinessOwner),
  CampaignController.updateCampaign,
);

router.get(
  '/get-campaign',
  auth(USER_ROLE.reviewer),
  CampaignController.getAllCampaign,
);
router.get(
  '/get-my-campaigns',
  auth(USER_ROLE.bussinessOwner),
  CampaignController.getMyCampaigns,
);
router.patch(
  '/change-status/:id',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(CampaignValidations.changeCampaignStatusValidationSchema),
  CampaignController.changeCampaignStatus,
);

router.get(
  '/get-single-campaign/:id',
  simpleAuth,
  CampaignController.getSingleCampaign,
);
router.get(
  '/get-campaign-summary/:id',
  auth(USER_ROLE.bussinessOwner),
  CampaignController.getCampaignSummary,
);
router.get(
  '/get-campaign-performance/:id',
  auth(USER_ROLE.bussinessOwner),
  CampaignController.getCampaignPerformance,
);
export const campaignRoutes = router;
