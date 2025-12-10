import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBoard from '../../components/AdminBoard';
import SearchableInput from '../../components/SearchableInput';
import { Eye, FileText, Edit, Save, Trash2, Plus, X } from 'lucide-react';
// import { supabase } from '../../database/supabase';
import { listEntities } from '../../lib/entities';

import { listSales, deleteSale, updateSale } from '../../lib/salesSummary';


interface SalesEntry {
  id: string;
  date: string;
  party: string;
  totalBox: string;
  salesman: string;
  items: Array<{
    id: string;
    item: string;
    customer?: string
    box: string;
    kg: string;
    price: string;
    total: string;
  }>;
  totalAmount: string;
  createdAt: string;
  load_number?: number;
  load_number_string?: string;
}

interface BoxEntry {
  id: string;
  date: string;
  party: string;
  totalBox: string;
  createdAt: string;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: SalesEntry | null;
  onSave: (updatedEntry: SalesEntry) => void;
  onDelete: (entry: SalesEntry) => void;
  parties: { id: string; name: string }[];
  salesmenList: { id: string; name: string }[];
  products: { id: string; name: string }[];
  customers: { id: string; name: string }[];
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
  onDelete,
  parties,
  salesmenList,
  products,
  customers
}) => {
  const [editData, setEditData] = useState<SalesEntry | null>(null);

  useEffect(() => {
    if (entry) {
      const partyId = parties.find(p => p.name === entry.party)?.id || entry.party;
      const salesmanId = salesmenList.find(s => s.name === entry.salesman)?.id || entry.salesman;
      //   const updatedItems = entry.items.map(item => {
      //     const itemId = products.find(p => p.name === item.item)?.id || item.item;
      //     return { ...item, item: itemId };
      //   });
      //   setEditData({ ...entry, party: partyId, salesman: salesmanId, items: updatedItems });
      // }
      const updatedItems = entry.items.map(item => {
        const itemId = products.find(p => p.name === item.item)?.id || item.item;
        // try to find customer id from customers prop else keep as-is
        const custId = customers.find(c => c.name === (item.customer || ""))?.id || item.customer || "";
        return { ...item, item: itemId, customer: custId };
      });
      setEditData({ ...entry, party: partyId, salesman: salesmanId, items: updatedItems });
    }
  }, [entry, parties, salesmenList, products, customers]);

  if (!isOpen || !editData) return null;

  const handleInputChange = (field: keyof SalesEntry, value: string) => {
    setEditData(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleItemChange = (itemId: string, field: string, value: string) => {
    setEditData(prev => {
      if (!prev) return null;
      const updatedItems = prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate total when box or price changes
          if (field === 'box' || field === 'price') {
            const box = parseFloat(field === 'box' ? value : updatedItem.box) || 0;
            const price = parseFloat(field === 'price' ? value : updatedItem.price) || 0;
            updatedItem.total = (box * price).toFixed(2);
          }

          return updatedItem;
        }
        return item;
      });

      return {
        ...prev,
        items: updatedItems
      };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const currentItemIndex = editData?.items.findIndex(item => item.id === itemId) ?? -1;
      if (currentItemIndex === -1) return;

      const fieldOrder = ['item', 'box', 'price'];

      if (field === 'item') {
        // Move to box field in same row
        setTimeout(() => {
          const nextInput = document.querySelector<HTMLInputElement>(
            `input[data-item-id="${itemId}"][data-field="box"]`
          );
          nextInput?.focus();
        }, 0);
      } else if (field === 'box') {
        // Move to price field in same row
        setTimeout(() => {
          const nextInput = document.querySelector<HTMLInputElement>(
            `input[data-item-id="${itemId}"][data-field="price"]`
          );
          nextInput?.focus();
        }, 0);
      } else if (field === 'price') {
        // Check if there's a row above this one
        if (currentItemIndex > 0) {
          // Navigate to the row above (previous row's item field)
          const prevRowItem = editData!.items[currentItemIndex - 1];
          if (prevRowItem) {
            setTimeout(() => {
              const prevWrapper = document.querySelector<HTMLDivElement>(
                `[data-item-id="${prevRowItem.id}"][data-field="item"]`
              );
              if (prevWrapper) {
                const input = prevWrapper.querySelector('input');
                input?.focus();
              }
            }, 0);
          }
        } else {
          // No row above, create new row and focus on its item field
          const newItemId = addRow();
          if (newItemId) {
            setTimeout(() => {
              const firstWrapper = document.querySelector<HTMLDivElement>(
                `[data-item-id="${newItemId}"][data-field="item"]`
              );
              if (firstWrapper) {
                const input = firstWrapper.querySelector('input');
                input?.focus();
              }
            }, 0);
          }
        }
      }
    }
  };

  const removeRow = (itemId: string) => {
    if (!editData) return;
    if (editData.items.length <= 1) return; // Keep at least one row

    setEditData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      };
    });
  };

  const addRow = () => {
    if (!editData) return null;

    const newItem = {
      id: crypto.randomUUID(),
      item: '',
      customer: '',
      box: '',
      kg: '',
      price: '',
      total: '',
    };

    setEditData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: [newItem, ...prev.items]
      };
    });

    return newItem.id;
  };

  // const handleSave = () => {
  //   if (editData) {
  //     onSave(editData);
  //     onClose();
  //   }
  // };
  const handleSave = () => {
    if (!editData) return;

    // recompute grand total (server must also recompute, but we send accurate one)
    const computedTotal = (editData.items || []).reduce((sum, it) => {
      const t = parseFloat(String(it.total || "0")) || 0;
      return sum + t;
    }, 0);

    // create a copy with updated totalAmount (string) so parent receives it
    const payloadEntry: SalesEntry = {
      ...editData,
      totalAmount: String(computedTotal.toFixed(2))
    };

    onSave(payloadEntry);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Sales Entry</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Date
              </label>
              <input
                type="date"
                value={editData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Party
              </label>
              <SearchableInput
                value={editData.party}
                onChange={(value) => handleInputChange('party', value)}
                placeholder="Search Party"
                searchData={parties}
                onSelect={() => { }}
                createRoute="/create-party"
                entityType="party"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Total Box
              </label>
              <input
                type="number"
                value={editData.totalBox}
                onChange={(e) => handleInputChange('totalBox', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Salesman
              </label>
              <SearchableInput
                value={editData.salesman}
                onChange={(value) => handleInputChange('salesman', value)}
                placeholder="Search Salesman"
                searchData={salesmenList}
                onSelect={() => { }}
                createRoute="/create-salesman"
                entityType="salesman"
              />
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={addRow}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => entry && onDelete(entry)}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Entry</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Customer
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Item
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Box
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    kg
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Price
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Total
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200 w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {editData.items.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-800">
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <SearchableInput
                        value={item.customer || ''}
                        onChange={(value) => handleItemChange(item.id, 'customer', value)}
                        placeholder="Search Customer"
                        searchData={customers}
                        onSelect={(customer) => handleItemChange(item.id, 'customer', customer.id)}
                        createRoute="/create-customer"
                        entityType="customer"
                        data-field="customer"
                        data-item-id={item.id}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.defaultPrevented) {
                            setTimeout(() => {
                              const nextInput = document.querySelector<HTMLInputElement>(
                                `input[data-item-id="${item.id}"][data-field="box"]`
                              );
                              nextInput?.focus();
                            }, 0);
                          }
                        }}
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <SearchableInput
                        value={item.item}
                        onChange={(value) => handleItemChange(item.id, 'item', value)}
                        placeholder="Search Item"
                        searchData={products}
                        onSelect={(product) => handleItemChange(item.id, 'item', product.id)}
                        createRoute="/create-item"
                        entityType="item"
                        data-field="item"
                        data-item-id={item.id}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.defaultPrevented) {
                            // Move to box field in same row only if dropdown is not open
                            setTimeout(() => {
                              const nextInput = document.querySelector<HTMLInputElement>(
                                `input[data-item-id="${item.id}"][data-field="box"]`
                              );
                              nextInput?.focus();
                            }, 0);
                          } else {
                            // For other keys, call the parent's handleKeyDown
                            handleKeyDown(e, item.id, 'item');
                          }
                        }}
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <input
                        type="number"
                        value={item.box}
                        onChange={(e) => handleItemChange(item.id, 'box', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item.id, 'box')}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="0"
                        data-field="box"
                        data-item-id={item.id}
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.kg}
                        onChange={(e) => handleItemChange(item.id, 'kg', e.target.value)}
                        // optional: navigation, e.g. move to price on Enter
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            setTimeout(() => {
                              const nextInput = document.querySelector<HTMLInputElement>(
                                `input[data-item-id="${item.id}"][data-field="price"]`
                              );
                              nextInput?.focus();
                            }, 0);
                          }
                        }}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="0.00"
                        data-field="kg"
                        data-item-id={item.id}
                      />
                    </td>

                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item.id, 'price')}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="0.00"
                        data-field="price"
                        data-item-id={item.id}
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <input
                        type="text"
                        value={item.total}
                        readOnly
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="0.00"
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                      <button
                        onClick={() => removeRow(item.id)}
                        disabled={editData?.items.length <= 1}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove Row"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

