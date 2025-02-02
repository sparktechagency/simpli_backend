import { Types } from 'mongoose';

export interface IComplianceInfo {
  bussiness: Types.ObjectId;
  contactName: string;
  contactRole: string;
  phoneNumber: string;
}
