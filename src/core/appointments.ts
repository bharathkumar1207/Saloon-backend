import { query } from "../../db/db.config";
import * as appointmentsInfra from "../infra/appointments";
import * as employeesCore from "./employees";
import * as notificationsCore from "./notifications";
import type { Appointment } from "../../db/schema";

export const listAppointments = appointmentsInfra.listAppointments;
export const getAppointment = appointmentsInfra.getAppointmentById;
export const updateAppointment = appointmentsInfra.updateAppointment;
export const deleteAppointment = appointmentsInfra.deleteAppointment;

async function isEmployeeDoubleBooked(employeeId: string, appointmentDate: Date): Promise<boolean> {
  // Treats appointments within 30 minutes of each other as a conflict.
  const rows = await query(
    `SELECT id FROM appointments
     WHERE employee_id = $1
       AND status NOT IN ('cancelled', 'no_show')
       AND appointment_date BETWEEN $2::timestamptz - INTERVAL '30 minutes'
                                AND $2::timestamptz + INTERVAL '30 minutes'`,
    [employeeId, appointmentDate],
  );
  return rows.length > 0;
}

export async function createAppointment(
  input: appointmentsInfra.CreateAppointmentInput,
): Promise<Appointment> {
  if (input.employeeId) {
    const conflict = await isEmployeeDoubleBooked(input.employeeId, input.appointmentDate);
    if (conflict) {
      throw new Error("This employee already has an appointment near that time");
    }
  }

  const appointment = await appointmentsInfra.createAppointment(input);

  if (appointment.employee_id) {
    // Only notify if this employee actually has a portal account — most
    // won't, since employee_id now points to the staff roster, not users.
    const employee = await employeesCore.getEmployee(appointment.employee_id);
    if (employee?.user_id) {
      await notificationsCore.notify({
        userId: employee.user_id,
        type: "appointment",
        title: "New appointment assigned",
        message: `${appointment.customer_name} booked an appointment on ${appointment.appointment_date.toLocaleString()}`,
      });
    }
  }

  return appointment;
}
