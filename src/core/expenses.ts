import * as expensesInfra from "../infra/expenses";
import type { Expense } from "../../db/schema";

export const listExpenses = expensesInfra.listExpenses;
export const getExpense = expensesInfra.getExpenseById;
export const deleteExpense = expensesInfra.deleteExpense;

export async function createExpense(input: expensesInfra.CreateExpenseInput): Promise<Expense> {
  if (input.amount <= 0) {
    throw new Error("Expense amount must be greater than zero");
  }
  return expensesInfra.createExpense(input);
}
