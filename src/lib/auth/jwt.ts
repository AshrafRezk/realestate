import { SignJWT, jwtVerify } from "jose";
import type { AuthUser } from "../types";

const JWT_SECRET = new TextEncoder().encode(
  import.meta.env.VITE_JWT_SECRET || "change-this-secret-in-production"
);

const JWT_EXPIRY = "1h";

export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

