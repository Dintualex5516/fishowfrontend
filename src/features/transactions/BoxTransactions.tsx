// File: src/features/box/BoxTransactions.tsx
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminBoard from '../../components/AdminBoard';
import {
  getBoxTransactions,
  updateBoxTransaction,
  deleteBoxTransaction,
  BoxTransactionItem,
} from '../../lib/boxTransactionsApi';


const defaultPageSize = 25;

function lastNDaysDateString(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n + 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const BoxTransactions: React.FC = () => {
  const [rows, setRows] = useState<BoxTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const today = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [queryCustomer, setQueryCustomer] = useState<string>(''); // optional future use

  // Edit modal state
  const [editing, setEditing] = useState<BoxTransactionItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const buildParams = () => ({
    start: startDate || undefined,
    end: endDate || undefined,
    page,
    pageSize,
  });

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getBoxTransactions(buildParams());
      setRows(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch box transactions', err);
      toast.error('Failed to load box transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    setPage(1);
    fetchList();
  };

  const handleReset = () => {
    const todayStr = new Date().toLocaleDateString('en-CA');
    setStartDate(todayStr);
    setEndDate(todayStr);
    setPage(1);
    fetchList();
  };

  const openEdit = (r: BoxTransactionItem) => {
    setEditing({ ...r });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateBoxTransaction(editing.id, {
        trans_date: editing.trans_date,
        box_sale: editing.box_sale,
        box_receive: editing.box_receive,
      });
      toast.success('Transaction updated');
      setShowEditModal(false);
      setEditing(null);
      fetchList();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to update box transaction', err);
      toast.error('Failed to update transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await deleteBoxTransaction(id);
      toast.success('Transaction deleted');
      // adjust page if needed
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Box Transactions</h1>
            <p className="text-gray-700 dark:text-gray-200 mt-2">Manage box receive & sale records</p>
          </div>
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

            <div className="flex items-center space-x-2 ml-auto">
              <button onClick={handleApplyFilter} className="px-4 py-2 bg-blue-600 text-white rounded-md">Apply</button>
              <button onClick={handleReset} className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md">Reset</button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Box Received</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Box Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">No transactions found.</td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(r.trans_date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{r.party.name}</td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{r.customer.name}</td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{r.box_receive}</td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{r.box_sale}</td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => openEdit(r)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                          <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                        </div>
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

      {/* Edit Modal */}
      {showEditModal && editing && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit Box Transaction</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                  <input type="date" value={editing.trans_date} onChange={(e) => setEditing({ ...editing, trans_date: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Party</label>
                  <input type="text" value={editing.party.name} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                  <input type="text" value={editing.customer.name} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Box Received</label>
                  <input type="number" value={editing.box_receive} onChange={(e) => setEditing({ ...editing, box_receive: parseInt(e.target.value || '0') })} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Box Sold</label>
                  <input type="number" value={editing.box_sale} onChange={(e) => setEditing({ ...editing, box_sale: parseInt(e.target.value || '0') })} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button onClick={() => { setShowEditModal(false); setEditing(null); }} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxTransactions;
