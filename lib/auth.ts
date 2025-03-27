"use server";

import jwt from "jsonwebtoken";

interface DecodedToken {
  id: string;
  email: string;
  name: string;
  roles: string[];
  iat: number;
  exp: number;
  macAddress:string
}
import { decode } from "jsonwebtoken";

export async function verifyAuth(token: string): Promise<DecodedToken> {
  return new Promise((resolve, reject) => {
    try {
      // Web Crypto API verification (example of decoding the token, you may need custom logic for signature)
      const decoded = decode(token, { complete: true }) as jwt.JwtPayload;
      
      resolve(decoded.payload as DecodedToken);
    } catch (err) {
      reject(err);
    }
  });
}
