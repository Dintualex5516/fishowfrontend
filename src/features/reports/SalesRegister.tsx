import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabase';

interface SalesRegisterProps {
  date?: string; // Optional date prop, defaults to current date
}

interface SalesData {
  party: string;
  totalBox: number;
  salesman: string;
  customer: string;
  boxesSold: number;
  price: number;
  total: number;
  items: string[];
  cashPaid: number;
  discount: number;
}

const SalesRegister: React.FC<SalesRegisterProps> = ({ date }) => {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [paidInputs, setPaidInputs] = useState<Record<string, number | undefined>>({});
  const [discountInputs, setDiscountInputs] = useState<Record<string, number | undefined>>({});
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Use provided date or default to current date
  const selectedDate = date || currentDate;

  useEffect(() => {
    if (selectedDate) {
      fetchSalesData();
    }
  }, [selectedDate]);

  // Load saved data on component mount or date change
  useEffect(() => {
    const saved = sessionStorage.getItem(`dailyCollection:${selectedDate}`);
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
  }, [selectedDate]);

  // Auto-update current date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date();
      setCurrentDate(today.toISOString().split('T')[0]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // Fetch sales summary data from 'sales' table
      const salesQuery = supabase
        .from('sales')
        .select('*')
        .eq('date', selectedDate);

      // Fetch parties, salesmen, customers for name mapping
      const partiesQuery = supabase.from('parties').select('id, name');
      const salesmenQuery = supabase.from('salesmen').select('id, name');
      const customersQuery = supabase.from('customers').select('id, name');

      const [salesRes, partiesRes, salesmenRes, customersRes] = await Promise.all([
        salesQuery,
        partiesQuery,
        salesmenQuery,
        customersQuery
      ]);

      if (salesRes.error) throw salesRes.error;
      if (partiesRes.error) throw partiesRes.error;
      if (salesmenRes.error) throw salesmenRes.error;
      if (customersRes.error) throw customersRes.error;

      const partyMap: Record<string, string> = Object.fromEntries((partiesRes.data || []).map((p: any) => [p.id, p.name]));
      const salesmanMap: Record<string, string> = Object.fromEntries((salesmenRes.data || []).map((s: any) => [s.id, s.name]));
      const customerMap: Record<string, string> = Object.fromEntries((customersRes.data || []).map((c: any) => [c.id, c.name]));

      const salesSummaryData = salesRes.data;

      // Fetch saved daily collection sheet data from sessionStorage
      const savedCollectionDataRaw = sessionStorage.getItem(`dailyCollection:${selectedDate}`);
      let savedCollectionData: { paid: Record<string, number>, discount: Record<string, number> } = { paid: {}, discount: {} };
      if (savedCollectionDataRaw) {
        try {
          savedCollectionData = JSON.parse(savedCollectionDataRaw);
        } catch (e) {
          console.error('Error parsing saved daily collection data:', e);
        }
      }

      // Map sales summary data by customer for quick lookup
      const salesByCustomer: Record<string, any> = {};
      (salesSummaryData || []).forEach((sale: any) => {
        const customerId = sale.customer;
        if (!salesByCustomer[customerId]) {
          salesByCustomer[customerId] = {
            party: sale.party,
            totalBox: sale.total_box ?? 0,
            salesman: sale.salesman,
            customer: sale.customer,
            boxesSold: sale.boxes_sold ?? 0,
            price: sale.price ?? 0,
            total: sale.total ?? 0,
          };
        } else {
          // Aggregate if multiple sales for same customer
          salesByCustomer[customerId].totalBox += sale.total_box ?? 0;
          salesByCustomer[customerId].boxesSold += sale.boxes_sold ?? 0;
          salesByCustomer[customerId].price += sale.price ?? 0;
          salesByCustomer[customerId].total += sale.total ?? 0;
        }
      });

      // Combine sales summary and daily collection sheet data
      const combinedData: SalesData[] = Object.entries(salesByCustomer).map(([customerId, summary]) => ({
        party: partyMap[summary.party] || summary.party,
        totalBox: summary.totalBox,
        salesman: salesmanMap[summary.salesman] || summary.salesman,
        customer: customerMap[summary.customer] || summary.customer,
        boxesSold: summary.boxesSold,
        price: summary.price,
        total: summary.total,
        items: [], // No items info here
        cashPaid: paidInputs[customerId] ?? savedCollectionData.paid[customerId] ?? 0,
        discount: discountInputs[customerId] ?? savedCollectionData.discount[customerId] ?? 0,
      }));

      setData(combinedData);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    // Save to sessionStorage (persists during browser session)
    const paidToSave = Object.fromEntries(Object.entries(paidInputs).filter(([_, v]) => v !== undefined));
    const discountToSave = Object.fromEntries(Object.entries(discountInputs).filter(([_, v]) => v !== undefined));
    sessionStorage.setItem(`dailyCollection:${selectedDate}`, JSON.stringify({
      paid: paidToSave,
      discount: discountToSave,
      timestamp: new Date().toISOString()
    }));
    setSaveMessage('Data saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handlePrint = () => {
    const printContents = document.getElementById('printable-area')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        const currentDate = new Date().toISOString().split('T')[0];
        printWindow.document.title = `Sales Register - ${currentDate}`;
        printWindow.document.write('<html><head><title>Fishow - Sales Register</title>');
        printWindow.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Fishow</h1>');
        printWindow.document.write('<h2>Sales Register</h2>');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Sales Register
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
                Total Box
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Salesman
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Boxes Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cash Paid
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Discount
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
                  {item.totalBox}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.salesman}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.boxesSold}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ₹{item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ₹{item.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ₹{item.cashPaid.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ₹{item.discount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesRegister;
