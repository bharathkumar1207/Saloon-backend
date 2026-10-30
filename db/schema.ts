// Row types mirror the actual Postgres columns (snake_case) exactly, so
// query results can be typed directly with no mapping layer in between.
// The real table definitions live in db/migrations/*.sql.

export type UserRole = "manager" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// The staff roster — distinct from `users` (portal login accounts). Most
// employees have no linked user_id at all, since most won't get portal
// access. appointments.employee_id and bill_items.employee_id both
// reference this table.
export interface Employee {
  id: string;
  user_id: string | null;
  name: string;
  mobile: string;
  designation: string | null;
  salary: string | null;
  joined_date: string | null;
  aadhar_number: string | null;
  address: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Service {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price: string; // numeric columns come back from pg as strings
  duration_minutes: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_id: string;
  employee_id: string | null;
  appointment_date: Date;
  status: AppointmentStatus;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export type NotificationType = "appointment" | "payment" | "system";

export interface Notification {
  id: string;
  user_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: Date;
}

export type PaymentMethod = "cash" | "card" | "upi" | "other";
export type PaymentStatus = "paid" | "pending" | "partial";

export interface Bill {
  id: string;
  bill_number: string;
  appointment_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

// One line item per service performed on a bill. employee_id here (not on
// the bill header) is what lets one bill span multiple employees while
// still attributing revenue correctly per person, per service.
export interface BillItem {
  id: string;
  bill_id: string;
  service_id: string;
  employee_id: string;
  description: string;
  price: string;
  quantity: number;
  created_at: Date;
}

export type ExpenseCategory =
  | "rent"
  | "utilities"
  | "supplies"
  | "salary"
  | "maintenance"
  | "marketing"
  | "other";

// Outgoing money — rent, supplies, salaries paid out, etc. Mirrors bills but
// for expenses instead of revenue.
export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: string;
  paid_to: string | null;
  payment_method: PaymentMethod;
  recorded_by: string | null;
  expense_date: Date;
  created_at: Date;
}
