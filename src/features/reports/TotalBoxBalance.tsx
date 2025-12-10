import React, { useEffect, useState } from "react";
import { getTotalBoxBalance, PartyBoxBalance } from "../../lib/box";

interface BoxBalanceData {
  party: string;
  totalBalance: number | "_";
}

const TotalBoxBalance: React.FC = () => {
  const [data, setData] = useState<BoxBalanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    fetchBoxBalanceData();
  }, []);

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(t);
  }, [notification]);

  const fetchBoxBalanceData = async () => {
    setLoading(true);
    try {
      const res = await getTotalBoxBalance();
      const mapped: BoxBalanceData[] = (res.rows || []).map((r: PartyBoxBalance) => ({
        party: r.party,
        totalBalance: r.totalBalance,
      }));
      setData(mapped);
      setGrandTotal(res.totals?.grandTotal ?? 0);
    } catch (error) {
      console.error("Error loading box balance:", error);
      setNotification({ message: "Failed to load box balance", type: "error" });
      setData([]);
      setGrandTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printable-area")?.innerHTML;
    if (!printContents) return;
    const w = window.open("", "", "height=600,width=800");
    if (!w) return;
    const currentDate = new Date().toISOString().split("T")[0];
    w.document.title = `Total Box Balance - ${currentDate}`;
    w.document.write('<html><head><title>Fishow - Total Box Balance</title>');
    w.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px;} h1,h2{text-align:center;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:8px; text-align:left;} th{background:#f2f2f2;} .footer{margin-top:20px; text-align:center; font-size:12px;}</style>');
    w.document.write("</head><body><h1>Fishow</h1><h2>Total Box Balance</h2>");
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
      {notification && (
        <div className={`px-4 py-3 rounded-lg shadow border ${notification.type === "success" ? "bg-green-100 border-green-200 text-green-800" : "bg-red-100 border-red-200 text-red-800"}`}>
          {notification.message}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Total Box Balance</h2>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Party</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Balance of Boxes</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.map((item, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.party}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {typeof item.totalBalance === "number" ? item.totalBalance : "_"}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Grand Total</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TotalBoxBalance;
