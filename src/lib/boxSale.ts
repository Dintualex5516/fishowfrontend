// src/api/boxSaleList.ts
import {api} from './api';



export type BoxItem = {
  id: string | number;
  customer: string | null;
  box: number;
  product_name?: string | null;
  price?: number | null;
  total_amount: number;
  remark?: string | null;
  kg?: number | null;
  created_at?: string | null;
};

export type BoxEntry = {
  id: string;
  load_number?: number | null;
  load_number_str?: string | null;
  date?: string | null;
  party?: string | null;
  salesman?: string | null;
  total_box: number;
  items: BoxItem[];
  sold_boxes: number;
  balance: number;
  total_amount: number;
  created_at?: string | null;
};

export async function listBoxSaleRows(opts?: { from?: string; to?: string; date?: string }) {
  const params: any = {};
  if (opts?.from) params.from = opts.from;
  if (opts?.to) params.to = opts.to;
  if (opts?.date) params.date = opts.date;
  const res = await api.get('/api/box-sales/', { params });
  console.log(res,"list box");
  
  return res.data as { items: BoxEntry[]; kpis: { totalSale: number; boxesAdded: number; boxesSold: number; currentBalance: number } };
}

export async function getBoxSaleRow(id: string | number) {
  const res = await api.get(`/api/box-sales/${encodeURIComponent(String(id))}`);
  return res.data;
}

export async function updateBoxSaleRow(id: string | number, payload: Record<string, any>) {
  console.log(payload,"edit")
  const res = await api.put(`/api/box-sales/${encodeURIComponent(String(id))}`, payload);
  return res.data;
}

export async function deleteBoxSaleRow(id: string | number) {
  const res = await api.delete(`/api/box-sales/${encodeURIComponent(String(id))}`);
  return res.data;
}
