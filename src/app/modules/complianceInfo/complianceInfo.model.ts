import mongoose, { Schema } from 'mongoose';
import { IComplianceInfo } from './complianceInfo.interface';

const ComplianceInfoSchema = new Schema<IComplianceInfo>(
  {
    bussiness: {
      type: Schema.Types.ObjectId,
      ref: 'Bussiness',
      required: true,
    },
    contactName: {
      type: String,
      required: true,
    },
    contactRole: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ComplianceInfo = mongoose.model<IComplianceInfo>(
  'ComplianceInfo',
  ComplianceInfoSchema,
);

export default ComplianceInfo;
