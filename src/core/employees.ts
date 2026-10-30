import * as employeesInfra from "../infra/employees";
import type { Employee } from "../../db/schema";

export const listEmployees = employeesInfra.listEmployees;
export const getEmployee = employeesInfra.getEmployeeById;
export const updateEmployee = employeesInfra.updateEmployee;
export const deleteEmployee = employeesInfra.deleteEmployee;

export async function createEmployee(
  input: employeesInfra.CreateEmployeeInput,
): Promise<Employee> {
  if (!input.name.trim() || !input.mobile.trim()) {
    throw new Error("Name and mobile are required");
  }
  return employeesInfra.createEmployee(input);
}
