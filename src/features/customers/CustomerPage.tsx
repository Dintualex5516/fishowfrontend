import React, { useEffect, useState } from 'react';
import AdminBoard from '../../components/AdminBoard';
import { Edit, Trash2, Check, X } from 'lucide-react';
import {
  listEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  type Entity,
  type EntityName,
} from '../../lib/entities';

const ENTITY: EntityName = 'customers';

const CustomerPage: React.FC = () => {
  const [name, setName] = useState('');
  const [customers, setCustomers] = useState<Entity[]>([]);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const pageSize = 10;

  const fetchCustomers = async (p = page) => {
    try {
      setLoading(true);
      const resp = await listEntities(ENTITY, { page: p, pageSize });
      setCustomers(resp.data || []);
      setTotalCount(resp.totalCount || 0);
      setPage(resp.page || p);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      const created = await createEntity(ENTITY, { name: name.trim() });
      // prepend new item if it fits current page ordering
      // simplest approach: refetch current page
      setName('');
      await fetchCustomers(1);
      setPage(1);
    } catch (err: any) {
      console.error('Error saving customer:', err);
      if (err?.message) alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c: Entity) => {
    setEditingId(c.id);
    setEditingName(c.name);
  };

  const handleUpdate = async (id: number | string) => {
    if (!editingName.trim()) return;
    try {
      setSaving(true);
      await updateEntity(ENTITY, id, { name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
      await fetchCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      if ((err as any)?.message) alert((err as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      setSaving(true);
      await deleteEntity(ENTITY, id);
      // if we deleted the last item on the last page, move to previous page
      const newTotal = Math.max(0, totalCount - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
      if (page > lastPage) setPage(lastPage);
      await fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      if ((err as any)?.message) alert((err as any).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Customer</h1>

          <form
            className="flex flex-col sm:flex-row items-center sm:space-x-2 mb-6 space-y-2 sm:space-y-0"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <input
              type="text"
              placeholder="Customer name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full sm:w-auto flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>

          <div className="overflow-x-auto">
            <table className="min-w-[600px] w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Created At</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Name</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">Loading...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">No customers found</td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={String(c.id)} className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : '-'}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {editingId === c.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          c.name
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div className="flex space-x-2">
                          {editingId === c.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(c.id)}
                                title="Save"
                                className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                title="Cancel"
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEdit(c)}
                                title="Edit"
                                className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(c.id)}
                                title="Delete"
                                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Previous
            </button>

            <span className="text-gray-700 dark:text-gray-200">
              Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>

            <button
              disabled={page * pageSize >= totalCount || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerPage;
