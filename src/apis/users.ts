import { Router } from "express";
import * as usersCore from "../core/users";
import { requireRole } from "./middleware";

export const usersRouter = Router();

// Reads are open to any signed-in staff member — billing needs to list
// employees to assign line items to. Mutations stay manager-only below.
usersRouter.get("/", async (_req, res) => {
  const users = await usersCore.listUsers();
  res.json(users.map(usersCore.toSafeUser));
});

usersRouter.get("/:id", async (req, res) => {
  const user = await usersCore.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(usersCore.toSafeUser(user));
});

usersRouter.post("/", requireRole("manager"), async (req, res) => {
  const user = await usersCore.registerUser(req.body);
  res.status(201).json(usersCore.toSafeUser(user));
});

usersRouter.patch("/:id", requireRole("manager"), async (req, res) => {
  const user = await usersCore.updateUser(req.params.id as string, req.body);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(usersCore.toSafeUser(user));
});

usersRouter.delete("/:id", requireRole("manager"), async (req, res) => {
  const deleted = await usersCore.deleteUser(req.params.id as string);
  if (!deleted) return res.status(404).json({ error: "User not found" });
  res.status(204).send();
});
