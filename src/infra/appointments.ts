import { query, queryOne } from "../../db/db.config";
import type { Appointment, AppointmentStatus } from "../../db/schema";

export function listAppointments(filters?: {
  employeeId?: string;
  status?: AppointmentStatus;
}): Promise<Appointment[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.employeeId) {
    params.push(filters.employeeId);
    conditions.push(`employee_id = $${params.length}`);
  }
  if (filters?.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query<Appointment>(
    `SELECT * FROM appointments ${where} ORDER BY appointment_date DESC`,
    params,
  );
}

export function getAppointmentById(id: string): Promise<Appointment | null> {
  return queryOne<Appointment>("SELECT * FROM appointments WHERE id = $1", [id]);
}

export type CreateAppointmentInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  serviceId: string;
  employeeId?: string | null;
  appointmentDate: Date;
  notes?: string | null;
};

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const appointment = await queryOne<Appointment>(
    `INSERT INTO appointments
       (customer_name, customer_phone, customer_email, service_id, employee_id, appointment_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.customerName,
      input.customerPhone,
      input.customerEmail ?? null,
      input.serviceId,
      input.employeeId ?? null,
      input.appointmentDate,
      input.notes ?? null,
    ],
  );
  if (!appointment) throw new Error("Failed to create appointment");
  return appointment;
}

export type UpdateAppointmentInput = Partial<{
  employeeId: string | null;
  appointmentDate: Date;
  status: AppointmentStatus;
  notes: string | null;
}>;

export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput,
): Promise<Appointment | null> {
  return queryOne<Appointment>(
    `UPDATE appointments SET
       employee_id = COALESCE($2, employee_id),
       appointment_date = COALESCE($3, appointment_date),
       status = COALESCE($4, status),
       notes = COALESCE($5, notes),
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.employeeId ?? null,
      input.appointmentDate ?? null,
      input.status ?? null,
      input.notes ?? null,
    ],
  );
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const rows = await query("DELETE FROM appointments WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}
