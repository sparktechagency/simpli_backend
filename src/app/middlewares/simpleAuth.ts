/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import Bussiness from '../modules/bussiness/bussiness.model';
import Reviewer from '../modules/reviewer/reviewer.model';
import SuperAdmin from '../modules/superAdmin/superAdmin.model';
import { USER_ROLE } from '../modules/user/user.constant';

const simpleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return next(); // Continue if no token is provided
    }

    let decoded: JwtPayload | null = null;

    try {
      // Verify token to check validity
      decoded = jwt.verify(
        token,
        config.jwt_access_secret as string,
      ) as JwtPayload;
    } catch (err: any) {
      // If token expired, decode without verifying
      if (err.name === 'TokenExpiredError') {
        decoded = jwt.decode(token) as JwtPayload | null;
      } else {
        return next(); // Ignore other errors
      }
    }

    if (decoded) {
      const { id, role } = decoded;

      let profileData;
      if (role === USER_ROLE.bussinessOwner) {
        profileData = await Bussiness.findOne({ user: id }).select('_id');
      } else if (role === USER_ROLE.superAdmin) {
        profileData = await SuperAdmin.findOne({ user: id }).select('_id');
      } else if (role === USER_ROLE.reviewer) {
        profileData = await Reviewer.findOne({ user: id }).select('_id');
      }

      if (profileData) {
        decoded.profileId = profileData._id;
      }

      req.user = decoded;
    }

    next(); // Proceed to the next middleware
  } catch (error) {
    console.log(error);
    next(); // Ignore errors and proceed
  }
};

export default simpleAuth;
