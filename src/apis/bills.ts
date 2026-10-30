import { Router } from "express";
import * as billsCore from "../core/bills";

export const billsRouter = Router();

billsRouter.get("/", async (_req, res) => {
  const bills = await billsCore.listBills();
  res.json(bills);
});

billsRouter.get("/revenue-by-employee", async (req, res) => {
  const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
  const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;
  const revenue = await billsCore.getRevenueByEmployee({ from, to });
  res.json(revenue);
});

billsRouter.get("/:id", async (req, res) => {
  const bill = await billsCore.getBill(req.params.id);
  if (!bill) return res.status(404).json({ error: "Bill not found" });
  const items = await billsCore.getBillItems(bill.id);
  res.json({ ...bill, items });
});

billsRouter.post("/", async (req, res) => {
  const result = await billsCore.createBill(req.body);
  res.status(201).json(result);
});
