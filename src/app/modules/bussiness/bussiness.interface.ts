import { Types } from 'mongoose';
import { bussinessType, industryType } from './bussiness.constant';

export interface IBussiness {
  user: Types.ObjectId;
  bussinessName: string;
  email: string;
  tradeName: string;
  bussinessType: (typeof bussinessType)[keyof typeof bussinessType];
  industryType: (typeof industryType)[keyof typeof industryType];
  bussinessAddress: string;
  phoneNumber: string;
  taxtIndentificationNumber: number;
  einNumber: number;
  incorparationCertificate: string;
  bussinessLicense: string;
  coverImage: string;
  logo: string;
  facebook: string;
  twiter: string;
  tiktok: string;
  instagram: string;
  website: string;
  linkedin: string;
  isBussinessDocumentProvided: boolean;
  isComplianceInfoProvided: boolean;
  isBussinessInfoProvided: boolean;
}
