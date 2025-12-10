// src/services/boxTransactionsApi.ts
import { api } from './api'; 



export interface BoxTransactionItem {
  id: number;
  trans_date: string;
  customer: {
    id: number | null;
    name: string;
  };
  party: {
    id: number | null;
    name: string;
  };
  box_sale: number;
  box_receive: number;
  created_at?: string;
  updated_at?: string;
}

export interface BoxTransactionsResponse {
  data: BoxTransactionItem[];
  meta: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
}

export interface GetBoxTransactionsParams {
  start?: string;     
  end?: string;         
  customer_id?: number;
  party_id?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;      
  sortOrder?: 'asc' | 'desc';
}


export async function getBoxTransactions(
  params: GetBoxTransactionsParams = {}
): Promise<BoxTransactionsResponse> {
  const res = await api.get('/api/box-transactions', { params });
  return res.data;
}


export interface UpdateBoxTransactionPayload {
  trans_date?: string;
  box_sale?: number;
  box_receive?: number;
}

export async function updateBoxTransaction(
  id: number,
  payload: UpdateBoxTransactionPayload
): Promise<BoxTransactionItem> {
  const res = await api.put(`/api/box-transactions/${id}`, payload);
  return res.data;
}

export async function deleteBoxTransaction(id: number): Promise<void> {
  await api.delete(`/api/box-transactions/${id}`);
}
