// import React, { useState, useEffect } from 'react';
// import { supabase } from '../../database/supabase';
// import AdminBoard from '../../components/AdminBoard';
// import { Edit, Trash2, Check, X } from 'lucide-react';

// interface Salesman {
//   id: number;
//   name: string;
//   created_at: string;
// }

// const SalesmanPage: React.FC = () => {
//   const [name, setName] = useState('');
//   const [salesmen, setSalesmen] = useState<Salesman[]>([]);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const [editingName, setEditingName] = useState('');
//   const [page, setPage] = useState(1);
//   const [totalCount, setTotalCount] = useState(0);
//   const pageSize = 10;

//   const fetchSalesmen = async () => {
//     const from = (page - 1) * pageSize;
//     const to = from + pageSize - 1;

//     const { data, error, count } = await supabase
//       .from('salesmen')
//       .select('*', { count: 'exact' })
//       .order('created_at', { ascending: false })
//       .range(from, to);

//     if (error) console.error('Error fetching salesmen:', error);
//     else {
//       setSalesmen(data || []);
//       setTotalCount(count || 0);
//     }
//   };

//   useEffect(() => {
//     fetchSalesmen();
//   }, [page]);

//   const handleSave = async () => {
//     if (!name.trim()) return;
//     const { error } = await supabase.from('salesmen').insert([{ name }]);
//     if (error) console.error('Error saving salesman:', error);
//     else {
//       setName('');
//       fetchSalesmen();
//     }
//   };

//   const handleEdit = (s: Salesman) => {
//     setEditingId(s.id);
//     setEditingName(s.name);
//   };

//   const handleUpdate = async (id: number) => {
//     if (!editingName.trim()) return;
//     const { error } = await supabase
//       .from('salesmen')
//       .update({ name: editingName })
//       .eq('id', id);

//     if (error) console.error('Error updating salesman:', error);
//     else {
//       setEditingId(null);
//       setEditingName('');
//       fetchSalesmen();
//     }
//   };

//   const handleDelete = async (id: number) => {
//     if (!window.confirm('Are you sure you want to delete this salesman?'))
//       return;
//     const { error } = await supabase.from('salesmen').delete().eq('id', id);
//     if (error) console.error('Error deleting salesman:', error);
//     else fetchSalesmen();
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
//       <AdminBoard />
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Salesman</h1>

//           {/* Form */}
//           <form
//             className="flex flex-col sm:flex-row items-center sm:space-x-2 mb-6 space-y-2 sm:space-y-0"
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleSave();
//             }}
//           >
//             <input
//               type="text"
//               placeholder="Salesman name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 w-full sm:w-auto flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             />
//             <button className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
//               Save
//             </button>
//           </form>

//           {/* Table with horizontal scroll */}
//           <div className="overflow-x-auto">
//             <table className="min-w-[600px] w-full border-collapse border border-gray-300 dark:border-gray-600">
//               <thead>
//                 <tr className="bg-gray-50 dark:bg-gray-700">
//                   <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Created At</th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Name</th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {salesmen.map((s) => (
//                   <tr key={s.id} className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
//                     <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
//                       {new Date(s.created_at).toLocaleString()}
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
//                       {editingId === s.id ? (
//                         <input
//                           type="text"
//                           value={editingName}
//                           onChange={(e) => setEditingName(e.target.value)}
//                           className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                       ) : (
//                         s.name
//                       )}
//                     </td>

//                     <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
//                       <div className="flex space-x-2">
//                         {editingId === s.id ? (
//                           <>
//                             <button
//                               onClick={() => handleUpdate(s.id)}
//                               title="Save"
//                               className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
//                             >
//                               <Check size={18} />
//                             </button>
//                             <button
//                               onClick={() => setEditingId(null)}
//                               title="Cancel"
//                               className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//                             >
//                               <X size={18} />
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <button
//                               onClick={() => handleEdit(s)}
//                               title="Edit"
//                               className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
//                             >
//                               <Edit size={18} />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(s.id)}
//                               title="Delete"
//                               className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
//                             >
//                               <Trash2 size={18} />
//                             </button>
//                           </>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           <div className="flex justify-between items-center mt-6">
//             <button
//               disabled={page === 1}
//               onClick={() => setPage((p) => p - 1)}
//               className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
//             >
//               Previous
//             </button>
//             <span className="text-gray-700 dark:text-gray-200">
//               Page {page} of {Math.ceil(totalCount / pageSize)}
//             </span>
//             <button
//               disabled={page * pageSize >= totalCount}
//               onClick={() => setPage((p) => p + 1)}
//               className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalesmanPage;

import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Check, X } from 'lucide-react';
import AdminBoard from '../../components/AdminBoard';
import {
  listEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  type Entity,
  type EntityName,
} from '../../lib/entities';

const ENTITY: EntityName = 'salesmen';

const SalesmanPage: React.FC = () => {
  const [name, setName] = useState('');
  const [salesmen, setSalesmen] = useState<Entity[]>([]);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const pageSize = 10;

  const fetchSalesmen = async (p = page) => {
    try {
      setLoading(true);
      const resp = await listEntities(ENTITY, { page: p, pageSize });
      setSalesmen(resp.data || []);
      setTotalCount(resp.totalCount || 0);
      setPage(resp.page || p);
    } catch (err) {
      console.error('Error fetching salesmen:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesmen(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSave = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      await createEntity(ENTITY, { name: name.trim() });
      setName('');
      await fetchSalesmen(1);
      setPage(1);
    } catch (err: any) {
      console.error('Error saving salesman:', err);
      if (err?.message) alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (s: Entity) => {
    setEditingId(s.id);
    setEditingName(s.name);
  };

  const handleUpdate = async (id: number | string) => {
    if (!editingName.trim()) return;
    try {
      setSaving(true);
      await updateEntity(ENTITY, id, { name: editingName.trim() });
      setEditingId(null);
      setEditingName('');
      await fetchSalesmen();
    } catch (err: any) {
      console.error('Error updating salesman:', err);
      if (err?.message) alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this salesman?')) return;
    try {
      setSaving(true);
      await deleteEntity(ENTITY, id);
      const newTotal = Math.max(0, totalCount - 1);
      const lastPage = Math.max(1, Math.ceil(newTotal / pageSize));
      if (page > lastPage) setPage(lastPage);
      await fetchSalesmen();
    } catch (err: any) {
      console.error('Error deleting salesman:', err);
      if (err?.message) alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create Salesman</h1>

          <form
            className="flex flex-col sm:flex-row items-center sm:space-x-2 mb-6 space-y-2 sm:space-y-0"
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <input
              type="text"
              placeholder="Salesman name"
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
                ) : salesmen.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">No salesmen found</td>
                  </tr>
                ) : (
                  salesmen.map((s) => (
                    <tr key={String(s.id)} className="bg-white dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {editingId === s.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        ) : (
                          s.name
                        )}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div className="flex space-x-2">
                          {editingId === s.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(s.id)}
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
                                onClick={() => handleEdit(s)}
                                title="Edit"
                                className="text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(s.id)}
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
            <span className="text-gray-700 dark:text-gray-200">Page {page} of {Math.max(1, Math.ceil(totalCount / pageSize))}</span>
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

export default SalesmanPage;

