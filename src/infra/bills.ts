import { pool, query, queryOne } from "../../db/db.config";
import type { Bill, BillItem, PaymentMethod, PaymentStatus } from "../../db/schema";

export function listBills(): Promise<Bill[]> {
  return query<Bill>("SELECT * FROM bills ORDER BY created_at DESC");
}

export function getBillById(id: string): Promise<Bill | null> {
  return queryOne<Bill>("SELECT * FROM bills WHERE id = $1", [id]);
}

export function getBillItems(billId: string): Promise<BillItem[]> {
  return query<BillItem>("SELECT * FROM bill_items WHERE bill_id = $1", [billId]);
}

export type CreateBillItemInput = {
  serviceId: string;
  employeeId: string;
  description: string;
  price: number;
  quantity?: number;
};

export type CreateBillInput = {
  billNumber: string;
  appointmentId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  discount?: number;
  tax?: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  createdBy?: string | null;
  items: CreateBillItemInput[];
};

// Creates a bill and its line items together in one transaction, computing
// subtotal/total from the items so they can never drift from what was billed.
export async function createBillWithItems(
  input: CreateBillInput,
): Promise<{ bill: Bill; items: BillItem[] }> {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * (item.quantity ?? 1),
    0,
  );
  const discount = input.discount ?? 0;
  const tax = input.tax ?? 0;
  const total = subtotal - discount + tax;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const billResult = await client.query<Bill>(
      `INSERT INTO bills
         (bill_number, appointment_id, customer_name, customer_phone, subtotal, discount, tax, total, payment_method, payment_status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        input.billNumber,
        input.appointmentId ?? null,
        input.customerName ?? null,
        input.customerPhone ?? null,
        subtotal,
        discount,
        tax,
        total,
        input.paymentMethod ?? "cash",
        input.paymentStatus ?? "paid",
        input.createdBy ?? null,
      ],
    );
    const bill = billResult.rows[0];

    const items: BillItem[] = [];
    for (const item of input.items) {
      const itemResult = await client.query<BillItem>(
        `INSERT INTO bill_items (bill_id, service_id, employee_id, description, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [bill.id, item.serviceId, item.employeeId, item.description, item.price, item.quantity ?? 1],
      );
      items.push(itemResult.rows[0]);
    }

    await client.query("COMMIT");
    return { bill, items };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export type EmployeeRevenue = {
  employee_id: string;
  employee_name: string;
  total_revenue: string;
  services_count: string;
};

// Revenue generated per employee, optionally scoped to a date range.
export function getRevenueByEmployee(range?: {
  from?: Date;
  to?: Date;
}): Promise<EmployeeRevenue[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (range?.from) {
    params.push(range.from);
    conditions.push(`bi.created_at >= $${params.length}`);
  }
  if (range?.to) {
    params.push(range.to);
    conditions.push(`bi.created_at <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  return query<EmployeeRevenue>(
    `SELECT
       e.id AS employee_id,
       e.name AS employee_name,
       COALESCE(SUM(bi.price * bi.quantity), 0) AS total_revenue,
       COUNT(bi.id) AS services_count
     FROM employees e
     LEFT JOIN bill_items bi ON bi.employee_id = e.id
     ${where}
     GROUP BY e.id, e.name
     ORDER BY total_revenue DESC`,
    params,
  );
}
