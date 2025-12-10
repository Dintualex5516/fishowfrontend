import { api } from "./api";




export const incrementBoxSaleBatch = async (
  partyId: string,
  entries: { customerId: string; boxes: number }[],
  date:string
) => {
  console.log("incrementBoxSaleBatch payload:", { partyId, entries,date });
  const resp = await api.post("/api/boxes/sale", { partyId, entries,date });
  return resp.data;
};
// lib/box.ts
export type BoxUpdate = { customerId: string; boxes: number };

export const incrementBoxReceiveBatch = async (partyId: string, entries: BoxUpdate[]) => {
  // debug log to be sure
  console.log('incrementBoxReceiveBatch payload:', { partyId, entries });
  const resp = await api.post('/api/boxes/receive', { partyId, entries });
  return resp.data;
};


//box receive report
export function addBoxReceive(payload: {
 
  partyName: string;
  customerName: string;
  boxes: number;
  date:string;
}) {
  return api.post("/api/boxes/report", payload);
}


export type BoxReceiveRow = {
  id: string;
  date: string;
  party: string;
  totalBox: number;
  salesman: string;
  customer: string;
  item: string;
  boxesSold: number;
  boxReceived: number;
  balance: number;
  _partyName: string;    
  _customerName: string;  
  _saleItemId: number;    
};

export type GetBoxReceiveReportResponse = {
  start: string;
  end: string;
  rows: BoxReceiveRow[];
};

export async function getBoxReceiveReport(start: string, end: string) {
  const { data } = await api.get<GetBoxReceiveReportResponse>("/api/boxes/receive-report", {
    params: { start, end },
  });
  console.log(data)
  return data;
}


//daily box summary

export type BoxSummaryRow = {
  party: string;
  totalBox: number;
  boxesSold: number;
  balance: number;
};

export type GetDailyBoxSummaryResponse = {
  date: string;
  rows: BoxSummaryRow[];
  totals: { totalBalance: number };
};

export async function getDailyBoxSummary(date: string): Promise<GetDailyBoxSummaryResponse> {
  const { data } = await api.get<GetDailyBoxSummaryResponse>("/api/boxes/daily-summary", {
    params: { date },
  });
  return data;
}

export type PartyBoxBalance = {
  party: string;
  totalBox: number;
  boxesSold: number;
  totalBalance: number;
};

export type GetTotalBoxBalanceResponse = {
  rows: PartyBoxBalance[];
  totals: { grandTotal: number };
};

export async function getTotalBoxBalance(): Promise<GetTotalBoxBalanceResponse> {
  const { data } = await api.get<GetTotalBoxBalanceResponse>("/api/boxes/total-balance");
  return data;
}