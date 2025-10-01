import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabase';

interface DailySummaryProps {
  date: string;
}

interface SummaryData {
  party: string;
  totalBox: number;
  salesman: string;
  grandTotal: number;
}

const DailySummary: React.FC<DailySummaryProps> = ({ date }) => {
  const [data, setData] = useState<SummaryData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date) {
      fetchSummaryData();
    }
  }, [date]);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      // Fetch sales in date range and lookup tables for names
      const [
        { data: sales, error: salesError },
        { data: parties, error: partiesError },
        { data: salesmen, error: salesmenError }
      ] = await Promise.all([
        supabase
          .from('sales')
          .select('date, party, total_box, salesman, total_amount')
          .eq('date', date)
          .order('date', { ascending: true }),
        supabase.from('parties').select('id, name'),
        supabase.from('salesmen').select('id, name'),
      ]);

      if (salesError) throw salesError;
      if (partiesError) throw partiesError;
      if (salesmenError) throw salesmenError;

      const partyMap = Object.fromEntries((parties || []).map((p: any) => [p.id, p.name]));
      const salesmanMap = Object.fromEntries((salesmen || []).map((s: any) => [s.id, s.name]));

      const mapped: SummaryData[] = (sales || []).map((sale: any) => ({
        party: partyMap[sale.party] || sale.party,
        totalBox: Number(sale.total_box) || 0,
        salesman: salesmanMap[sale.salesman] || sale.salesman,
        grandTotal: Number(sale.total_amount) || 0,
      }));

      setData(mapped);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalBoxes = data.reduce((sum, item) => sum + item.totalBox, 0);
  const totalGrandTotal = data.reduce((sum, item) => sum + item.grandTotal, 0);

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
        printWindow.document.title = `Daily Summary - ${currentDate}`;
        printWindow.document.write('<html><head><title>Fishow - Daily Summary</title>');
        printWindow.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Fishow</h1>');
        printWindow.document.write('<h2>Daily Summary</h2>');
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
          Daily Summary
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
                Grand Total (Day by Day)
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
                  ₹{item.grandTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Footer totals removed as per request */}
        </table>
      </div>
    </div>
  );
};

export default DailySummary;