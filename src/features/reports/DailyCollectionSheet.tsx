import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabase';
import PrintLayout from '../../components/PrintLayout';

interface DailyCollectionSheetProps {
  date: string;
}

interface CollectionData {
  customerId: string;
  customer: string;
  balance: number; // carried forward; currently 0 until prior balance source provided
  todayAmount: number;
}

const DailyCollectionSheet: React.FC<DailyCollectionSheetProps> = ({ date }) => {
  const [data, setData] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [paidInputs, setPaidInputs] = useState<Record<string, number | undefined>>({});
  const [discountInputs, setDiscountInputs] = useState<Record<string, number | undefined>>({});
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    if (date) {
      fetchCollectionData();
    }
  }, [date]);

  const fetchCollectionData = async () => {
    setLoading(true);
    try {
      // Get previous date for balance calculation
      const currentDate = new Date(date);
      const previousDate = new Date(currentDate);
      previousDate.setDate(currentDate.getDate() - 1);
      const prevDateString = previousDate.toISOString().split('T')[0];

      // Fetch sales entries for the selected date (today's amount)
      const todaySalesQuery = supabase
        .from('sales')
        .select('*')
        .eq('date', date);

      // Fetch sales entries for the previous date (for balance calculation)
      const prevSalesQuery = supabase
        .from('sales')
        .select('*')
        .eq('date', prevDateString);

      // Fetch customers data
      const customersQuery = supabase.from('customers').select('id, name');

      const [todaySalesRes, prevSalesRes, customersRes] = await Promise.all([
        todaySalesQuery,
        prevSalesQuery,
        customersQuery
      ]);

      if (todaySalesRes.error) throw todaySalesRes.error;
      if (prevSalesRes.error) throw prevSalesRes.error;
      if (customersRes.error) throw customersRes.error;

      const customerMap: Record<string, string> = Object.fromEntries((customersRes.data || []).map((c: any) => [c.id, c.name]));

      // Calculate balance from previous day for each customer
      const balanceByCustomer = new Map<string, number>();

      (prevSalesRes.data || []).forEach((sale: any) => {
        const items: any[] = Array.isArray(sale.items) ? sale.items : [];
        items.forEach((it: any) => {
          const customerId = (it.customer || '').toString();
          const amount = Number(it.total) || 0;
          if (!customerId) return;

          // Calculate previous day's outstanding balance
          const prevBalance = balanceByCustomer.get(customerId) || 0;
          const newBalance = prevBalance + amount;
          balanceByCustomer.set(customerId, newBalance);
        });
      });

      // Subtract previous day's paid and discount only from paid, not discount
      const prevSaved = sessionStorage.getItem(`dailyCollection:${prevDateString}`);
      if (prevSaved) {
        try {
          const parsed = JSON.parse(prevSaved);
          const prevPaid = parsed.paid || {};
          // Do not subtract previous discount from balance, only subtract previous paid
          for (const [customerId, balance] of balanceByCustomer) {
            const paid = prevPaid[customerId] || 0;
            balanceByCustomer.set(customerId, balance - paid);
          }
        } catch (error) {
          console.error('Error loading previous saved data:', error);
        }
      }

      // Group today's sales by customer and sum today's amount
      const todayAmountByCustomer = new Map<string, number>();
      (todaySalesRes.data || []).forEach((sale: any) => {
        const items: any[] = Array.isArray(sale.items) ? sale.items : [];
        items.forEach((it: any) => {
          const customerId = (it.customer || '').toString();
          const amount = Number(it.total) || 0;
          if (!customerId) return;
          todayAmountByCustomer.set(customerId, (todayAmountByCustomer.get(customerId) || 0) + amount);
        });
      });

      // Combine balance and today's amount for each customer
      const allCustomerIds = new Set([
        ...balanceByCustomer.keys(),
        ...todayAmountByCustomer.keys()
      ]);

      const rows: CollectionData[] = Array.from(allCustomerIds).map((customerId) => ({
        customerId,
        customer: customerMap[customerId] || customerId,
        balance: balanceByCustomer.get(customerId) || 0,
        todayAmount: todayAmountByCustomer.get(customerId) || 0,
      }));

      setData(rows);
    } catch (error) {
      console.error('Error fetching collection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = data.reduce((sum, item) => sum + item.balance, 0);
  const totalTodayAmount = data.reduce((sum, item) => sum + item.todayAmount, 0);
  const totalPaid = Object.values(paidInputs).reduce((sum: number, val) => sum + (val || 0), 0);
  const totalDiscount = Object.values(discountInputs).reduce((sum: number, val) => sum + (val || 0), 0);
  const totalOverall = data.reduce((sum, item) => sum + (item.balance + item.todayAmount), 0);

  const handleSave = () => {
    // Save to sessionStorage (persists during browser session)
    const paidToSave = Object.fromEntries(Object.entries(paidInputs).filter(([_, v]) => v !== undefined));
    const discountToSave = Object.fromEntries(Object.entries(discountInputs).filter(([_, v]) => v !== undefined));
    sessionStorage.setItem(`dailyCollection:${date}`, JSON.stringify({
      paid: paidToSave,
      discount: discountToSave,
      timestamp: new Date().toISOString()
    }));
    setSaveMessage('Data saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Load saved data on component mount or date change
  useEffect(() => {
    const saved = sessionStorage.getItem(`dailyCollection:${date}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPaidInputs(parsed.paid || {});
        setDiscountInputs(parsed.discount || {});
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    } else {
      // Clear inputs if no saved data for selected date
      setPaidInputs({});
      setDiscountInputs({});
    }
  }, [date]);



  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PrintLayout title="Daily Collection Sheet">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daily Collection Sheet
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                const printContents = document.getElementById('printable-area')?.innerHTML;
                if (printContents) {
                  const printWindow = window.open('', '', 'height=600,width=800');
                  if (printWindow) {
                    const currentDate = new Date().toISOString().split('T')[0];
                    printWindow.document.title = `Daily Collection Sheet - ${currentDate}`;
                    printWindow.document.write('<html><head><title>Fishow - Daily Collection Sheet</title>');
                    printWindow.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>');
                    printWindow.document.write('</head><body>');
                    printWindow.document.write('<h1>Fishow</h1>');
                    printWindow.document.write('<h2>Daily Collection Sheet</h2>');
                    printWindow.document.write(printContents);
                    printWindow.document.write('<div class="footer">Thank you for your business!</div>');
                    printWindow.document.write('</body></html>');
                    printWindow.document.close();
                    printWindow.focus();
                    printWindow.print();
                    printWindow.close();
                  }
                }
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Print
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded print:hidden">
            {saveMessage}
          </div>
        )}

        <div id="printable-area" className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Balance (Carried Forward)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Today's Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Paid
                </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
            Discount
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
        {data.map((item, index) => (
          <tr key={index}>
            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {item.customer}
            </td>
            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              ₹{item.balance.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              ₹{item.todayAmount.toFixed(2)}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
              <div className="border border-gray-300 dark:border-gray-600 rounded p-1">
                ₹{(item.balance + item.todayAmount).toFixed(2)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 print:hidden">
              <input
                type="number"
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance:textfield]"
                value={paidInputs[item.customerId] ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const value = val === '' ? undefined : Math.max(0, Number(val) || 0);
                  setPaidInputs(prev => ({ ...prev, [item.customerId]: value }));
                }}
                placeholder="Enter amount"
                min={0}
              />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 print:hidden">
              <input
                type="number"
                className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance:textfield]"
                value={discountInputs[item.customerId] ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const value = val === '' ? undefined : Math.max(0, Number(val) || 0);
                  setDiscountInputs(prev => ({ ...prev, [item.customerId]: value }));
                }}
                placeholder="Enter amount"
                min={0}
              />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
            Grand Total (Paid - Discount):
          </td>
          <td className="px-6 py-3 text-sm font-bold text-green-600 dark:text-green-400">
            ₹{(totalPaid - totalDiscount).toFixed(2)}
          </td>
          <td className="print:hidden"></td>
        </tr>
      </tfoot>
    </table>
  </div>
</div>
</PrintLayout>
);
};

export default DailyCollectionSheet;