import * as billsInfra from "../infra/bills";
import type { Bill, BillItem } from "../../db/schema";

export const listBills = billsInfra.listBills;
export const getBill = billsInfra.getBillById;
export const getBillItems = billsInfra.getBillItems;
export const getRevenueByEmployee = billsInfra.getRevenueByEmployee;

function generateBillNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `INV-${datePart}-${randomPart}`;
}

export async function createBill(
  input: Omit<billsInfra.CreateBillInput, "billNumber">,
): Promise<{ bill: Bill; items: BillItem[] }> {
  if (input.items.length === 0) {
    throw new Error("A bill must have at least one item");
  }

  return billsInfra.createBillWithItems({
    ...input,
    billNumber: generateBillNumber(),
  });
}
