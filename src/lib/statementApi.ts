
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
  cashPaid?: number;
  remark: string;
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
  remark: string;
}

// export interface BoxTransactionsResponse {
//   ok: boolean;
//   data: BoxTransactionItem[];
// }
export interface BoxTransactionsResponse {
  ok: boolean;
  openingBalance: number;
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


export type DailyReturnRow = {
  party_id: number;
  box_type: string;
  total_returned: number;
};

export type DailyReturnCustomerRow = {
  customer_id: number;
  customer: string;
  boxes_returned: number;
};

export async function getDailyReturn(date: string) {
  const { data } = await api.get('/api/statements/daily-return', {
    params: { date },
  });
  return data;
}

export async function getDailyReturnCustomers(date: string, partyId: number) {
  const { data } = await api.get('/api/statements/daily-return/customers', {
    params: { date, partyId },
  });
  return data;
}


