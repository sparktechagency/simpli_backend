import bcrypt from 'bcrypt';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { TUser, UserModel } from './user.interface';

const userSchema = new Schema<TUser>(
  {
    profileId: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      // unique: true,
    },
    password: {
      type: String,
      // required: true,
    },
    passwordChangedAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['bussinessOwner', 'reviewer', 'superAdmin'],
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verifyCode: {
      type: Number,
    },
    resetCode: {
      type: Number,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isResetVerified: {
      type: Boolean,
      default: false,
    },
    codeExpireIn: {
      type: Date,
    },
    emailChangeCode: {
      type: Number,
    },
    isEmailChangeVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      default: '',
    },
    appleId: {
      type: String,
      default: '',
    },
    facebookId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  user.password = await bcrypt.hash(
    user.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});
// statics method for check is user exists
userSchema.statics.isUserExists = async function (phoneNumber: string) {
  return await User.findOne({ phoneNumber }).select('+password');
};
// statics method for check password match  ----
userSchema.statics.isPasswordMatched = async function (
  plainPasswords: string,
  hashPassword: string,
) {
  return await bcrypt.compare(plainPasswords, hashPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChange = async function (
  passwordChangeTimeStamp,
  jwtIssuedTimeStamp,
) {
  const passwordChangeTime = new Date(passwordChangeTimeStamp).getTime() / 1000;

  return passwordChangeTime > jwtIssuedTimeStamp;
};

export const User = model<TUser, UserModel>('User', userSchema);
