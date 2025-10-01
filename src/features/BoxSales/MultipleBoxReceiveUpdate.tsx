import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBoard from '../../components/AdminBoard';
import { Save } from 'lucide-react';
import { supabase } from '../../database/supabase';

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
  isModified?: boolean; // Track if user changed this record
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
      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch lookup tables with error handling
      const customersRes = await supabase.from('customers').select('id, name');
      const partiesRes = await supabase.from('parties').select('id, name');

      if (customersRes.error) {
        console.error('Error fetching customers:', customersRes.error);
        throw customersRes.error;
      }
      if (partiesRes.error) {
        console.error('Error fetching parties:', partiesRes.error);
        throw partiesRes.error;
      }

      const customerMap = Object.fromEntries(
        (customersRes.data || []).map((c: any) => [c.id, c.name])
      );
      const partyMap = Object.fromEntries(
        (partiesRes.data || []).map((p: any) => [p.id, p.name])
      );

      // Fetch sales data with error handling
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: true });

      if (salesError) {
        console.error('Error fetching sales data:', salesError);
        throw salesError;
      }

      // Fetch existing box_tracking data
      const { data: existingTrackingData, error: trackingError } = await supabase
        .from('box_tracking')
        .select('*');

      if (trackingError) {
        console.error('Error fetching tracking data:', trackingError);
      }

      // Create map of existing balances (customer-party -> balance)
      const existingBalances = new Map<string, number>();
      existingTrackingData?.forEach((record: any) => {
        const key = `${record.customer}-${record.party}`;
        existingBalances.set(key, record.closing_balance || record.total || 0);
      });

      // Group sales by customer-party
      const customerPartyMap = new Map<string, any>();
      salesData?.forEach((sale: any) => {
        const saleDate = sale.date;
        const isToday = saleDate === today;

        (sale.items || []).forEach((item: any) => {
          const customerId = item.customer;
          const partyId = sale.party;
          const customerName = customerMap[customerId] || customerId;
          const partyName = partyMap[partyId] || partyId;
          const key = `${customerName}-${partyName}`;
          const boxes = parseFloat(item.box) || 0;

          if (!customerPartyMap.has(key)) {
            customerPartyMap.set(key, {
              customer: customerName,
              party: partyName,
              openingBalance: 0,
              todaySales: 0,
              total: 0,
            });
          }

          const entry = customerPartyMap.get(key)!;
          if (isToday) {
            entry.todaySales += boxes;
          } else {
            entry.openingBalance += boxes;
          }
          entry.total = entry.openingBalance + entry.todaySales;
        });
      });

      // Convert to display items
      const mappedData: BoxTrackingItem[] = Array.from(customerPartyMap.values()).map((entry, index) => {
        const key = `${entry.customer}-${entry.party}`;
        const existingBalance = existingBalances.get(key) || entry.total;

        return {
          id: `${key}-${index}`,
          customer: entry.customer,
          party: entry.party,
          openingBalance: entry.openingBalance,
          todaySales: entry.todaySales,
          total: entry.total,
          currentDbBalance: existingBalance,
          rcdBox: 0,
          balance: existingBalance,
          isModified: false,
        };
      });

      setItems(mappedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setNotification({ message: 'Error loading data. Please refresh the page.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };



  const handleSaveChanges = async () => {
    if (saving) return; // Prevent multiple simultaneous saves

    setSaving(true);
    try {
      const modifiedItems = items.filter(item => item.isModified);

      if (modifiedItems.length === 0) {
        setNotification({ message: 'No changes to save!', type: 'error' });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // Process each modified item
      for (const item of modifiedItems) {
        try {
          // Check if record exists
          const { data: existingRecord, error: checkError } = await supabase
            .from('box_tracking')
            .select('id, closing_balance, received_box')
            .eq('customer', item.customer)
            .eq('party', item.party)
            .maybeSingle();

          if (checkError && checkError.code !== 'PGRST116') {
            console.error(`Error checking ${item.customer} - ${item.party}:`, checkError);
            errorCount++;
            continue;
          }

          const currentBalance = existingRecord?.closing_balance || item.total;
          const currentReceivedBox = existingRecord?.received_box || 0;
          const newClosingBalance = currentBalance - item.rcdBox;
          const totalReceivedBox = currentReceivedBox + item.rcdBox;

          if (existingRecord) {
            // Update existing record
            const { error: updateError } = await supabase
              .from('box_tracking')
              .update({
                opening_balance: item.openingBalance,
                todays_sales: item.todaySales,
                total: item.total,
                received_box: totalReceivedBox,
                closing_balance: newClosingBalance,
              })
              .eq('id', existingRecord.id);

            if (updateError) {
              console.error(`Update error for ${item.customer} - ${item.party}:`, updateError);
              errorCount++;
            } else {
              successCount++;
            }
          } else {
            // Insert new record
            const { error: insertError } = await supabase
              .from('box_tracking')
              .insert({
                customer: item.customer,
                party: item.party,
                opening_balance: item.openingBalance,
                todays_sales: item.todaySales,
                total: item.total,
                received_box: item.rcdBox,
                closing_balance: newClosingBalance,
              });

            if (insertError) {
              console.error(`Insert error for ${item.customer} - ${item.party}:`, insertError);
              errorCount++;
            } else {
              successCount++;
            }
          }
        } catch (itemError) {
          console.error(`Error processing ${item.customer} - ${item.party}:`, itemError);
          errorCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        setNotification({
          message: `${successCount} record(s) saved successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}!`,
          type: errorCount > 0 ? 'error' : 'success'
        });
      } else {
        setNotification({ message: 'No records were saved successfully.', type: 'error' });
      }

      // Refresh data to get updated balances
      if (successCount > 0) {
        await fetchData();
      }

    } catch (error) {
      console.error('Save error:', error);
      setNotification({ message: 'Error saving data. Please try again.', type: 'error' });
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
                      {item.total}
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
