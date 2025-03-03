import { JwtPayload } from 'jsonwebtoken';
import { TUserRole } from '../user/user.interface';
import { createToken } from '../user/user.utils';
import config from '../../config';

const loginWithGoogle = async (user: JwtPayload) => {
  const jwtPayload = {
    id: user?._id,
    email: user?.email,
    role: user?.role as TUserRole,
  };
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
};

const oAuthService = {
  loginWithGoogle,
};

export default oAuthService;
