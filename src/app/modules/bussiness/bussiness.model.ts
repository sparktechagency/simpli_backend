import mongoose, { Schema } from 'mongoose';
import { bussinessType, industryType } from './bussiness.constant';
import { IBussiness } from './bussiness.interface';

const BussinessSchema = new Schema<IBussiness>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    bio: {
      type: String,
      default: '',
    },
    bussinessName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address.'],
    },
    tradeName: {
      type: String,
    },
    bussinessType: {
      type: String,
      enum: Object.values(bussinessType),
    },
    industryType: {
      type: String,
      enum: Object.values(industryType),
    },
    bussinessAddress: {
      type: String,
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      match: [
        /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*$/,
        'Please use a valid website URL.',
      ],
    },
    logo: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    facebook: {
      type: String,
    },
    twiter: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    instagram: {
      type: String,
      default: '',
    },
    tiktok: {
      type: String,
      default: '',
    },
    taxtIndentificationNumber: {
      type: Number,
    },
    einNumber: {
      type: Number,
    },
    incorparationCertificate: {
      type: String,
    },
    bussinessLicense: {
      type: String,
    },
    isBussinessDocumentProvided: {
      type: Boolean,
      default: false,
    },
    isBussinessInfoProvided: {
      type: Boolean,
      default: false,
    },
    isComplianceInfoProvided: {
      type: Boolean,
      default: false,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reviewer' }],
  },
  {
    timestamps: true,
  },
);

const Bussiness = mongoose.model<IBussiness>('Bussiness', BussinessSchema);

export default Bussiness;
