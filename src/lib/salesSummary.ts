// src/lib/sales.ts
import { api } from "./api";

export type SalesApiItem = {
  id?: number | string;
  customer_name?: string;
  product_name?: string;
  box?: number | string;
  kg?: number | string;
  price?: number | string;
  total?: number | string;
  remark?: string | null;
  [k: string]: any;
};

export type SalesApiRow = {
  id?: number | string;
  date?: string;
  partyName?: string;
  salesmanName?: string;
  totalBox?: number | string;
  boxSold?: number;
  entryNumber?: number;
  totalAmount?: number | string;
  loadNumber?: number | null;
  loadNumberString?: string | null;
  createdAt?: string;
  items?: SalesApiItem[];
  [k: string]: any;
};

export type SalesListResponse = {
  data: SalesApiRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  summary?: {
    totalSaleAmount: number;
    boxesAdded: number;
    boxesSold: number;
  };
};

export const listSales = async (opts?: {
  from?: string;
  to?: string;
  salesman?: string;
  page?: number;
  pageSize?: number;
}): Promise<SalesListResponse> => {
  const params: any = {};
  if (opts?.from) params.from = opts.from;
  if (opts?.to) params.to = opts.to;
  if (opts?.salesman) params.salesman = opts.salesman;
  params.page = opts?.page ?? 1;
  params.pageSize = opts?.pageSize ?? 25;

  const resp = await api.get("/api/summary", { params });
  console.log(resp)
  return resp.data as SalesListResponse;
};

export const deleteSale = async (id: string | number) => {
  const resp = await api.delete(`/api/summary/${encodeURIComponent(String(id))}`);
  return resp.data;
};

export const updateSale = async (id: string | number, payload: any) => {
  const resp = await api.put(`/api/summary/${encodeURIComponent(String(id))}`, payload);
  return resp.data;
};

export default { listSales, deleteSale, updateSale };
