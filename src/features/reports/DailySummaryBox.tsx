import React, { useEffect, useState } from "react";
import { getDailyBoxSummary, BoxSummaryRow, getDailyBoxSummaryCustomers } from "../../lib/box";

interface DailySummaryBoxProps {
  date: string;
}

const DailySummaryBox: React.FC<DailySummaryBoxProps> = ({ date }) => {
  const [data, setData] = useState<BoxSummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [expandedPartyId, setExpandedPartyId] = useState<number | null>(null);
const [customers, setCustomers] = useState<any[]>([]);
const [customerLoading, setCustomerLoading] = useState(false);


  useEffect(() => {
    if (date) fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDailyBoxSummary(date);
      setData(res.rows || []);
      setTotalBalance(res.totals?.totalBalance ?? 0);
    } catch (e) {
      console.error("Error fetching box summary:", e);
      setData([]);
      setTotalBalance(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async (partyId: number) => {
  setCustomerLoading(true);
  try {
    const res = await getDailyBoxSummaryCustomers(date, partyId);
    setCustomers(res.rows || []);
    setExpandedPartyId(partyId);
  } catch (e) {
    console.error(e);
    setCustomers([]);
  } finally {
    setCustomerLoading(false);
  }
};


  const handlePrint = () => {
    const printContents = document.getElementById("printable-area")?.innerHTML;
    if (!printContents) return;
    const w = window.open("", "", "height=600,width=800");
    if (!w) return;
    const currentDate = new Date().toISOString().split("T")[0];
    w.document.title = `Daily Summary Box - ${currentDate}`;
    w.document.write('<html><head><title>Fishow - Daily Summary Box</title>');
    w.document.write(
      '<style>body{font-family: Arial, sans-serif; margin:20px;} h1,h2{text-align:center;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:8px; text-align:left;} th{background:#f2f2f2;} .footer{margin-top:20px; text-align:center; font-size:12px;}</style>'
    );
    w.document.write("</head><body><h1>Fishow</h1><h2>Daily Summary (Box)</h2>");
    w.document.write(printContents);
    w.document.write('<div class="footer">Thank you for your business!</div>');
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

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
                Box Sold(cash sale+box sale)
              </th>
            </tr>
          </thead>
          {/* <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.map((row, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {row.party}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {row.balance}
                </td>
              </tr>
            ))}
          </tbody> */}

          <tbody>
  {data.map((row, idx) => (
    <React.Fragment key={idx}>
      <tr>
        <td className="px-6 py-4 font-medium">{row.party}</td>
        <td className="px-6 py-4">{row.balance}</td>
        <td className="px-6 py-4">
          <button
            onClick={() => fetchCustomers(row.partyId)}
            className="text-blue-600 text-sm underline"
          >
            View Customers
          </button>
        </td>
      </tr>

      {expandedPartyId === row.partyId && (
        <tr>
          <td colSpan={3} className="bg-gray-50 p-4">
            {customerLoading ? (
              <div>Loading...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Customer</th>
                    <th className="text-left">Boxes</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => (
                    <tr key={i}>
                      <td>{c.customer}</td>
                      <td>{c.boxes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </React.Fragment>
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