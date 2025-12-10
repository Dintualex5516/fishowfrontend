
import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabase';
import SearchableInput from '../../components/SearchableInput';
import { listEntities } from '../../lib/entities';
import { getStatement, StatementRow } from '../../lib/statementApi';

interface StatementReportProps {
  dateRange: { startDate: string; endDate: string };
}

interface StatementData {
  party: string;
  item: string;
  salesman: string;
  boxesSold: number;
  price: number;
  grandTotal: number;
  cashPaid: number;
}

const StatementReport: React.FC<StatementReportProps> = ({ dateRange }) => {
  const [data, setData] = useState<StatementData[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  // For demonstration, hardcoding the name (now using customer filter)
  const name = selectedCustomer ? customers.find(c => c.id === selectedCustomer)?.name || "All Customers" : "All Customers";

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchStatementData();
    }
  }, [dateRange, selectedCustomer]);

  useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const response = await listEntities('customers', { page: 1, pageSize: 1000 });
      const data = Array.isArray(response) ? response : response.data || [];
      setCustomers(data.map((c: any) => ({ id: String(c.id), name: c.name })));
    } catch (error) {
      console.error('Error fetching customers via listEntities:', error);
    }
  };

  fetchCustomers();
}, []);


  // const fetchStatementData = async () => {
  //   setLoading(true);
  //   try {
  //     const { startDate, endDate } = dateRange;

  //     let salesData: any[] = [];

  //     if (selectedCustomer) {
  //       // If customer is selected, fetch all sales and filter client-side
  //       const { data: allSales, error: salesError } = await supabase
  //         .from('sales')
  //         .select('*')
  //         .gte('date', startDate)
  //         .lte('date', endDate)
  //         .order('created_at', { ascending: false });

  //       if (salesError) throw salesError;

  //       // Filter sales that contain the selected customer in their items
  //       salesData = (allSales || []).filter(sale => {
  //         const items = Array.isArray(sale.items) ? sale.items : [];
  //         return items.some((item: any) => item.customer === selectedCustomer);
  //       });
  //     } else {
  //       // No customer filter, fetch all sales
  //       const { data, error } = await supabase
  //         .from('sales')
  //         .select('*')
  //         .gte('date', startDate)
  //         .lte('date', endDate)
  //         .order('created_at', { ascending: false });

  //       if (error) throw error;
  //       salesData = data || [];
  //     }

  //     // Lookup tables
  //     const [partiesRes, salesmenRes, productsRes] = await Promise.all([
  //       supabase.from('parties').select('id, name'),
  //       supabase.from('salesmen').select('id, name'),
  //       supabase.from('products').select('id, name'),
  //     ]);

  //     if (partiesRes.error) throw partiesRes.error;
  //     if (salesmenRes.error) throw salesmenRes.error;
  //     if (productsRes.error) throw productsRes.error;

  //     const partyMap: Record<string, string> = Object.fromEntries((partiesRes.data || []).map((p: any) => [p.id, p.name]));
  //     const salesmanMap: Record<string, string> = Object.fromEntries((salesmenRes.data || []).map((s: any) => [s.id, s.name]));
  //     const productMap: Record<string, string> = Object.fromEntries((productsRes.data || []).map((p: any) => [p.id, p.name]));

  //     const rows: StatementData[] = [];
  //     salesData.forEach((sale: any) => {
  //       const partyName = partyMap[sale.party] || sale.party || '';
  //       const salesmanName = salesmanMap[sale.salesman] || sale.salesman || '';
  //       const items: any[] = Array.isArray(sale.items) ? sale.items : [];

  //       items.forEach((it: any) => {
  //         const itemId = it.id || it.item || '';
  //         const itemName = productMap[it.item] || productMap[itemId] || it.item || '';
  //         const boxesSold = Number(it.box) || 0;
  //         const price = Number(it.price) || 0;
  //         const grandTotal = Number(it.total) || (boxesSold * price);
  //         const cashPaid = Number(it.cashPaid) || 0; // default 0 if not present

  //         rows.push({
  //           party: partyName,
  //           item: itemName,
  //           salesman: salesmanName,
  //           boxesSold,
  //           price,
  //           grandTotal,
  //           cashPaid,
  //         });
  //       });
  //     });

  //     setData(rows);
  //   } catch (error) {
  //     console.error('Error fetching statement data:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
