import * as jwt from 'jsonwebtoken';
import { PlatformRole } from '../constants/roles.constant';

type AccessTokenPayload = {
  sub: string;
  email?: string;
  roles: PlatformRole[];
  tokenType: 'access';
};

type RefreshTokenPayload = {
  sub: string;
  ver: number;
  jti: string;
  tokenType: 'refresh';
};

function resolveSecret(envKey: 'JWT_ACCESS_SECRET' | 'JWT_REFRESH_SECRET', fallback: string) {
  const value = process.env[envKey];
  if (value && value.trim().length > 0) {
    return value;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${envKey} is required in production`);
  }
  return fallback;
}

const accessSecret = resolveSecret('JWT_ACCESS_SECRET', 'dev_access_secret_change_me');
const refreshSecret = resolveSecret('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me');

export function signAccessToken(payload: Omit<AccessTokenPayload, 'tokenType'>): string {
  const expiresIn = (process.env.JWT_ACCESS_TTL ?? '15m') as jwt.SignOptions['expiresIn'];
  return jwt.sign({ ...payload, tokenType: 'access' }, accessSecret, {
    expiresIn,
  });
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, 'tokenType'>): string {
  const expiresIn = (process.env.JWT_REFRESH_TTL ?? '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign({ ...payload, tokenType: 'refresh' }, refreshSecret, {
    expiresIn,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, accessSecret) as AccessTokenPayload;
  if (decoded.tokenType !== 'access') {
    throw new Error('Invalid access token type');
  }
  return decoded;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, refreshSecret) as RefreshTokenPayload;
  if (decoded.tokenType !== 'refresh') {
    throw new Error('Invalid refresh token type');
  }
  return decoded;
}
