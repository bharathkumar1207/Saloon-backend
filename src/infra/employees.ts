import { query, queryOne } from "../../db/db.config";
import type { Employee } from "../../db/schema";

export function listEmployees(includeInactive = false): Promise<Employee[]> {
  if (includeInactive) {
    return query<Employee>("SELECT * FROM employees ORDER BY name");
  }
  return query<Employee>("SELECT * FROM employees WHERE is_active = true ORDER BY name");
}

export function getEmployeeById(id: string): Promise<Employee | null> {
  return queryOne<Employee>("SELECT * FROM employees WHERE id = $1", [id]);
}

export type CreateEmployeeInput = {
  name: string;
  mobile: string;
  designation?: string | null;
  salary?: number | null;
  joinedDate?: string | null;
  aadharNumber?: string | null;
  address?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  userId?: string | null;
};

export async function createEmployee(input: CreateEmployeeInput): Promise<Employee> {
  const employee = await queryOne<Employee>(
    `INSERT INTO employees
       (name, mobile, designation, salary, joined_date, aadhar_number, address, email,
        date_of_birth, gender, emergency_contact_name, emergency_contact_phone,
        bank_account_number, bank_ifsc, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      input.name,
      input.mobile,
      input.designation ?? null,
      input.salary ?? null,
      input.joinedDate ?? null,
      input.aadharNumber ?? null,
      input.address ?? null,
      input.email ?? null,
      input.dateOfBirth ?? null,
      input.gender ?? null,
      input.emergencyContactName ?? null,
      input.emergencyContactPhone ?? null,
      input.bankAccountNumber ?? null,
      input.bankIfsc ?? null,
      input.userId ?? null,
    ],
  );
  if (!employee) throw new Error("Failed to create employee");
  return employee;
}

export type UpdateEmployeeInput = Partial<{
  name: string;
  mobile: string;
  designation: string | null;
  salary: number | null;
  joinedDate: string | null;
  aadharNumber: string | null;
  address: string | null;
  email: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  userId: string | null;
  isActive: boolean;
}>;

export async function updateEmployee(
  id: string,
  input: UpdateEmployeeInput,
): Promise<Employee | null> {
  return queryOne<Employee>(
    `UPDATE employees SET
       name = COALESCE($2, name),
       mobile = COALESCE($3, mobile),
       designation = COALESCE($4, designation),
       salary = COALESCE($5, salary),
       joined_date = COALESCE($6, joined_date),
       aadhar_number = COALESCE($7, aadhar_number),
       address = COALESCE($8, address),
       email = COALESCE($9, email),
       date_of_birth = COALESCE($10, date_of_birth),
       gender = COALESCE($11, gender),
       emergency_contact_name = COALESCE($12, emergency_contact_name),
       emergency_contact_phone = COALESCE($13, emergency_contact_phone),
       bank_account_number = COALESCE($14, bank_account_number),
       bank_ifsc = COALESCE($15, bank_ifsc),
       user_id = COALESCE($16, user_id),
       is_active = COALESCE($17, is_active),
       updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.name ?? null,
      input.mobile ?? null,
      input.designation ?? null,
      input.salary ?? null,
      input.joinedDate ?? null,
      input.aadharNumber ?? null,
      input.address ?? null,
      input.email ?? null,
      input.dateOfBirth ?? null,
      input.gender ?? null,
      input.emergencyContactName ?? null,
      input.emergencyContactPhone ?? null,
      input.bankAccountNumber ?? null,
      input.bankIfsc ?? null,
      input.userId ?? null,
      input.isActive ?? null,
    ],
  );
}

export async function deleteEmployee(id: string): Promise<boolean> {
  const rows = await query("DELETE FROM employees WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}
