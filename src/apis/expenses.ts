import { Router } from "express";
import * as expensesCore from "../core/expenses";

export const expensesRouter = Router();

expensesRouter.get("/", async (req, res) => {
  const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;
  const expenses = await expensesCore.listExpenses({ from, to });
  res.json(expenses);
});

expensesRouter.get("/:id", async (req, res) => {
  const expense = await expensesCore.getExpense(req.params.id);
  if (!expense) return res.status(404).json({ error: "Expense not found" });
  res.json(expense);
});

expensesRouter.post("/", async (req, res) => {
  const expense = await expensesCore.createExpense({
    ...req.body,
    expenseDate: req.body.expenseDate ? new Date(req.body.expenseDate) : undefined,
  });
  res.status(201).json(expense);
});

expensesRouter.delete("/:id", async (req, res) => {
  const deleted = await expensesCore.deleteExpense(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Expense not found" });
  res.status(204).send();
});
