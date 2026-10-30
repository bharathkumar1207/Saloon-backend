import { Router } from "express";
import * as servicesCore from "../core/services";
import { requireRole } from "./middleware";

export const servicesRouter = Router();

servicesRouter.get("/", async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  const services = await servicesCore.listServices(includeInactive);
  res.json(services);
});

servicesRouter.get("/:id", async (req, res) => {
  const service = await servicesCore.getService(req.params.id as string);
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json(service);
});

servicesRouter.post("/", requireRole("manager"), async (req, res) => {
  const service = await servicesCore.createService(req.body);
  res.status(201).json(service);
});

servicesRouter.patch("/:id", requireRole("manager"), async (req, res) => {
  const service = await servicesCore.updateService(req.params.id as string, req.body);
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json(service);
});

servicesRouter.delete("/:id", requireRole("manager"), async (req, res) => {
  const deleted = await servicesCore.deleteService(req.params.id as string);
  if (!deleted) return res.status(404).json({ error: "Service not found" });
  res.status(204).send();
});
