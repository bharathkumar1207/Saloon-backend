-- Separates the staff roster from portal login accounts. `users` is now
-- purely "who can log into the management portal" (manager or employee
-- permission tier). `employees` is the full staff roster used for HR data
-- and billing/appointment attribution — most staff will have a row here
-- with no linked `users` row at all, since most won't get portal access.

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  designation TEXT,
  salary NUMERIC(10, 2),
  joined_date DATE,
  aadhar_number VARCHAR(20),
  address TEXT,
  email VARCHAR(255),
  date_of_birth DATE,
  gender TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone VARCHAR(20),
  bank_account_number TEXT,
  bank_ifsc VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employees_user_id ON employees(user_id);

-- Backfill: every existing portal user (manager or employee) gets a
-- matching roster row too, reusing the SAME id. That keeps every existing
-- appointments/bill_items.employee_id value valid once the foreign keys
-- below are re-pointed at `employees` — no data rows need to change, just
-- the constraint target. (A manager can still have performed billable
-- services historically, so this covers that case too.)
INSERT INTO employees (id, user_id, name, mobile, is_active, created_at, updated_at)
SELECT id, id, name, COALESCE(phone, 'unknown'), is_active, created_at, updated_at
FROM users;

ALTER TABLE appointments DROP CONSTRAINT appointments_employee_id_fkey;
ALTER TABLE appointments ADD CONSTRAINT appointments_employee_id_fkey
  FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE bill_items DROP CONSTRAINT bill_items_employee_id_fkey;
ALTER TABLE bill_items ADD CONSTRAINT bill_items_employee_id_fkey
  FOREIGN KEY (employee_id) REFERENCES employees(id);
