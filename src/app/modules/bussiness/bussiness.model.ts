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
    bussinessName: {
      type: String,
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
    },
    coverImage: {
      type: String,
    },
    facebook: {
      type: String,
    },
    twiter: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
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
    isStripeAccountConnected: {
      type: Boolean,
      default: false,
    },
    stripeConnectedAccountId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Bussiness = mongoose.model<IBussiness>('Bussiness', BussinessSchema);

export default Bussiness;
