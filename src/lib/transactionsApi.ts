import { api } from "./api";

export async function getTransactions(params:any) {
  const res = await api.get('/api/ledger/transactions', { params });
  return { data: res.data.data, meta: res.data.meta };
}

export type SourceType = 'sale' | 'payment' | 'discount';

export interface UpdateTransactionPayload {
  entry_date?: string;    
  source_type?: SourceType;
  amount?: number;

}

export async function updateTransaction(id: number, payload: UpdateTransactionPayload) {
  // validate input shape on client briefly (optional)
  if (!id || id <= 0) throw new Error('Invalid id');

  // call backend
  const res = await api.put(`/api/ledger/transactions/${id}`, payload);
  // assume backend returns the updated transaction object
  return res.data;
}

export async function deleteTransaction(id: number) {
  if (!id || id <= 0) throw new Error('Invalid id');

  await api.delete(`/api/ledger/transactions/${id}`);
  // success -> nothing returned (204 or 200). Caller can refresh list.
}