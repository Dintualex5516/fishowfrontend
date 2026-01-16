import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminBoard from '../../components/AdminBoard';
import {
  getTransactions,
  updateTransaction,
  deleteTransaction,
} from '../../lib/transactionsApi';
import { listEntities, Entity } from '../../lib/entities';
import SearchableInput from '../../components/SearchableInput';

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

const defaultPageSize = 25;

const CashTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const today = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [query, setQuery] = useState('');

  // Customer search states
  const [customers, setCustomers] = useState<Entity[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');

  // Save/Edit modal states
  const [editingTransaction, setEditingTransaction] = useState<CashTransaction | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await listEntities('customers', { pageSize: 1000 });
        setCustomers(response.data);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    loadCustomers();
  }, []);

  // Fetch transactions when page/filters change
  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const buildParams = (): GetTransactionsParams => ({
    start: startDate || undefined,
    end: endDate || undefined,
    customer_id: selectedCustomerId ? Number(selectedCustomerId) : undefined,
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
    const todayStr = new Date().toLocaleDateString('en-CA');
    setStartDate(todayStr);
    setEndDate(todayStr);
    setQuery('');
    setSelectedCustomerId('');
    setSelectedCustomerName('');
    setPage(1);
    fetchList();
  };

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomerName(customer.name);
  };

  const openEditModal = (tx: CashTransaction) => {
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
      console.error('Failed to update', err);
      toast.error('Failed to update transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted');
      fetchList();
    } catch (err) {
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
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Search (customer)</label>
              <SearchableInput
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                placeholder="Search customer..."
                searchData={customers.map((c) => ({ ...c, id: String(c.id) }))}
                onSelect={handleCustomerSelect}
                createRoute="/customers/create"
                entityType="customer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleApplyFilter}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                Apply
              </button>
              <button
                onClick={handleResetFilter}
                className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Source Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
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
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(transaction.entry_date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.customer_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {transaction.source_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => openEditModal(transaction)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Page <span className="font-medium text-gray-900 dark:text-white">{page}</span> of{' '}
              <span className="font-medium text-gray-900 dark:text-white">{totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (page > 1) setPage(page - 1);
                }}
                disabled={page <= 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => {
                  if (page < totalPages) setPage(page + 1);
                }}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md disabled:opacity-50 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingTransaction && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-6 border w-full max-w-md shadow-2xl rounded-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Cash Transaction</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Modify the transaction details below.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  value={editingTransaction.entry_date}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, entry_date: e.target.value })}
                  className="block w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Customer</label>
                <input
                  type="text"
                  value={editingTransaction.customer_name}
                  disabled
                  className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Source Type</label>
                <input
                  type="text"
                  value={editingTransaction.source_type}
                  disabled
                  className="block w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 italic">₹</span>
                  <input
                    type="number"
                    value={editingTransaction.amount}
                    onChange={(e) =>
                      setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value || '0') })
                    }
                    className="block w-full pl-8 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                }}
                className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashTransactions;
