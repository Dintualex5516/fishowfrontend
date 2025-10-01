import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabase';

interface DailySummaryBoxProps {
  date: string;
}

interface BoxSummaryData {
  party: string;
  balance: number | '_';
}

const DailySummaryBox: React.FC<DailySummaryBoxProps> = ({ date }) => {
  const [data, setData] = useState<BoxSummaryData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (date) {
      fetchBoxSummaryData();
    }
  }, [date]);

  const fetchBoxSummaryData = async () => {
    setLoading(true);
    try {
      // Fetch parties and sales for the selected date in parallel
      const [
        { data: parties, error: partiesError },
        { data: sales, error: salesError }
      ] = await Promise.all([
        supabase.from('parties').select('id, name').order('name'),
        supabase.from('sales').select('party, total_box, items, date').eq('date', date)
      ]);

      if (partiesError) throw partiesError;
      if (salesError) throw salesError;

      // Build party id->name map and key normalization
      const partyIdToName: Record<string, string> = Object.fromEntries(
        (parties || []).map((p: any) => [p.id, p.name])
      );
      const normalize = (s: any) => (s ?? '').toString().trim().replace(/\s+/g, ' ').toLowerCase();

      // Aggregate totals per party for the selected date
      const perParty: Map<string, { display: string; totalBox: number; boxesSold: number }> = new Map();
      (sales || []).forEach((sale: any) => {
        const partyName = partyIdToName[sale.party] || sale.party || '';
        const key = normalize(partyName);
        const totalBox = Number(sale.total_box) || 0;
        const boxesSold = (sale.items || []).reduce((sum: number, item: any) => sum + (Number(item.box) || 0), 0);
        const existing = perParty.get(key) || { display: partyName, totalBox: 0, boxesSold: 0 };
        existing.totalBox += totalBox;
        existing.boxesSold += boxesSold;
        perParty.set(key, existing);
      });

      // Build full list from parties; compute balance if available, else '_'
      const mapped: BoxSummaryData[] = (parties || []).map((p: any) => {
        const key = normalize(p.name);
        const agg = perParty.get(key);
        const balance = agg ? Math.max(0, agg.totalBox - agg.boxesSold) : '_';
        return { party: p.name, balance };
      });

      setData(mapped);
    } catch (error) {
      console.error('Error fetching box summary data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = data.reduce((sum, item) => sum + (typeof item.balance === 'number' ? item.balance : 0), 0);

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
        printWindow.document.title = `Daily Summary Box - ${currentDate}`;
        printWindow.document.write('<html><head><title>Fishow - Daily Summary Box</title>');
        printWindow.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Fishow</h1>');
        printWindow.document.write('<h2>Daily Summary (Box)</h2>');
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
          Daily Summary (Box)
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
                Balance
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
                  {typeof item.balance === 'number' ? item.balance : '_'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                Total Balance
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {totalBalance}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DailySummaryBox;