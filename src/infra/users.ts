import { query, queryOne } from "../../db/db.config";
import type { User, UserRole } from "../../db/schema";

export function listUsers(): Promise<User[]> {
  return query<User>("SELECT * FROM users ORDER BY created_at DESC");
}

export function getUserById(id: string): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE id = $1", [id]);
}

export function getUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>("SELECT * FROM users WHERE email = $1", [email]);
}

export type CreateUserInput = {
  name: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
  role: UserRole;
};

export async function createUser(input: CreateUserInput): Promise<User> {
  const user = await queryOne<User>(
    `INSERT INTO users (name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [input.name, input.email, input.phone ?? null, input.passwordHash, input.role],
  );
  if (!user) throw new Error("Failed to create user");
  return user;
}

export type UpdateUserInput = Partial<{
  name: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
}>;

export async function updateUser(id: string, input: UpdateUserInput): Promise<User | null> {
  return queryOne<User>(
    `UPDATE users SET
       name = COALESCE($2, name),
       phone = COALESCE($3, phone),
       role = COALESCE($4, role),
       is_active = COALESCE($5, is_active),
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, input.name ?? null, input.phone ?? null, input.role ?? null, input.isActive ?? null],
  );
}

export async function deleteUser(id: string): Promise<boolean> {
  const rows = await query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}
