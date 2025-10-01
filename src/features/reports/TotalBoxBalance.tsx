import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabase';

interface BoxBalanceData {
  party: string;
  totalBalance: number | '_';
}

const TotalBoxBalance: React.FC = () => {
  const [data, setData] = useState<BoxBalanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchBoxBalanceData();
  }, []);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchBoxBalanceData = async () => {
    setLoading(true);
    try {
      console.log('=== Starting Total Box Balance Data Fetch ===');

      const normalizeName = (value: any) => {
        const str = (value ?? '').toString();
        // Trim, collapse internal whitespace, and lower-case for stable keys
        return str.trim().replace(/\s+/g, ' ').toLowerCase();
      };

      // Fetch both parties and tracking data in parallel
      const [
        { data: partiesData, error: partiesError },
        { data: trackingData, error: trackingError }
      ] = await Promise.all([
        supabase.from('parties').select('name').order('name'),
        supabase
          .from('box_tracking')
          .select('id, customer, party, closing_balance')
          .order('id', { ascending: true })
      ]);

      if (partiesError) {
        console.error('Error fetching parties:', partiesError);
        setNotification({ message: `Parties error: ${partiesError.message}`, type: 'error' });
        throw partiesError;
      }

      if (trackingError) {
        console.error('Error fetching box tracking data:', trackingError);
        setNotification({ message: `Box tracking error: ${trackingError.message}`, type: 'error' });
        throw trackingError;
      }

      console.log('=== BOX TRACKING DATA ===');
      console.log('Total records:', trackingData?.length || 0);

      // Deduplicate by latest record per customer-party (normalized), then sum per party
      const latestByCustomerParty = new Map<string, { partyKey: string; partyDisplay: string; closing_balance: number }>();
      (trackingData || []).forEach((row: any) => {
        const customerDisplay = (row.customer ?? '').toString().trim().replace(/\s+/g, ' ');
        const partyDisplay = (row.party ?? '').toString().trim().replace(/\s+/g, ' ');
        const customerKey = normalizeName(row.customer);
        const partyKey = normalizeName(row.party);
        if (!customerKey || !partyKey) return; // skip incomplete rows
        const key = `${customerKey}|${partyKey}`;
        const closing = Number(row.closing_balance) || 0;
        latestByCustomerParty.set(key, { partyKey, partyDisplay, closing_balance: closing });
      });

      const partyBalanceMap = new Map<string, number>();

      console.log('=== CALCULATING PARTY BALANCES ===');

      Array.from(latestByCustomerParty.values()).forEach((entry, index) => {
        // Only count positive balances; ignore zero/negative to avoid inflation from stale rows
        const closingBalance = entry.closing_balance > 0 ? entry.closing_balance : 0;
        if (closingBalance <= 0) return;

        const partyKey = entry.partyKey;
        const partyDisplay = entry.partyDisplay; // We'll use display later when mapping

        console.log(`${index + 1}. Latest Tracking - Party: "${partyDisplay}", Closing Balance: ${closingBalance}`);

        const current = partyBalanceMap.get(partyKey) || 0;
        const updated = current + closingBalance;
        partyBalanceMap.set(partyKey, updated);
        console.log(`   Updated "${partyDisplay}": ${current} + ${closingBalance} = ${updated}`);
      });

      console.log('=== FINAL PARTY BALANCES ===');
      const finalBalances = Object.fromEntries(partyBalanceMap);
      Object.entries(finalBalances).forEach(([party, balance]) => {
        console.log(`"${party}": ${balance} boxes`);
      });

      // Convert to display data - show all parties with their outstanding balance
      // To display, recover a readable party name by choosing one of the displays that matches the key
      const partyKeyToDisplay = new Map<string, string>();
      Array.from(latestByCustomerParty.values()).forEach(({ partyKey, partyDisplay }) => {
        if (!partyKeyToDisplay.has(partyKey)) {
          partyKeyToDisplay.set(partyKey, partyDisplay);
        }
      });

      // Ensure we include all parties in output
      const partyKeysInOrder = (partiesData || []).map((p: any) => {
        const key = (p.name ?? '').toString().trim().replace(/\s+/g, ' ').toLowerCase();
        if (!partyKeyToDisplay.has(key)) partyKeyToDisplay.set(key, (p.name ?? '').toString());
        return key;
      });

      const mappedData: BoxBalanceData[] = partyKeysInOrder.map((partyKey: string) => {
        const total = partyBalanceMap.get(partyKey);
        return {
          party: partyKeyToDisplay.get(partyKey) || partyKey,
          totalBalance: typeof total === 'number' ? total : '_',
        };
      });

      console.log('=== DISPLAY DATA ===');
      if (mappedData.length === 0) {
        console.log('No parties with outstanding balances found');
      } else {
        mappedData.forEach((item, index) => {
          console.log(`${index + 1}. "${item.party}": ${item.totalBalance} boxes outstanding`);
        });
      }

      setData(mappedData);

    } catch (error) {
      console.error('Error fetching box balance data:', error);
      setNotification({ message: `Error loading box balance data: ${error}`, type: 'error' });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const grandTotalBalance = data.reduce((sum, item) => sum + (typeof item.totalBalance === 'number' ? item.totalBalance : 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handlePrint = () => {
    const printContents = document.getElementById('printable-area')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        const currentDate = new Date().toISOString().split('T')[0];
        printWindow.document.title = `Total Box Balance - ${currentDate}`;
        printWindow.document.write('<html><head><title>Fishow - Total Box Balance</title>');
        printWindow.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Fishow</h1>');
        printWindow.document.write('<h2>Total Box Balance</h2>');
        printWindow.document.write(printContents);
        printWindow.document.write('<div class="footer">Thank you for your business!</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className="mb-4">
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

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Total Box Balance
        </h2>
        <button
          onClick={handlePrint}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Print
        </button>
      </div>


      <div id="printable-area" className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Party
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total Balance of Boxes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.party}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {typeof item.totalBalance === 'number' ? item.totalBalance : '_'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                Grand Total
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {grandTotalBalance}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TotalBoxBalance;