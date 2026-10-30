import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import * as usersInfra from "../infra/users";
import type { User, UserRole } from "../../db/schema";

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plainPassword, salt, SCRYPT_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(plainPassword, salt, SCRYPT_KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function listUsers(): Promise<User[]> {
  return usersInfra.listUsers();
}

export function getUser(id: string): Promise<User | null> {
  return usersInfra.getUserById(id);
}

export type RegisterUserInput = {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
  role: UserRole;
};

export async function registerUser(input: RegisterUserInput): Promise<User> {
  const existing = await usersInfra.getUserByEmail(input.email);
  if (existing) {
    throw new Error("A user with this email already exists");
  }

  return usersInfra.createUser({
    name: input.name,
    email: input.email,
    phone: input.phone,
    passwordHash: hashPassword(input.password),
    role: input.role,
  });
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = await usersInfra.getUserByEmail(email);
  if (!user || !user.is_active) return null;
  return verifyPassword(password, user.password_hash) ? user : null;
}

export const updateUser = usersInfra.updateUser;
export const deleteUser = usersInfra.deleteUser;

export type SafeUser = Omit<User, "password_hash">;

export function toSafeUser(user: User): SafeUser {
  const { password_hash: _passwordHash, ...safeUser } = user;
  return safeUser;
}
