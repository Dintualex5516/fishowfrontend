import { api } from "./api";

export type LedgerRow = {
  customer: { id: string | null; name: string } | string; 
  opening: number;
  todaysAmount: number;
  paid?: number;
  discount?: number;
};

export type GetCollectionResponse = {
  date: string;
  rows: LedgerRow[];
};

export async function getLedgerCollection(date: string): Promise<GetCollectionResponse> {
 
  
  const { data } = await api.get<GetCollectionResponse>(`/api/ledger/collection`, {
    params: { date },
  });
  console.log(data,"get result ledger")
  return data;
}

export async function saveLedgerCollection(payload: {
  date: string;
  items: Array<{ customerId: string|null; paid?: number; discount?: number }>;
}): Promise<{ message: string }> {
    console.log(payload, "ledger payload")
  const { data } = await api.post(`/api/ledger/collection`, payload);
  return data;
}


//Daily Summary

export type SummaryRow = {
  id: number;
  party: string;
  salesman: string;
  totalBox: number;
  grandTotal: number;
  entryNumber: number | null;
  loadNumber: number | null;
};

export type GetDailySummaryResponse = {
  date: string;
  rows: SummaryRow[];
  totals: {
    totalBox: number;
    grandTotal: number;
  };
};

export async function getDailySummary(date: string): Promise<GetDailySummaryResponse> {
  const { data } = await api.get<GetDailySummaryResponse>("/api/daily/summary", {
    params: { date },
  });
  return data;
}

//sales Register

export type SalesRegisterRow = {
  party: string;
  totalBox: number;
  salesman: string;
  customer: string;
  product: string | null;
  boxesSold: number | null;
  price: number | null;
  total: number | null;
  cashPaid: number;
  discount: number;
};

export type GetSalesRegisterResponse = {
  date: string;
  rows: SalesRegisterRow[];
};

export async function getSalesRegister(date: string): Promise<GetSalesRegisterResponse> {
  const { data } = await api.get<GetSalesRegisterResponse>("/api/sales-register/register", {
    params: { date },
  });
  return data;
}