import { api } from "./api";
export const incrementBoxSaleBatch = async (
  partyId: string,
  entries: { customerId: string; boxes: number }[],
  date: string
) => {
  console.log("incrementBoxSaleBatch payload:", { partyId, entries, date });
  const resp = await api.post("/api/boxes/sale", { partyId, entries, date });
  return resp.data;
};
// lib/box.ts
export type BoxUpdate = { customerId: string; boxes: number };

export const incrementBoxReceiveBatch = async (partyId: string, entries: BoxUpdate[], date: string) => {
  // debug log to be sure
  const resp = await api.post('/api/boxes/receive', { partyId, entries, date });
  return resp.data;
};

//box receive report
export function addBoxReceive(payload: {

  partyName: string;
  customerName: string;
  boxes: number;
  date: string;
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

export type BoxSummaryRow = {
  partyId: number;
  party: string;
  balance: number;
};

export type GetDailyBoxSummaryResponse = {
  date: string;
  rows: BoxSummaryRow[];
  totals: { totalBalance: number };
};
// daily box summary – customer details
export type DailyBoxSummaryCustomerRow = {
  customerId: number;
  customer: string;
  boxes: number;
};

export type GetDailyBoxSummaryCustomersResponse = {
  rows: DailyBoxSummaryCustomerRow[];
};

export async function getDailyBoxSummary(date: string): Promise<GetDailyBoxSummaryResponse> {
  const { data } = await api.get<GetDailyBoxSummaryResponse>("/api/boxes/daily-summary", {
    params: { date },
  });
  return data;
}

export async function getDailyBoxSummaryCustomers(
  date: string,
  partyId: number
): Promise<GetDailyBoxSummaryCustomersResponse> {
  const { data } = await api.get<GetDailyBoxSummaryCustomersResponse>(
    "/api/boxes/daily-summary/customers",
    {
      params: {
        date,
        partyId,
      },
    }
  );
  return data;
}


export type PartyBoxBalance = {
  partyId: number,
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

export type TotalBoxBalanceCustomerRow = {
  customerId: number;
  customer: string;
  total_balance: number;
};

export async function getTotalBoxBalanceCustomers(
  partyId: number
): Promise<{ rows: TotalBoxBalanceCustomerRow[] }> {
  const { data } = await api.get("/api/boxes/total-balance/customers", {
    params: { partyId },
  });

  console.log("customerData", data)
  return data;
}