// inside StatementReport component
const fetchStatementData = async () => {
  setLoading(true);
  try {
    const { startDate, endDate } = dateRange;

    // ask server for statement rows (send selectedCustomer id or undefined)
    const resp = await getStatement({
      start: startDate,
      end: endDate,
      customerId: selectedCustomer || undefined,
    });

    // Map server rows -> your StatementData[]
    const rows: StatementData[] = (resp.rows || []).map(r => ({
      party: r.party ?? "",
      item: r.item ?? "",
      salesman: r.salesman ?? "",
      boxesSold: Number(r.boxesSold || 0),
      price: Number(r.price || 0),
      grandTotal: Number(r.grandTotal || 0),
      cashPaid: Number(r.cashPaid || 0),
    }));

    setData(rows);

    // Optionally, if you previously computed totals client-side and want to use server totals:
    // You can use resp.totals.totalBoxesSold, resp.totals.totalGrandTotal, resp.totals.totalCashPaid
    // For backwards compatibility you can keep your client totals code; it's fine either way.

  } catch (error) {
    console.error('Error fetching statement data:', error);
  } finally {
    setLoading(false);
  }
};

  const totalBoxesSold = data.reduce((sum, item) => sum + item.boxesSold, 0);
  const totalGrandTotal = data.reduce((sum, item) => sum + item.grandTotal, 0);
  const totalCashPaid = data.reduce((sum, item) => sum + item.cashPaid, 0);
  const balance = totalGrandTotal - totalCashPaid;

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
        printWindow.document.title = `Statement Report - ${currentDate}`;
        printWindow.document.write('<html><head><title>Fishow - Statement Report</title>');
        printWindow.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Fishow</h1>');
        printWindow.document.write('<h2>Statement Report</h2>');

        // Add customer and date range info to print
        printWindow.document.write('<div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">');
        printWindow.document.write(`<p><strong>Customer:</strong> ${name}</p>`);
        printWindow.document.write(`<p><strong>From:</strong> ${new Date(dateRange.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>`);
        printWindow.document.write(`<p><strong>To:</strong> ${new Date(dateRange.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>`);
        printWindow.document.write('</div>');

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
          Popular Fish Kondotty : Statement
        </h2>
        <button
          onClick={handlePrint}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
        >
          Print
        </button>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Customer Filter:
            </label>
            <SearchableInput
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              placeholder="Select a customer (leave empty for all)"
              searchData={customers}
              onSelect={(customer) => setSelectedCustomer(customer.id)}
              createRoute="/create-customer"
              entityType="customer"
              className="w-full sm:w-64"
            />
          </div>
          <div className="flex gap-6 text-gray-900 dark:text-white">
            <div>
              <span className="font-semibold">Name: </span>{name}
            </div>
            <div>
              <span className="font-semibold">From: </span>{new Date(dateRange.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div>
              <span className="font-semibold">To: </span>{new Date(dateRange.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      <div id="printable-area" className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-600">
          <thead className="bg-gray-200 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
            <tr>
              <th className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Party
              </th>
              <th className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Item
              </th>
              <th className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Salesman
              </th>
              <th className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Boxes Sold
              </th>
              <th className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Price
              </th>
              <th className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Grand Total
              </th>
              <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                Cash Paid
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-600">
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-300 dark:border-gray-600">
                <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                  {item.party}
                </td>
                <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {item.item}
                </td>
                <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {item.salesman}
                </td>
                <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                  {item.boxesSold}
                </td>
                <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                  ₹{item.price.toFixed(4)}
                </td>
                <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                  ₹{item.grandTotal.toFixed(4)}
                </td>
                <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">
                  ₹{item.cashPaid.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-200 dark:bg-gray-700 border-t border-gray-300 dark:border-gray-600">
            <tr>
              <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                Total
              </td>
              <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                -
              </td>
              <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white">
                -
              </td>
              <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-right">
                {totalBoxesSold}
              </td>
              <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-right">
                -
              </td>
              <td className="border-r border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-right">
                ₹{totalGrandTotal.toFixed(4)}
              </td>
              <td className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white text-right">
                ₹{totalCashPaid.toFixed(4)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 max-w-md ml-auto text-right text-gray-900 dark:text-white space-y-1">
        <div>
          <span className="font-semibold">Balance :</span> {balance.toFixed(4)}
        </div>
        <div>
          <span className="font-semibold">Total Paid :</span> {totalCashPaid.toFixed(4)}
        </div>
      </div>
    </div>
  );
};

export default StatementReport;