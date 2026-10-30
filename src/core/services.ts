import * as servicesInfra from "../infra/services";
import type { Service } from "../../db/schema";

export const listServices = servicesInfra.listServices;
export const getService = servicesInfra.getServiceById;
export const updateService = servicesInfra.updateService;
export const deleteService = servicesInfra.deleteService;

export async function createService(input: servicesInfra.CreateServiceInput): Promise<Service> {
  if (input.price <= 0) {
    throw new Error("Service price must be greater than zero");
  }
  return servicesInfra.createService(input);
}
