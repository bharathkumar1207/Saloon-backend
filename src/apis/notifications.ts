import { Router } from "express";
import * as notificationsCore from "../core/notifications";

export const notificationsRouter = Router();

notificationsRouter.get("/", async (req, res) => {
  const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
  const notifications = await notificationsCore.listNotifications(userId);
  res.json(notifications);
});

notificationsRouter.post("/", async (req, res) => {
  const notification = await notificationsCore.notify(req.body);
  res.status(201).json(notification);
});

notificationsRouter.patch("/:id/read", async (req, res) => {
  const notification = await notificationsCore.markNotificationRead(req.params.id);
  if (!notification) return res.status(404).json({ error: "Notification not found" });
  res.json(notification);
});

notificationsRouter.delete("/:id", async (req, res) => {
  const deleted = await notificationsCore.deleteNotification(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Notification not found" });
  res.status(204).send();
});
