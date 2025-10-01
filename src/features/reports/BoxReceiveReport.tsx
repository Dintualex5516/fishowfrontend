import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabase';

interface BoxReceiveReportProps {
  dateRange: { startDate: string; endDate: string };
}

interface BoxReceiveData {
  id: string;
  date: string;
  party: string;
  totalBox: number;
  salesman: string;
  customer: string;
  item: string;
  boxesSold: number;
  boxReceived: number;
  balance: number;
}

const BoxReceiveReport: React.FC<BoxReceiveReportProps> = ({ dateRange }) => {
  const [data, setData] = useState<BoxReceiveData[]>([]);
  const [typeInputs, setTypeInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchBoxReceiveData();
    }
  }, [dateRange]);

  const fetchBoxReceiveData = async () => {
    setLoading(true);
    try {
      // Fetch sales within date range
      const { startDate, endDate } = dateRange;
      const salesQuery = supabase
        .from('sales')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('created_at', { ascending: false });

      // Fetch lookups
      const partiesQuery = supabase.from('parties').select('id, name');
      const salesmenQuery = supabase.from('salesmen').select('id, name');
      const customersQuery = supabase.from('customers').select('id, name');
      const productsQuery = supabase.from('products').select('id, name');

      const [salesRes, partiesRes, salesmenRes, customersRes, productsRes] = await Promise.all([
        salesQuery,
        partiesQuery,
        salesmenQuery,
        customersQuery,
        productsQuery,
      ]);

      if (salesRes.error) throw salesRes.error;
      if (partiesRes.error) throw partiesRes.error;
      if (salesmenRes.error) throw salesmenRes.error;
      if (customersRes.error) throw customersRes.error;
      if (productsRes.error) throw productsRes.error;

      const partyMap: Record<string, string> = Object.fromEntries((partiesRes.data || []).map((p: any) => [p.id, p.name]));
      const salesmanMap: Record<string, string> = Object.fromEntries((salesmenRes.data || []).map((s: any) => [s.id, s.name]));
      const customerMap: Record<string, string> = Object.fromEntries((customersRes.data || []).map((c: any) => [c.id, c.name]));
      const productMap: Record<string, string> = Object.fromEntries((productsRes.data || []).map((p: any) => [p.id, p.name]));

      const rows: BoxReceiveData[] = [];

      (salesRes.data || []).forEach((sale: any) => {
        const saleDate = sale.date;
        const partyName = partyMap[sale.party] || sale.party || '';
        const salesmanName = salesmanMap[sale.salesman] || sale.salesman || '';
        const saleTotalBox = Number(sale.total_box) || 0;
        const items: any[] = Array.isArray(sale.items) ? sale.items : [];

        items.forEach((it: any) => {
          const itemId = it.id || it.item || '';
          const itemName = productMap[it.item] || productMap[itemId] || it.item || '';
          const customerName = customerMap[it.customer] || it.customer || '';
          const boxesSold = Number(it.box) || 0;
          const id = `${sale.id}-${it.id || itemId || Math.random().toString(36).slice(2)}`;
          const boxReceived = 0;
          const balance = Math.max(saleTotalBox - boxesSold - boxReceived, 0);

          rows.push({
            id,
            date: saleDate,
            party: partyName,
            totalBox: saleTotalBox,
            salesman: salesmanName,
            customer: customerName,
            item: itemName,
            boxesSold,
            boxReceived,
            balance,
          });
        });
      });

      setData(rows);
      setTypeInputs({});
    } catch (error) {
      console.error('Error fetching box receive data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBoxes = data.reduce((sum, item) => sum + item.totalBox, 0);
  const totalBoxesSold = data.reduce((sum, item) => sum + item.boxesSold, 0);

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
        printWindow.document.title = `Box Receive Report - ${currentDate}`;
        printWindow.document.write('<html><head><title>Fishow - Box Receive Report</title>');
        printWindow.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Fishow</h1>');
        printWindow.document.write('<h2>Box Receive Report</h2>');
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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Box Receive Report
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
                Date
              </th>
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
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Salesman
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Boxes Sold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Box Received
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {new Date(item.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
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
                  {item.item}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.salesman}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.boxesSold}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <input
                    type="text"
                    className="w-36 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    value={typeInputs[item.id] ?? ''}
                    onChange={(e) => setTypeInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="Enter"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {(() => {
                    const received = parseFloat(typeInputs[item.id] ?? '') || 0;
                    return item.boxesSold - received;
                  })()}
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default BoxReceiveReport;