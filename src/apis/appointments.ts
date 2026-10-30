import { Router } from "express";
import * as appointmentsCore from "../core/appointments";
import type { AppointmentStatus } from "../../db/schema";

export const appointmentsRouter = Router();

appointmentsRouter.get("/", async (req, res) => {
  const employeeId = typeof req.query.employeeId === "string" ? req.query.employeeId : undefined;
  const status =
    typeof req.query.status === "string" ? (req.query.status as AppointmentStatus) : undefined;
  const appointments = await appointmentsCore.listAppointments({ employeeId, status });
  res.json(appointments);
});

appointmentsRouter.get("/:id", async (req, res) => {
  const appointment = await appointmentsCore.getAppointment(req.params.id);
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  res.json(appointment);
});

appointmentsRouter.post("/", async (req, res) => {
  const appointment = await appointmentsCore.createAppointment({
    ...req.body,
    appointmentDate: new Date(req.body.appointmentDate),
  });
  res.status(201).json(appointment);
});

appointmentsRouter.patch("/:id", async (req, res) => {
  const appointment = await appointmentsCore.updateAppointment(req.params.id, {
    ...req.body,
    appointmentDate: req.body.appointmentDate ? new Date(req.body.appointmentDate) : undefined,
  });
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });
  res.json(appointment);
});

appointmentsRouter.delete("/:id", async (req, res) => {
  const deleted = await appointmentsCore.deleteAppointment(req.params.id);
  if (!deleted) return res.status(404).json({ error: "Appointment not found" });
  res.status(204).send();
});
