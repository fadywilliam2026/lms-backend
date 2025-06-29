export interface JwtPayload {
  userId?: number;

  clientId?: number;

  jti: string;

  /**
   * Issued at
   */
  iat: number;

  /**
   * Expiration time
   */
  exp: number;
}
