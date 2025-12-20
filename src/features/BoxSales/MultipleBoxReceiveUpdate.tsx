
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
  currentDbBalance: number;
  rcdBox: number;
  balance: number;
  isModified?: boolean;
  totalReceived: number;
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

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
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
        const partyId = r.party_id ?? r.partyId ?? null;
        const customerId = r.customer_id ?? r.customerId ?? null;
        const partyName = r.party_name ?? r.party ?? null;
        const customerName = r.customer_name ?? r.customer ?? null;
        const openingBalance = Number(r.openingBalance ?? r.opening_balance ?? 0);
        const todaySales = Number(r.todaySales ?? r.todays_sales ?? 0);
        const total = Number(r.total ?? openingBalance + todaySales);
        const closing = Number(r.closingBalance ?? r.closing_balance ?? 0);
        const totalReceived = Number(r.totalReceived ?? r.total_received ?? r.box_receive ?? 0);

        return {
          id: String(r.id ?? `${partyId ?? partyName}|||${customerId ?? customerName}|||${idx}`),
          customer: customerName ?? '',
          party: partyName ?? '',
          openingBalance,
          todaySales,
          total,
          currentDbBalance: closing,
          rcdBox: 0, // default empty for input
          balance: closing,
          isModified: false,
          totalReceived,
          // @ts-ignore
          partyId,
          // @ts-ignore
          customerId,
        };
      });

      // Sort alphabetically by customer name
      const sorted = mapped.sort((a, b) => a.customer.localeCompare(b.customer));
      setItems(sorted);
    } catch (err) {
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
      const modified = items.filter(it => it.isModified && Number(it.rcdBox) > 0);
      if (modified.length === 0) {
        setNotification({ message: 'No changes to save!', type: 'error' });
        setSaving(false);
        return;
      }

      const updates = modified.map(it => {
        const base: any = {
          receiveDelta: Number(it.rcdBox),
        };
        if ((it as any).partyId && (it as any).customerId) {
          base.partyId = (it as any).partyId;
          base.customerId = (it as any).customerId;
        } else {
          base.partyName = it.party;
          base.customerName = it.customer;
        }
        return base;
      });

      await receiveBoxes(updates);
      setNotification({ message: `${modified.length} record(s) saved successfully!`, type: 'success' });
      await fetchData();
    } catch (err: any) {
      console.error('Save error', err);
      const message = err?.response?.data?.message ?? err.message ?? 'Error saving data.';
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

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border ${notification.type === 'success'
                ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
              }`}
          >
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Multiple Box Receive
            </h1>
            <button
              onClick={handleSaveChanges}
              disabled={items.filter(item => item.isModified).length === 0 || saving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse border border-gray-300 dark:border-gray-600"
              style={{ minWidth: '800px' }}
            >
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border px-4 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="border px-4 py-3 text-left text-sm font-medium">Party</th>
                  <th className="border px-4 py-3 text-left text-sm font-medium">Opening Balance</th>
                  <th className="border px-4 py-3 text-left text-sm font-medium">Today's Sales</th>
                  <th className="border px-4 py-3 text-left text-sm font-medium">Total</th>
                  <th className="border px-4 py-3 text-left text-sm font-medium" style={{ minWidth: '120px' }}>
                    Received Box
                  </th>
                  <th className="border px-4 py-3 text-left text-sm font-medium">Closing Balance</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={`${item.id}-${index}`}
                    className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                  >
                    <td className="border px-4 py-3 text-sm">{item.customer}</td>
                    <td className="border px-4 py-3 text-sm">{item.party}</td>
                    <td className="border px-4 py-3 text-sm">{item.openingBalance}</td>
                    <td className="border px-4 py-3 text-sm">{item.todaySales}</td>
                    <td className="border px-4 py-3 text-sm">{item.total}</td>

                    {/* ✅ Editable "Received Box" input with existing value shown as placeholder */}
                    <td className="border px-4 py-3">
                      <input
                        type="text"
                        value={item.rcdBox === 0 ? '' : item.rcdBox.toString()}
                        placeholder={`Today's Entry: ${item.totalReceived}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || /^\d+$/.test(val)) {
                            setItems(prevItems => {
                              const itemIndex = prevItems.findIndex(prevItem => prevItem.id === item.id);
                              if (itemIndex !== -1) {
                                const available = prevItems[itemIndex].currentDbBalance;
                                const entered = Number(val) || 0;
                                const safeValue = Math.min(entered, available); // ✅ prevent negatives
                                const updatedItem = {
                                  ...prevItems[itemIndex],
                                  rcdBox: safeValue,
                                  balance: Math.max(0, available - safeValue),
                                  isModified: true,
                                };
                                return [
                                  ...prevItems.slice(0, itemIndex),
                                  updatedItem,
                                  ...prevItems.slice(itemIndex + 1),
                                ];
                              }
                              return prevItems;
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-sm text-gray-900 dark:text-white"
                      />
                    </td>

                    <td
                      className={`border px-4 py-3 text-sm font-medium ${item.balance < 0
                          ? 'text-red-600 dark:text-red-400'
                          : item.balance > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                    >
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