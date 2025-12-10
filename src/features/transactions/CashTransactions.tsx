

export type SourceType = 'sale' | 'payment' | 'discount';

export interface CashTransaction {
  id: number;
  customer_id: number;
  customer_name: string;
  entry_date: string; // YYYY-MM-DD
  source_type: SourceType;
  source_id?: number | null;
  source_display?: string | null;
  amount: number;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GetTransactionsParams {
  start?: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
  customer_id?: number;
  source_type?: SourceType;
  q?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Meta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
}

// -- Mock DB (in-memory) ----------------------------------------------------
const randomCustomerNames = [
  'ACME Traders',
  'Blue Ocean Ltd',
  'SeaFresh',
  'Prime Fishery',
  'Harbor Supplies',
];

function formatDate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Create 120 mock transactions over the last 90 days
const MOCK_DB: CashTransaction[] = (() => {
  const arr: CashTransaction[] = [];
  const now = new Date();
  for (let i = 1; i <= 120; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const d = new Date(now);
    d.setDate(now.getDate() - daysAgo);
    const sourceTypes: SourceType[] = ['sale', 'payment', 'discount'];
    const source_type = sourceTypes[Math.floor(Math.random() * sourceTypes.length)];

    arr.push({
      id: i,
      customer_id: (i % 5) + 1,
      customer_name: randomCustomerNames[i % randomCustomerNames.length],
      entry_date: formatDate(d),
      source_type,
      source_id: source_type === 'sale' ? 1000 + i : null,
      source_display: source_type === 'sale' ? `INV-${1000 + i}` : source_type === 'payment' ? `PAY-${2000 + i}` : null,
      amount: parseFloat((Math.random() * 5000 + 100).toFixed(2)),
      note: Math.random() > 0.7 ? 'Manual adjustment' : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  // sort desc by date
  arr.sort((a, b) => (a.entry_date < b.entry_date ? 1 : -1));
  return arr;
})();

// Simulate network latency
function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

// Utilities
function inRange(dateStr: string, start?: string, end?: string) {
  if (!start && !end) return true;
  const d = new Date(dateStr + 'T00:00:00');
  if (start) {
    const s = new Date(start + 'T00:00:00');
    if (d < s) return false;
  }
  if (end) {
    const e = new Date(end + 'T23:59:59');
    if (d > e) return false;
  }
  return true;
}

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminBoard from '../../components/AdminBoard';
import {
  getTransactions,
  updateTransaction, deleteTransaction
} from '../../lib/transactionsApi';

const defaultPageSize = 25;

function lastNDaysDateString(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n + 1); // inclusive
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const CashTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState<string>(lastNDaysDateString(30)); // default last 30 days
  const [endDate, setEndDate] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [query, setQuery] = useState('');

  // editing modal state (Option B: use row data)
  const [editingTransaction, setEditingTransaction] = useState<CashTransaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const buildParams = (): GetTransactionsParams => ({
    start: startDate || undefined,
    end: endDate || undefined,
    q: query || undefined,
    page,
    pageSize,
    sortBy: 'entry_date',
    sortOrder: 'desc',
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = buildParams();
      const res = await getTransactions(params);
      setTransactions(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch transactions', err);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    fetchList();
  };

  const handleResetFilter = () => {
    setStartDate(lastNDaysDateString(30));
    const d = new Date();
    setEndDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    setQuery('');
    setPage(1);
    fetchList();
  };

  const openEditModal = (tx: CashTransaction) => {
    // Option B: populate modal from the row data directly (no getTransaction call)
    setEditingTransaction({ ...tx });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    setSaving(true);
    try {
      await updateTransaction(editingTransaction.id, {
        entry_date: editingTransaction.entry_date,
        amount: editingTransaction.amount,
        note: editingTransaction.note,
      } as any);
      toast.success('Transaction updated');
      setShowEditModal(false);
      setEditingTransaction(null);
      fetchList();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update', err);
      toast.error('Failed to update transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted');
      // keep page stable: if last item on page was removed you may want to go previous page
      fetchList();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete', err);
      toast.error('Failed to delete transaction');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cash Transactions</h1>
          <p className="text-gray-700 dark:text-gray-200 mt-2">Manage cash-related transactions</p>
        </div>

        {/* Filter bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-4 gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 dark:text-gray-300">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 dark:text-gray-300">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-sm text-gray-600 dark:text-gray-300">Search (customer)</label>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={handleApplyFilter} className="px-4 py-2 bg-blue-600 text-white rounded-md">Apply</button>
              <button onClick={handleResetFilter} className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md">Reset</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Source Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">No transactions found.</td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.entry_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.source_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => openEditModal(transaction)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">Edit</button>
                        <button onClick={() => handleDelete(transaction.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">Page {page} of {totalPages}</div>
            <div className="flex items-center space-x-2">
              <button onClick={() => { if (page > 1) setPage(page - 1); }} disabled={page <= 1} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">Prev</button>
              <button onClick={() => { if (page < totalPages) setPage(page + 1); }} disabled={page >= totalPages} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal (populated from row - Option B) */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Cash Transaction</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <input type="date" value={editingTransaction.entry_date} onChange={(e) => setEditingTransaction({ ...editingTransaction, entry_date: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                  <input type="text" value={editingTransaction.customer_name} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-white" />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Source Type</label>
                  <input
                    type="text"
                    value={editingTransaction.source_type}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                  <input type="number" value={editingTransaction.amount} onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value || '0') })} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>

              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button onClick={() => { setShowEditModal(false); setEditingTransaction(null); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashTransactions;
