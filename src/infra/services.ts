import { query, queryOne } from "../../db/db.config";
import type { Service } from "../../db/schema";

export function listServices(includeInactive = false): Promise<Service[]> {
  if (includeInactive) {
    return query<Service>("SELECT * FROM services ORDER BY category, name");
  }
  return query<Service>(
    "SELECT * FROM services WHERE is_active = true ORDER BY category, name",
  );
}

export function getServiceById(id: string): Promise<Service | null> {
  return queryOne<Service>("SELECT * FROM services WHERE id = $1", [id]);
}

export type CreateServiceInput = {
  category: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes?: number | null;
  imageUrl?: string | null;
};

export async function createService(input: CreateServiceInput): Promise<Service> {
  const service = await queryOne<Service>(
    `INSERT INTO services (category, name, description, price, duration_minutes, image_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      input.category,
      input.name,
      input.description ?? null,
      input.price,
      input.durationMinutes ?? null,
      input.imageUrl ?? null,
    ],
  );
  if (!service) throw new Error("Failed to create service");
  return service;
}

export type UpdateServiceInput = Partial<{
  category: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number | null;
  imageUrl: string | null;
  isActive: boolean;
}>;

export async function updateService(
  id: string,
  input: UpdateServiceInput,
): Promise<Service | null> {
  return queryOne<Service>(
    `UPDATE services SET
       category = COALESCE($2, category),
       name = COALESCE($3, name),
       description = COALESCE($4, description),
       price = COALESCE($5, price),
       duration_minutes = COALESCE($6, duration_minutes),
       image_url = COALESCE($7, image_url),
       is_active = COALESCE($8, is_active),
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.category ?? null,
      input.name ?? null,
      input.description ?? null,
      input.price ?? null,
      input.durationMinutes ?? null,
      input.imageUrl ?? null,
      input.isActive ?? null,
    ],
  );
}

export async function deleteService(id: string): Promise<boolean> {
  const rows = await query("DELETE FROM services WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}
