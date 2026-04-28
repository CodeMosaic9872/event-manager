"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jwt = require("jsonwebtoken");
const accessSecret = process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret_change_me';
const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret_change_me';
function signAccessToken(payload) {
    const expiresIn = (process.env.JWT_ACCESS_TTL ?? '15m');
    return jwt.sign({ ...payload, tokenType: 'access' }, accessSecret, {
        expiresIn,
    });
}
function signRefreshToken(payload) {
    const expiresIn = (process.env.JWT_REFRESH_TTL ?? '7d');
    return jwt.sign({ ...payload, tokenType: 'refresh' }, refreshSecret, {
        expiresIn,
    });
}
function verifyAccessToken(token) {
    const decoded = jwt.verify(token, accessSecret);
    if (decoded.tokenType !== 'access') {
        throw new Error('Invalid access token type');
    }
    return decoded;
}
function verifyRefreshToken(token) {
    const decoded = jwt.verify(token, refreshSecret);
    if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid refresh token type');
    }
    return decoded;
}
//# sourceMappingURL=jwt.util.js.map