import { Router } from "express";
import * as employeesCore from "../core/employees";
import { requireRole } from "./middleware";

export const employeesRouter = Router();

// Reads are open to any signed-in staff member — billing and appointments
// need to list employees to assign work to. Mutations (HR data, including
// salary/aadhar) are manager-only below.
employeesRouter.get("/", async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  const employees = await employeesCore.listEmployees(includeInactive);
  res.json(employees);
});

employeesRouter.get("/:id", async (req, res) => {
  const employee = await employeesCore.getEmployee(req.params.id as string);
  if (!employee) return res.status(404).json({ error: "Employee not found" });
  res.json(employee);
});

employeesRouter.post("/", requireRole("manager"), async (req, res) => {
  const employee = await employeesCore.createEmployee(req.body);
  res.status(201).json(employee);
});

employeesRouter.patch("/:id", requireRole("manager"), async (req, res) => {
  const employee = await employeesCore.updateEmployee(req.params.id as string, req.body);
  if (!employee) return res.status(404).json({ error: "Employee not found" });
  res.json(employee);
});

employeesRouter.delete("/:id", requireRole("manager"), async (req, res) => {
  const deleted = await employeesCore.deleteEmployee(req.params.id as string);
  if (!deleted) return res.status(404).json({ error: "Employee not found" });
  res.status(204).send();
});
