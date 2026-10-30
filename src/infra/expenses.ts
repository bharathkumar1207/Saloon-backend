import { query, queryOne } from "../../db/db.config";
import type { Expense, ExpenseCategory, PaymentMethod } from "../../db/schema";

export function listExpenses(filters?: { from?: Date; to?: Date }): Promise<Expense[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.from) {
    params.push(filters.from);
    conditions.push(`expense_date >= $${params.length}`);
  }
  if (filters?.to) {
    params.push(filters.to);
    conditions.push(`expense_date <= $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query<Expense>(`SELECT * FROM expenses ${where} ORDER BY expense_date DESC`, params);
}

export function getExpenseById(id: string): Promise<Expense | null> {
  return queryOne<Expense>("SELECT * FROM expenses WHERE id = $1", [id]);
}

export type CreateExpenseInput = {
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidTo?: string | null;
  paymentMethod?: PaymentMethod;
  recordedBy?: string | null;
  expenseDate?: Date;
};

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const expense = await queryOne<Expense>(
    `INSERT INTO expenses (category, description, amount, paid_to, payment_method, recorded_by, expense_date)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, now()))
     RETURNING *`,
    [
      input.category,
      input.description,
      input.amount,
      input.paidTo ?? null,
      input.paymentMethod ?? "cash",
      input.recordedBy ?? null,
      input.expenseDate ?? null,
    ],
  );
  if (!expense) throw new Error("Failed to create expense");
  return expense;
}

export async function deleteExpense(id: string): Promise<boolean> {
  const rows = await query("DELETE FROM expenses WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}
