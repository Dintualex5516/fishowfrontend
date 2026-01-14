import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBoard from '../../components/AdminBoard';
import SearchableInput from '../../components/SearchableInput';
import { Plus, Trash2, Save } from 'lucide-react';
import { incrementBoxReceiveBatch } from '../../lib/box';
import { listEntities } from '../../lib/entities';

interface BoxReceivedItem {
  id: string;
  customer: string;
  boxCount: string;
}

const FishBoxReceivedForm: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [parties, setParties] = useState<{ id: string; name: string }[]>([]);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [party, setParty] = useState('');
  const [items, setItems] = useState<BoxReceivedItem[]>([
    { id: '1', customer: '', boxCount: '' },
  ]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [focusNewItem, setFocusNewItem] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);


  // Field order for keyboard navigation
  const fieldOrder: (keyof BoxReceivedItem)[] = ['customer', 'boxCount'];
  const headerFieldOrder = ['date', 'party'];

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);


  useEffect(() => {
    let mounted = true;
    const fetchLookups = async () => {
      try {
        const pageSize = 200; // preload reasonably large set
        const [custResp, partyResp] = await Promise.all([
          listEntities('customers', { page: 1, pageSize }),
          listEntities('parties', { page: 1, pageSize }),
          // add salesmen/products if needed
        ]);

        if (!mounted) return;

        if (custResp && Array.isArray(custResp.data)) {
          setCustomers(custResp.data.map(e => ({ id: String(e.id), name: e.name })));
        }
        if (partyResp && Array.isArray(partyResp.data)) {
          setParties(partyResp.data.map(e => ({ id: String(e.id), name: e.name })));
        }
      } catch (err) {
        console.error('Error loading lookups via listEntities:', err);
        setNotification({ message: 'Failed loading lookup data', type: 'error' });
      }
    };

    fetchLookups();
    return () => { mounted = false; };
  }, []);

  // Focus on new item when it's created
  useEffect(() => {
    if (focusNewItem) {
      const focusElement = () => {
        // Try searching in wrapper divs first (for SearchableInput)
        const firstWrapperInput = document.querySelector<HTMLInputElement>(
          `[data-item-id="${focusNewItem}"][data-field="customer"] input`
        );
        if (firstWrapperInput) {
          firstWrapperInput.focus();
        } else {
          // Fallback to regular input
          const firstInput = document.querySelector<HTMLInputElement>(
            `input[data-item-id="${focusNewItem}"][data-field="customer"]`
          );
          firstInput?.focus();
        }
      };

      // Use requestAnimationFrame for more reliable DOM update timing
      requestAnimationFrame(() => {
        setTimeout(focusElement, 10);
      });

      setFocusNewItem(null);
    }
  }, [focusNewItem, items]);

  const addItem = () => {
    const newId = Date.now().toString();
    const newItem: BoxReceivedItem = {
      id: newId,
      customer: '',
      boxCount: '',
    };
    setItems([newItem, ...items]);
    return newId;
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (
    id: string,
    field: keyof BoxReceivedItem,
    value: string
  ) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleCustomerSelect = (itemId: string, customer: { id: string; name: string }) => {
    updateItem(itemId, 'customer', customer.id);
  };

  const handlePartySelect = (party: { id: string; name: string }) => {
    setParty(party.id);
  };

  const calculateTotalBoxes = () => {
    return items.reduce((total, item) => {
      return total + (parseInt(item.boxCount) || 0);
    }, 0);
  };



  const handleSave = async () => {
    if (!party) {
      setNotification({ message: 'Please select a party', type: 'error' });
      return;
    }

    // Build rows for update: only include customer rows that have positive boxes.
    const rowsToSave = items
      .map(it => ({
        customerId: String(it.customer || '').trim(),
        boxes: parseInt(it.boxCount || '0', 10) || 0,
      }))
      .filter(r => r.customerId && r.boxes > 0);

    if (rowsToSave.length === 0) {
      setNotification({ message: 'Please provide at least one customer with boxes', type: 'error' });
      return;
    }


    const entries = rowsToSave.map(r => ({ customerId: String(r.customerId), boxes: r.boxes }));

    const partyIdToSend = String(party);


    try {
      setIsSaving(true);
      const resp = await incrementBoxReceiveBatch(partyIdToSend, entries, date);
      // resp expected: { ok: true, updated: [...], missing: [...] }
      const updatedCount = (resp.updated || []).length;
      const missing = resp.missing || [];

      if (updatedCount > 0) {
        setNotification({ message: `${updatedCount} rows updated`, type: 'success' });
      }
      if (missing.length > 0) {
        setNotification({ message: `Missing rows: ${missing.join(', ')}`, type: 'error' });
      }

      // If everything updated successfully, reset the form (optionally)
      if (missing.length === 0) {
        setDate(new Date().toISOString().split('T')[0]);
        setParty('');
        setItems([{ id: Date.now().toString(), customer: '', boxCount: '' }]);
      }
    } catch (err) {
      const e: any = err;
      setNotification({ message: e?.response?.data?.message ?? e?.message ?? 'Failed to save', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleHeaderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Find the wrapper div with data-field
      const wrapper = (e.target as HTMLElement).closest('[data-field]');
      const currentField = wrapper?.getAttribute('data-field');
      if (!currentField) return;

      const currentIndex = headerFieldOrder.indexOf(currentField);
      if (currentIndex === -1) return;

      const nextField = headerFieldOrder[currentIndex + 1];
      if (!nextField) {
        // Move to first item row's customer field
        if (items.length > 0) {
          // Try searching in wrapper divs first (for SearchableInput)
          const firstWrapperInput = document.querySelector<HTMLInputElement>(
            `[data-item-id="${items[0].id}"][data-field="customer"] input`
          );
          if (firstWrapperInput) {
            firstWrapperInput.focus();
          } else {
            // Fallback to regular input
            const firstInput = document.querySelector<HTMLInputElement>(
              `input[data-item-id="${items[0].id}"][data-field="customer"]`
            );
            firstInput?.focus();
          }
        }
        return;
      }

      // Try searching in wrapper divs first (for SearchableInput fields like party)
      let nextInput = document.querySelector<HTMLInputElement>(
        `[data-field="${nextField}"] input`
      );
      if (nextInput) {
        nextInput.focus();
      } else {
        // Fallback to regular input (for fields like date)
        nextInput = document.querySelector<HTMLInputElement>(
          `input[data-field="${nextField}"]`
        );
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemId: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // Find the data-field from the input or its wrapper
      let currentField = (e.target as HTMLInputElement).dataset.field;
      if (!currentField) {
        const wrapper = (e.target as HTMLElement).closest('[data-field]');
        currentField = wrapper?.getAttribute('data-field') || '';
      }

      if (!currentField) return;

      const currentIndex = fieldOrder.indexOf(currentField as keyof BoxReceivedItem);
      if (currentIndex === -1) return;

      const nextField = fieldOrder[currentIndex + 1];
      if (nextField) {
        // Move to next field in same row
        // Try searching in wrapper divs first (for SearchableInput)
        const nextWrapperInput = document.querySelector<HTMLInputElement>(
          `[data-item-id="${itemId}"][data-field="${nextField}"] input`
        );
        if (nextWrapperInput) {
          nextWrapperInput.focus();
        } else {
          // Fallback to regular input
          const nextInput = document.querySelector<HTMLInputElement>(
            `input[data-item-id="${itemId}"][data-field="${nextField}"]`
          );
          nextInput?.focus();
        }
      } else {
        // End of row - create new row and focus on its first field
        const newId = addItem();
        setFocusNewItem(newId);
      }
    }
  };

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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 h-[600px] flex flex-col">
          <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Box Receive</h1>
          </div>

          {/* Fixed Header Fields */}
          <div className="flex-shrink-0">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onKeyDown={handleHeaderKeyDown}
                  data-field="date"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Party
                </label>
                <SearchableInput
                  value={party}
                  onChange={setParty}
                  placeholder="Search party..."
                  searchData={parties}
                  onSelect={handlePartySelect}
                  onKeyDown={handleHeaderKeyDown}
                  createRoute="/create-party"
                  entityType="party"
                  data-field="party"
                />
              </div>
            </div>
          </div>

          {/* Scrollable Table Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                      Customer
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                      Box Count
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="bg-white dark:bg-gray-800">
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        <SearchableInput
                          value={item.customer}
                          onChange={(value) => updateItem(item.id, 'customer', value)}
                          placeholder="Search customer..."
                          searchData={customers}
                          onSelect={(customer) => handleCustomerSelect(item.id, customer)}
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          createRoute="/create-customer"
                          entityType="customer"
                          className="min-w-[200px]"
                          data-field="customer"
                          data-item-id={item.id}
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        <input
                          type="number"
                          value={item.boxCount}
                          onChange={(e) =>
                            updateItem(item.id, 'boxCount', e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, item.id)}
                          data-item-id={item.id}
                          data-field="boxCount"
                          className="w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          placeholder="0"
                        />
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fixed Total Amount Section */}
          <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <div className="px-4 py-3">
              <div className="flex justify-end items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-4">
                  Total Boxes:
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {calculateTotalBoxes()}
                </span>
              </div>
            </div>
          </div>

          {/* Fixed Bottom Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600 flex-shrink-0">
            <button
              onClick={addItem}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishBoxReceivedForm;