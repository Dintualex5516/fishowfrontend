import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PrintLayout from '../../components/PrintLayout';
import SearchableInput from '../../components/SearchableInput';
import AdminBoard from '../../components/AdminBoard';
import { getStatement, StatementResponse } from '../../lib/statementApi';
import { listEntities, Entity } from '../../lib/entities';

const CashStatement = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('en-CA');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [customers, setCustomers] = useState<Entity[]>([]);
  const [statementData, setStatementData] = useState<StatementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load customers on component mount
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await listEntities('customers', { pageSize: 1000 });
        setCustomers(response.data);
      } catch (err) {
        console.error('Failed to load customers:', err);
      }
    };
    loadCustomers();
  }, []);

  // Fetch data automatically when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate || !selectedCustomerId) {
        setStatementData(null);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const params: any = {
          start: startDate,
          end: endDate,
        };

        if (selectedCustomerId) {
          params.customerId = selectedCustomerId;
        }

        const response = await getStatement(params);
        console.log(response)
        setStatementData(response);
      } catch (err) {
        console.error('Failed to fetch statement:', err);
        setError('Failed to load statement data');
        setStatementData(null);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500); // Debounce to avoid too many requests while typing/selecting

    return () => clearTimeout(timeoutId);
  }, [startDate, endDate, selectedCustomerId]);

  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomerId(customer.id);
    setSelectedCustomerName(customer.name);
  };

  const handlePrint = () => {
    const el = document.getElementById('printable-area');
    if (!el) return;

    const w = window.open('', '', 'height=600,width=800');
    if (!w) return;

    w.document.title = `Cash Statement - ${selectedCustomerName || 'All Customers'}`;
    w.document.write('<html><head><title>Fishow - Statement</title>');
    w.document.write(`
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background: #f2f2f2; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; }
        .header-info { margin: 10px 0; }
        .text-right { text-align: right; }
      </style>
    `);
    w.document.write('</head><body><h1>Fishow</h1><h2>Statement</h2>');
    w.document.write(`
      <div class="header-info">
        <p><strong>From:</strong> ${startDate} <strong>To:</strong> ${endDate}</p>
        ${selectedCustomerName ? `<p><strong>Name:</strong> ${selectedCustomerName}</p>` : ''}
        ${statementData?.totals ? `<p><strong>Old Balance:</strong> ₹${statementData.totals.balanceBeforeStart.toFixed(2)}</p>` : ''}
      </div>
    `);
    w.document.write(el.innerHTML);
    w.document.write('<div class="footer">Thank you for your business!</div>');
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Cash Statement
              </h1>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
              />
            </div>

            {/* Customer Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer Name
              </label>
              <SearchableInput
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                placeholder="Search customer..."
                searchData={customers.map(c => ({ ...c, id: String(c.id) }))}
                onSelect={handleCustomerSelect}
                createRoute="/customers/create"
                entityType="customer"
              />
            </div>


          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Report Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          <PrintLayout title="Cash Statement">
            <div className="space-y-6">
              {/* Inner Header with Actions */}
              <div className="flex justify-between items-center mb-4 print:hidden">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cash Statement
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Print
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Statement Header Info */}
                <div className="text-center mb-6 print:block hidden">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Popular Fish Kondotty : Statement
                  </h1>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">From:</span> {startDate} <span className="ml-4 font-medium">To:</span> {endDate}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <div className="text-base font-semibold text-gray-900 dark:text-white">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span> {statementData?.customerName || selectedCustomerName || 'All Customers'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span className="font-medium">Old Balance:</span> ₹{statementData?.totals.balanceBeforeStart.toFixed(4) ?? '0.0000'}
                  </div>
                </div>

                {/* Statement Table */}
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
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Salesman
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Remark
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {statementData && statementData.rows.length > 0 ? (
                        statementData.rows.map((row, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {new Date(row.date).toLocaleDateString('en-GB')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {row.party}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                              {row.item}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                              {row.salesman}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {row.boxesSold}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {row.price.toFixed(4)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              {row.grandTotal.toFixed(4)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {row.remark || '-'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                            {loading ? 'Loading...' : 'No data available'}
                          </td>
                        </tr>
                      )}
                    </tbody>

                    <tfoot className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-200 dark:border-gray-600">
                      <tr>
                        <td colSpan={7} className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-600">
                          Total:
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                          ₹{statementData?.totals.salesBetween.toFixed(4) ?? '0.0000'}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7} className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-600">
                          Old Balance:
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">
                          ₹{statementData?.totals.balanceBeforeStart.toFixed(4) ?? '0.0000'}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7} className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-600">
                          Grand Total:
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-blue-600 dark:text-blue-400">
                          ₹{((statementData?.totals.salesBetween || 0) + (statementData?.totals.balanceBeforeStart || 0)).toFixed(4)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={7} className="px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white border-r dark:border-gray-600">
                          Cash Paid:
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-green-600 dark:text-green-400">
                          ₹{statementData?.totals.totalCashPaid.toFixed(4) ?? '0.0000'}
                        </td>
                      </tr>
                      <tr className="bg-gray-100 dark:bg-gray-600/50">
                        <td colSpan={7} className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white border-r dark:border-gray-500">
                          Final Balance:
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-red-600 dark:text-red-400">
                          ₹{(((statementData?.totals.salesBetween || 0) + (statementData?.totals.balanceBeforeStart || 0)) - (statementData?.totals.totalCashPaid || 0)).toFixed(4)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </PrintLayout>
        </div>
      </div>
    </div>
  );
};

export default CashStatement;