const SalesSummary: React.FC = () => {
  const navigate = useNavigate();
  const [salesEntries, setSalesEntries] = useState<SalesEntry[]>([]);
  const [boxEntries, setBoxEntries] = useState<BoxEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<SalesEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<SalesEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<SalesEntry | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [parties, setParties] = useState<{ id: string; name: string }[]>([]);
  const [salesmenList, setSalesmenList] = useState<{ id: string; name: string }[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(25);
  const [serverSummary, setServerSummary] = useState<{ totalSaleAmount: number; boxesAdded: number; boxesSold: number } | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0); // for pagination / header

  // Generate load number string
  const generateLoadNumberString = (num: number) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letterIndex = Math.floor((num - 1) / 1000);
    const numberPart = ((num - 1) % 1000) + 1;

    if (letterIndex === 0) {
      return `LD${String(numberPart).padStart(3, '0')}`;
    } else {
      const letter = letters[letterIndex - 1];
      return `${letter}${String(numberPart).padStart(3, '0')}`;
    }
  };

  // Filtered entries logic
  const filteredEntries = salesEntries.filter((entry) => {
    const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    // Date filtering
    let dateMatch = true;
    if (start && end && start === end) dateMatch = entryDate === start;
    else if (start && !end) dateMatch = entryDate === start;
    else if (!start && end) dateMatch = entryDate === end;
    else if (start && end) dateMatch = entryDate >= start && entryDate <= end;

    // Salesman filtering
    const salesmanMatch = !selectedSalesman || entry.salesman.toLowerCase().includes(selectedSalesman.toLowerCase());

    return dateMatch && salesmanMatch;
  });

  // Filtered box entries logic (boxes received/purchased)
  const filteredBoxEntries = boxEntries.filter((entry) => {
    const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    // Date filtering
    let dateMatch = true;
    if (start && end && start === end) dateMatch = entryDate === start;
    else if (start && !end) dateMatch = entryDate === start;
    else if (!start && end) dateMatch = entryDate === end;
    else if (start && end) dateMatch = entryDate >= start && entryDate <= end;

    return dateMatch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  useEffect(() => {
    if (startDate && !endDate) setEndDate(startDate);
  }, [startDate, endDate]);


  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let cancelled = false;
    const pageSizeForLookups = 500;

    const loadLookups = async () => {
      try {
        const [partiesResp, salesmenResp, customersResp, productsResp] = await Promise.all([
          listEntities('parties', { page: 1, pageSize: pageSizeForLookups }),
          listEntities('salesmen', { page: 1, pageSize: pageSizeForLookups }),
          listEntities('customers', { page: 1, pageSize: pageSizeForLookups }),
          listEntities('products', { page: 1, pageSize: pageSizeForLookups }),
        ]);

        if (cancelled) return;

        if (Array.isArray(partiesResp.data)) setParties(partiesResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
        if (Array.isArray(salesmenResp.data)) setSalesmenList(salesmenResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
        if (Array.isArray(customersResp.data)) setCustomers(customersResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
        if (Array.isArray(productsResp.data)) setProducts(productsResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
      } catch (err) {
        console.error('Error loading lookups', err);
        if (!cancelled) setNotification({ message: 'Failed loading lookup data', type: 'error' });
      }
    };

    const loadSales = async () => {
      try {
        const resp = await listSales({
          from: startDate || undefined,
          to: endDate || undefined,
          salesman: selectedSalesman || undefined,
          page: currentPage,
          pageSize: entriesPerPage,
        });

        if (cancelled) return;

        // Map server rows -> your SalesEntry format
        const mapped = (resp.data || []).map((sale: any) => {
          const items = Array.isArray(sale.items)
            ? sale.items.map((it: any) => ({
              id: String(it.id ?? crypto.randomUUID()),
              item: it.product_name ?? it.productName ?? it.item ?? '',
              box: it.box != null ? String(it.box) : '',
              kg: it.kg != null ? String(it.kg) : '',
              price: it.price != null ? String(it.price) : '',
              total: it.total != null ? String(it.total) : '',
              customer: it.customer_name ?? it.customerName ?? it.customer ?? '',
            }))
            : [];

          const loadNumberString = sale.load_number_string ?? sale.loadNumberString ?? null;

          return {
            id: String(sale.id),
            date: sale.date,
            party: sale.party_name ?? sale.partyName ?? sale.party ?? '',
            totalBox: String(sale.total_box ?? sale.totalBox ?? 0),
            salesman: sale.salesman_name ?? sale.salesmanName ?? sale.salesman ?? '',
            items,
            totalAmount: String(sale.total_amount ?? sale.totalAmount ?? 0),
            createdAt: sale.created_at ?? sale.createdAt ?? '',
            load_number: sale.load_number ?? sale.loadNumber ?? null,
            load_number_string: loadNumberString ?? (sale.load_number ? loadNumberString(sale.load_number) : null),
          };
        });

        setSalesEntries(mapped);
        setTotalCount(resp.totalCount ?? 0);

        if (resp.summary) {
          setServerSummary({
            totalSaleAmount: resp.summary.totalSaleAmount ?? resp.summary.totalSaleAmount ?? 0,
            boxesAdded: resp.summary.boxesAdded ?? resp.summary.boxesAdded ?? 0,
            boxesSold: resp.summary.boxesSold ?? resp.summary.boxesSold ?? 0,
          });
        } else {
          setServerSummary(null);
        }
      } catch (err) {
        console.error('Error loading sales:', err);
        if (!cancelled) setNotification({ message: 'Failed loading sales', type: 'error' });
      }
    };

    // load both (lookups + sales)
    loadLookups();
    loadSales();

    return () => { cancelled = true; };
  }, [navigate, startDate, endDate, selectedSalesman, currentPage, entriesPerPage]);




  const viewDetails = (entry: SalesEntry) => setSelectedEntry(entry);
  const closeDetails = () => setSelectedEntry(null);

  const handleEdit = (entry: SalesEntry) => {
    setEditingEntry(entry);
  };

  const closeEdit = () => {
    setEditingEntry(null);
  };

  const handleDelete = (entry: SalesEntry) => {
    setDeletingEntry(entry);
  };

  const closeDelete = () => {
    setDeletingEntry(null);
  };


  const confirmDelete = async () => {
    if (!deletingEntry) return;

    try {
      await deleteSale(deletingEntry.id);
      setSalesEntries(prev => prev.filter(entry => entry.id !== deletingEntry.id));
      setNotification({ message: 'Sales entry deleted successfully!', type: 'success' });
      closeDelete();
      closeEdit();
    } catch (err) {
      console.error('Error deleting sales entry:', err);
      setNotification({ message: 'Error deleting sales entry', type: 'error' });
    }
  };


  const handleSaveEdit = async (updatedEntry: SalesEntry) => {
    try {
      // Create maps for quick lookup (for local state update after successful save)
      const partyMap = Object.fromEntries(parties.map(p => [p.id, p.name]));
      const salesmanMap = Object.fromEntries(salesmenList.map(s => [s.id, s.name]));
      const productMap = Object.fromEntries(products.map(p => [p.id, p.name]));
      const customerMap = Object.fromEntries(customers.map(c => [c.id, c.name]));

      const payload = {
        date: updatedEntry.date,
        partyName: updatedEntry.party,
        salesmanName: updatedEntry.salesman,
        totalBox: parseInt(updatedEntry.totalBox || "0", 10),
        entryNumber: updatedEntry.load_number ?? undefined,
        // recompute on the client (server will also recompute for safety)
        totalAmount: (updatedEntry.items || []).reduce((s, it) => s + (parseFloat(it.total || "0") || 0), 0),
        items: (updatedEntry.items || []).map((it: any) => ({
          // send customer id (if the modal stored id), otherwise fall back to name
          customerName: it.customer || it.customerName || null,
          productName: it.item || it.productName || null, // product id
          box: it.box !== "" && it.box != null ? parseInt(String(it.box), 10) : 0,
          kg: it.kg !== "" && it.kg != null ? Number(it.kg) : 0,
          price: it.price !== "" && it.price != null ? parseFloat(String(it.price)) : 0,
          total: it.total !== "" && it.total != null ? parseFloat(String(it.total)) : 0,
          remark: it.remark ?? null,
        })),
      };

      console.log(updatedEntry.id, payload, "id,payload");

      // Call API helper to update
      await updateSale(updatedEntry.id, payload);

      // Map back to names for local UI state (so table shows names not IDs)
      // const updatedEntryWithNames = {
      //   ...updatedEntry,
      //   party: partyMap[updatedEntry.party] ?? String(updatedEntry.party),
      //   salesman: salesmanMap[updatedEntry.salesman] ?? String(updatedEntry.salesman),
      //   items: (updatedEntry.items || []).map((it: any) => ({
      //     ...it,
      //     item: productMap[it.item] ?? String(it.item),
      //   })),
      // };

      const updatedEntryWithNames = {
        ...updatedEntry,
        party: partyMap[updatedEntry.party] ?? String(updatedEntry.party),
        salesman: salesmanMap[updatedEntry.salesman] ?? String(updatedEntry.salesman),
        items: (updatedEntry.items || []).map((it: any) => ({
          ...it,
          item: productMap[it.item] ?? String(it.item),
          customer: it.customer ? (customerMap[it.customer] ?? String(it.customer)) : it.customer,
        })),
      };


      // Replace in local state
      setSalesEntries(prev =>
        prev.map(entry => (entry.id === updatedEntry.id ? updatedEntryWithNames : entry))
      );

      setNotification({ message: 'Sales entry updated successfully!', type: 'success' });
      closeEdit();
    } catch (err: any) {
      console.error('Error updating sales entry:', err);
      // Try to show server message if available
      const message = err?.response?.data?.message || err?.message || 'Error updating sales entry';
      setNotification({ message, type: 'error' });
    }
  };


  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${notification.type === 'success'
              ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
              : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
            }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Summary</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center space-x-2">
                <label>Salesman:</label>
                <input
                  type="text"
                  value={selectedSalesman}
                  onChange={(e) => {
                    setSelectedSalesman(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  placeholder="Search salesman..."
                  className="min-w-[120px] md:min-w-[150px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label>From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label>To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>{filteredEntries.length} entries found</span>
              </div>

              {/* Pagination Info - Always show for consistent UI */}
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Page {currentPage} of {totalPages}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Boxes - All in one line */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Sale</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ₹{filteredEntries.reduce((sum, entry) => sum + (parseFloat(entry.totalAmount) || 0), 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total amount from {filteredEntries.length} entries
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Boxes Added</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredEntries.reduce((sum, entry) => sum + (parseInt(entry.totalBox) || 0), 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total of Total Box column
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Boxes Sold</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {filteredEntries.reduce((sum, entry) => sum + entry.items.reduce((itemSum, item) => itemSum + (parseInt(item.box) || 0), 0), 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total boxes sold (from items)
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Current Balance</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredEntries.reduce((sum, entry) => sum + (parseInt(entry.totalBox) || 0), 0) - filteredEntries.reduce((sum, entry) => sum + entry.items.reduce((itemSum, item) => itemSum + (parseInt(item.box) || 0), 0), 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Boxes available (Added - Sold)
              </div>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No sales entries found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 table-fixed" style={{ minWidth: '900px' }}>
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 w-20">
                      Load No
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 w-24">
                      Date
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 w-32">
                      Party
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 w-20">
                      Total Box
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 w-20">
                      Boxes Sold
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 w-32">
                      Salesman
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200 w-32">
                      Total Amount
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200 w-24">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry, index) => (
                    <tr key={entry.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white truncate">
                        {entry.load_number_string || entry.id}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={entry.party}>
                        {entry.party}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {entry.totalBox}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {entry.items.reduce((sum, item) => sum + (parseInt(item.box) || 0), 0)}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white truncate" title={entry.salesman}>
                        {entry.salesman}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                        ₹{entry.totalAmount}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => viewDetails(entry)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
                            title="Edit Entry"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Details Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sales Entry Details</h2>
                <button
                  onClick={closeDetails}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Date
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{new Date(selectedEntry.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Party
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.party}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Total Box
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.totalBox}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Salesman
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.salesman}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                          Customer
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                          Item
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                          Box
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                          kg
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                          Price
                        </th>
                        <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEntry.items.map((item) => (
                        <tr key={item.id} className="bg-white dark:bg-gray-800">
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                            {item.customer || '-'}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                            {item.item}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                            {item.box}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                            {item.kg}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                            ₹{item.price}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                            ₹{item.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <EditModal
          isOpen={!!editingEntry}
          onClose={closeEdit}
          entry={editingEntry}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          parties={parties}
          salesmenList={salesmenList}
          products={products}
          customers={customers}
        />

        {/* Delete Confirmation Modal */}
        {deletingEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Sales Entry</h2>
                <button
                  onClick={closeDelete}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Are you sure you want to delete this entry?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      This action cannot be undone. This will permanently delete the sales entry for{' '}
                      <span className="font-medium">{deletingEntry.party}</span> on{' '}
                      <span className="font-medium">{new Date(deletingEntry.date).toLocaleDateString()}</span>.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeDelete}
                    className="px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Entry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesSummary;
