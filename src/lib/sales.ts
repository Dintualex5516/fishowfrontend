import {api} from "./api"

export async function createSale(payload: any) {
  // payload must follow server contract (see caveat #1)
  console.log(payload)
  const resp = await api.post("/api/sales/", payload);
  return resp.data; // { id, loadNumberString, createdAt }
}

// Update sale
export async function updateSale(id: number | string, payload: any) {
  console.log(payload);
  
  const resp = await api.put(`/api/sales/${id}`, payload);
  return resp.data; // { ok: true } or error
}

// Load specific entry
export async function getSaleByEntry({ date, partyName, salesmanName, totalBox, entryNumber }: any) {
  const resp = await api.get("/api/sales/entry", { params: { date, partyName, salesmanName, totalBox, entryNumber }});
  // success: { sale, items }, 404 -> thrown axios error, handle in caller
  return resp.data;
}

// Load latest entry (highest entry_number)
export async function getLatestEntry({ date, partyName, salesmanName, totalBox }: any) {
  const resp = await api.get("/api/sales/entry-latest", { params: { date, partyName, salesmanName, totalBox }});
  return resp.data; // { sale, items }
}

// Next entry number
export async function getNextEntryNumber({ date, partyName, salesmanName, totalBox }: any) {
  const resp = await api.get("/api/sales/next-entry-number", { params: { date, partyName, salesmanName, totalBox }});
  return resp.data; // { nextEntryNumber: number }
}