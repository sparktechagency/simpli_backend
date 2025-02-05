import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import ComplianceInfoController from './complianceInfo.controller';
import validateRequest from '../../middlewares/validateRequest';
import complicanceInfoValidations from './complianceInfo.validation';

const router = express.Router();

router.post(
  '/create-compliance-info',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(
    complicanceInfoValidations.createComplianceInfoValidationSchema,
  ),
  ComplianceInfoController.createComplianceInfo,
);
router.patch(
  '/update-compliance-info/:id',
  auth(USER_ROLE.bussinessOwner),
  validateRequest(
    complicanceInfoValidations.updateComplianceInfoValidationSchema,
  ),
  ComplianceInfoController.updateComplianceInfo,
);

router.delete(
  '/delete-compliance-info/:id',
  auth(USER_ROLE.bussinessOwner),
  ComplianceInfoController.deleteComplianceInfo,
);
router.get(
  '/get-compliance-info-for-bussiness/:id',
  ComplianceInfoController.getComplianceInfoForBussiness,
);
export const complianceInfoRoutes = router;
