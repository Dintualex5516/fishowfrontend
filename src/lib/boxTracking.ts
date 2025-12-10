import {api} from './api';

export interface RawBoxRow {
  // backend might return various field names; allow multiple variants
  id?: string;
  party_id?: string | number | null;
  customer_id?: string | number | null;
  party_key?: string; // used in some examples
  customer_key?: string;
  party_name?: string;
  customer_name?: string;
  opening_balance?: number;
  lastSent?: number;
  todays_sales?: number;
  todaySales?: number;
  total_to_receive?: number;
  total?: number;
  boxToBeReceived?: number;
  total_received?: number;
  box_receive?: number;
  closing_balance?: number;
  closingBalance?: number;
  balance?: number;
  // other fields might exist
  [k: string]: any;
}

export interface BoxTrackingResponse {
  date: string;
  items: RawBoxRow[];
}

export interface ReceiveUpdate {
  // Prefer ids when available
  partyId?: string | number;
  customerId?: string | number;
  // Fallback to names if ids not available
  partyName?: string;
  customerName?: string;
  receiveDelta: number;
}



// Get aggregated box-tracking rows for a date (YYYY-MM-DD)
export async function getBoxTracking(date: string): Promise<BoxTrackingResponse> {
  const res = await api.get<BoxTrackingResponse>('/api/box-tracking/', {
    params: { date },
  });
  return res.data;
}

// Send receive updates (array of ReceiveUpdate)
export async function receiveBoxes(updates: ReceiveUpdate[]) {
  if (!Array.isArray(updates) || updates.length === 0) {
    throw new Error('updates must be a non-empty array');
  }
  const res = await api.post('/api/box-tracking/receive', { updates });
  return res.data; // { ok: true, updated: [...] } or error
}