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
  const [phone, setPhone] = useState(''); // ➕
  const [customers, setCustomers] = useState<Entity[]>([]);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingPhone, setEditingPhone] = useState(''); // ➕
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
  }, [page]);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await createEntity(ENTITY, { 
        name: name.trim(), 
        phone: phone.trim() // ➕
      });
      setName('');
      setPhone('');
      await fetchCustomers(1);
      setPage(1);
    } catch (err: any) {
      alert(err?.message || "Error saving customer");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c: Entity) => {
    setEditingId(c.id);
    setEditingName(c.name);
    setEditingPhone(c.phone || ''); // ➕
  };

  const handleUpdate = async (id: number | string) => {
    if (!editingName.trim()) return;
    try {
      setSaving(true);
      await updateEntity(ENTITY, id, { 
        name: editingName.trim(),
        phone: editingPhone.trim() // ➕
      });
      setEditingId(null);
      setEditingName('');
      setEditingPhone('');
      await fetchCustomers();
    } catch (err: any) {
      alert(err?.message || "Error updating customer");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      setSaving(true);
      await deleteEntity(ENTITY, id);
      const newTotal = Math.max(0, totalCount - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
      if (page > lastPage) setPage(lastPage);
      await fetchCustomers();
    } catch (err: any) {
      alert(err?.message || "Error deleting customer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Create Customer
          </h1>

          {/* FORM */}
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

            {/* ➕ PHONE INPUT */}
            <input
              type="text"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border px-4 py-3 text-left text-sm font-medium">Created At</th>
                  <th className="border px-4 py-3 text-left text-sm font-medium">Name</th>
                  <th className="border px-4 py-3 text-left text-sm font-medium">Phone</th> {/* ➕ */}
                  <th className="border px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center">Loading...</td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center">No customers found</td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={String(c.id)} className="border-b">
                      <td className="border px-4 py-3 text-sm">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : '-'}
                      </td>

                      <td className="border px-4 py-3 text-sm">
                        {editingId === c.id ? (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          c.name
                        )}
                      </td>

                      {/* ➕ PHONE COLUMN */}
                      <td className="border px-4 py-3 text-sm">
                        {editingId === c.id ? (
                          <input
                            value={editingPhone}
                            onChange={(e) => setEditingPhone(e.target.value)}
                            className="border rounded px-2 py-1 w-full"
                          />
                        ) : (
                          c.phone || '-'
                        )}
                      </td>

                      <td className="border px-4 py-3 text-sm">
                        <div className="flex space-x-2">
                          {editingId === c.id ? (
                            <>
                              <button onClick={() => handleUpdate(c.id)} className="text-green-600">
                                <Check size={18} />
                              </button>
                              <button onClick={() => setEditingId(null)} className="text-gray-500">
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(c)} className="text-yellow-500">
                                <Edit size={18} />
                              </button>
                              <button onClick={() => handleDelete(c.id)} className="text-red-500">
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

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span>
              Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}
            </span>

            <button
              disabled={page * pageSize >= totalCount || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-2 bg-gray-200 rounded disabled:opacity-50"
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