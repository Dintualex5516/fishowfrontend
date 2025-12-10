import { api } from "./api";

export type DashboardMetrics = {
  totalSales: number;
  activeCustomers: number;
  boxes: { itemsBoxes: number; boxSaleBoxes: number; totalBoxes: number };
  activeParties: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { data } = await api.get<DashboardMetrics>("/api/dashboard/metrics");
  return data;
}