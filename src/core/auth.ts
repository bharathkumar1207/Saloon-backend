import jwt from "jsonwebtoken";
import * as usersCore from "./users";
import type { SafeUser } from "./users";
import type { User, UserRole } from "../../db/schema";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "12h";

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
};

function getSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set. Copy .env.example to .env and configure it.");
  }
  return JWT_SECRET;
}

export function signToken(user: User): string {
  const payload: AuthTokenPayload = { sub: user.id, role: user.role };
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getSecret()) as AuthTokenPayload;
}

export type LoginResult = { user: SafeUser; token: string };

export async function login(email: string, password: string): Promise<LoginResult | null> {
  const user = await usersCore.authenticateUser(email, password);
  if (!user) return null;
  return { user: usersCore.toSafeUser(user), token: signToken(user) };
}
