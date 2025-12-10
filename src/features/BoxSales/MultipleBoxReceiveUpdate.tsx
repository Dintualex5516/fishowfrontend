import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBoard from '../../components/AdminBoard';
import { Save } from 'lucide-react';
import { getBoxTracking, receiveBoxes } from '../../lib/boxTracking';

interface BoxTrackingItem {
  id: string;
  customer: string;
  party: string;
  openingBalance: number;
  todaySales: number;
  total: number;
  currentDbBalance: number; // Current balance from database
  rcdBox: number;
  balance: number;
  isModified?: boolean;
  totalReceived:number; // Track if user changed this record
}

const MultipleBoxReceiveUpdate: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<BoxTrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchData();
  }, [navigate]);


  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);


const fetchData = async () => {
  setLoading(true);
  try {
    const today = new Date().toISOString().slice(0, 10);

    const payload = await getBoxTracking(today);
    const rows = Array.isArray(payload.items) ? payload.items : [];

    const mapped: BoxTrackingItem[] = rows.map((r: any, idx: number) => {
      // robustly pick values from multiple possible server keys
      const partyId = r.party_id ?? r.partyId ?? r.partyKey ?? null;
      const customerId = r.customer_id ?? r.customerId ?? r.customerKey ?? null;

      const partyName = r.party_name ?? r.party ?? r.partyName ?? r.partyNameString ?? null;
      const customerName = r.customer_name ?? r.customer ?? r.customerName ?? r.customerNameString ?? null;

      const openingBalance = Number(r.openingBalance ?? r.opening_balance ?? r.lastSent ?? r.last_sent ?? 0);
      const todaySales = Number(r.todaySales ?? r.todays_sales ?? r.todaysSales ?? 0);
      const total = Number(r.total ?? r.total_to_receive ?? r.boxToBeReceived ?? (openingBalance + todaySales));
      const closing = Number(r.closingBalance ?? r.closing_balance ?? r.balance ?? r.closing ?? 0);
      const totalReceived = Number(r.totalReceived ?? r.total_received ?? r.box_receive ?? r.boxReceive ?? 0);

      // Build an id for the frontend row; prefer backend id if present
      const clientRowId = String(r.id ?? `${partyId ?? partyName}|||${customerId ?? customerName}|||${idx}`);

      return {
        id: clientRowId,
        customer: customerName ?? String(customerId ?? ''),
        party: partyName ?? String(partyId ?? ''),
        openingBalance,
        todaySales,
        total,
        currentDbBalance: closing, // server canonical closing balance
        rcdBox: 0,
        balance: closing, // visible balance (will update as user types)
        isModified: false,
        // keep raw ids for use when saving
        // @ts-ignore
        partyId,
        // @ts-ignore
        customerId,
        // @ts-ignore
        totalReceived,
      } as BoxTrackingItem;
    });

    setItems(mapped);
  } catch (err: any) {
    console.error('Error fetching box tracking', err);
    setNotification({ message: 'Error loading data. Please refresh the page.', type: 'error' });
  } finally {
    setLoading(false);
  }
};


  const handleSaveChanges = async () => {
  if (saving) return;
  setSaving(true);
  try {
    // Only include rows with user changes and positive rcdBox
    const modified = items.filter(it => it.isModified && Number(it.rcdBox) > 0);

    if (modified.length === 0) {
      setNotification({ message: 'No changes to save!', type: 'error' });
      setSaving(false);
      return;
    }

    // Build updates: prefer partyId/customerId if present; else fallback to names
    const updates = modified.map(it => {
      // @ts-ignore may exist on item from mapping
      const partyId = (it as any).partyId ?? (it as any).party_id ?? null;
      // @ts-ignore
      const customerId = (it as any).customerId ?? (it as any).customer_id ?? null;

      const base: any = {
        receiveDelta: Number(it.rcdBox),
      };

      if (partyId != null && customerId != null && String(partyId).trim() !== '' && String(customerId).trim() !== '') {
        base.partyId = partyId;
        base.customerId = customerId;
      } else {
        base.partyName = it.party;
        base.customerName = it.customer;
      }

      return base as any;
    });

    // Call API
    const res = await receiveBoxes(updates);
    // On success backend returns updated rows; you can inspect res.updated for details
    setNotification({ message: `${modified.length} record(s) saved successfully!`, type: 'success' });

    // Re-fetch authoritative data
    await fetchData();
  } catch (err: any) {
    console.error('Save error', err);
    // If server returns JSON message, axios puts it on err.response.data
    const message = err?.response?.data?.message ?? err.message ?? 'Error saving data. Please try again.';
    setNotification({ message, type: 'error' });
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <AdminBoard />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-900 dark:text-white">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${
            notification.type === 'success'
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Multiple Box Receive
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveChanges}
                disabled={items.filter(item => item.isModified).length === 0 || saving}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600" style={{ minWidth: '800px' }}>
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Customer
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Party
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Opening Balance
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Today's Sales
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Total
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200" style={{ minWidth: '120px' }}>
                    Received Box
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Closing Balance
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={`${item.id}-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.customer}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.party}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.openingBalance}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.todaySales}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.total},box-rec={item.totalReceived}
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 px-4 py-3 ${
                      item.isModified
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}>
                      <input
                        type="text"
                        value={item.rcdBox === 0 ? '' : item.rcdBox.toString()}
                        placeholder="Enter received boxes"
                        onChange={(e) => {
                          const val = e.target.value;
                          // Only allow numbers and empty string
                          if (val === '' || /^\d+$/.test(val)) {
                            const numValue = Math.max(0, parseFloat(val) || 0);

                            setItems(prevItems => {
                              const itemIndex = prevItems.findIndex(prevItem => prevItem.id === item.id);
                              if (itemIndex !== -1) {
                                const updatedItem = {
                                  ...prevItems[itemIndex],
                                  rcdBox: numValue,
                                  balance: Math.max(0, prevItems[itemIndex].currentDbBalance - numValue),
                                  isModified: true
                                };
                                // Use slice to avoid unnecessary re-renders
                                return [...prevItems.slice(0, itemIndex), updatedItem, ...prevItems.slice(itemIndex + 1)];
                              }
                              return prevItems;
                            });
                          }
                        }}
                        onFocus={(e) => {
                          if (item.rcdBox > 0) {
                            e.target.select();
                          }
                        }}
                        className="w-full px-3 py-2 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-sm text-gray-900 dark:text-white"
                        style={{ minWidth: '100px', textAlign: 'left' }}
                        data-input-id={item.id}
                      />
                    </td>
                    <td className={`border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium ${
                      item.balance < 0
                        ? 'text-red-600 dark:text-red-400'
                        : item.balance > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {item.balance}
                      {item.isModified && <span className="ml-2 text-xs text-blue-600">(modified)</span>}
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

export default MultipleBoxReceiveUpdate;
