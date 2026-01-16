import React, { useEffect, useState } from "react";
import { getSalesRegister, SalesRegisterRow } from "../../lib/ledgerApi";

interface SalesRegisterProps {
  date?: string; // Optional, defaults to current date
}

const SalesRegister: React.FC<SalesRegisterProps> = ({ date }) => {
  const [data, setData] = useState<SalesRegisterRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const selectedDate = date || currentDate;

  useEffect(() => {
    if (!date) {
      const interval = setInterval(() => {
        const today = new Date();
        setCurrentDate(today.toISOString().split("T")[0]);
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [date]);

  useEffect(() => {
    if (selectedDate) fetchSalesData();
  }, [selectedDate]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const res = await getSalesRegister(selectedDate);
      setData(res.rows || []);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printable-area")?.innerHTML;
    if (!printContents) return;
    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) return;
    const currentDateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    printWindow.document.title = `Sales Register - ${currentDateStr}`;
    printWindow.document.write('<html><head><title>Fishow - Sales Register</title>');
    printWindow.document.write(
      '<style>body{font-family: Arial, sans-serif; margin: 20px;} h1,h2{text-align: center;} table{width:100%; border-collapse: collapse;} th,td{border:1px solid #000; padding:8px; text-align:left;} th{background:#f2f2f2;} .footer{margin-top:20px; text-align:center; font-size:12px;}</style>'
    );
    printWindow.document.write("</head><body>");
    printWindow.document.write("<h1>Fishow</h1><h2>Sales Register</h2>");
    printWindow.document.write(printContents);
    printWindow.document.write('<div class="footer">Thank you for your business!</div>');
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
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
                Product
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
            {data.map((item, idx) => (
              <tr key={idx}>
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
                  {item.product ?? ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.boxesSold ?? ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.price != null ? `₹${item.price.toFixed(2)}` : ""}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.total != null ? `₹${item.total.toFixed(2)}` : ""}
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
