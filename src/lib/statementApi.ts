
import { api } from './api';
export interface StatementRow {
  saleId: number;
  date: string;
  party: string;
  salesman: string;
  customer: string;
  item: string;
  boxesSold: number;
  kg: number;
  price: number;
  grandTotal: number;
}

export interface StatementTotals {
  salesBetween: number;         
  totalCashPaid: number;        
  balanceBeforeStart: number;   
}

export interface StatementResponse {
  ok: boolean;
  customerId: number | null;
  customerName: string | null;
  rows: StatementRow[];
  totals: StatementTotals;
}

export interface StatementParams {
  start: string;
  end: string;
  customerId: number | string;
}

export async function getStatement(params: StatementParams): Promise<StatementResponse> {
  const res = await api.get<StatementResponse>('/api/statements', { params });
  return res.data;
}


export interface BoxTransactionParty {
  id: number | null;
  name: string;
}

export interface BoxTransactionItem {
  id: number;
  trans_date: string; 
  party: BoxTransactionParty | null;
  box_sold: number;
  box_sale: number;
  box_receive: number;
}

export interface BoxTransactionsResponse {
  ok: boolean;
  data: BoxTransactionItem[];
}

export interface BoxTransactionsParams {
  start: string;          
  end: string;            
  customer_id: number;   
  pageSize?: number;     
}

export async function getBoxTransactions(
  params: BoxTransactionsParams
): Promise<BoxTransactionsResponse> {
  const res = await api.get<BoxTransactionsResponse>('/api/statements/box', {
    params,
  });

  return res.data;
}

