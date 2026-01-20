// import React, { useEffect, useState } from "react";
// import { getDailySummary, SummaryRow } from "../../lib/ledgerApi";

// interface DailySummaryProps {
//   date: string;
// }

// interface SummaryData {
//   party: string;
//   totalBox: number;
//   salesman: string;
//   grandTotal: number;
// }

// const DailySummary: React.FC<DailySummaryProps> = ({ date }) => {
//   const [data, setData] = useState<SummaryData[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (date) fetchSummaryData();
//   }, [date]);

//   const fetchSummaryData = async () => {
//     setLoading(true);
//     try {
//       const res = await getDailySummary(date);
//       // Map to the shape your table expects
//       const mapped: SummaryData[] = (res.rows || []).map((r: SummaryRow) => ({
//         party: r.party,
//         totalBox: r.totalBox,
//         salesman: r.salesman,
//         grandTotal: r.grandTotal,
//       }));
//       setData(mapped);
//     } catch (error) {
//       console.error("Error fetching summary data:", error);
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePrint = () => {
//     const printContents = document.getElementById("printable-area")?.innerHTML;
//     if (printContents) {
//       const printWindow = window.open("", "", "height=600,width=800");
//       if (printWindow) {
//         const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
//         printWindow.document.title = `Daily Summary - ${currentDate}`;
//         printWindow.document.write('<html><head><title>Fishow - Daily Summary</title>');
//         printWindow.document.write(
//           '<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>'
//         );
//         printWindow.document.write("</head><body>");
//         printWindow.document.write("<h1>Fishow</h1>");
//         printWindow.document.write("<h2>Daily Summary</h2>");
//         printWindow.document.write(printContents);
//         printWindow.document.write('<div class="footer">Thank you for your business!</div>');
//         printWindow.document.write("</body></html>");
//         printWindow.document.close();
//         printWindow.focus();
//         printWindow.print();
//         printWindow.close();
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center py-12">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daily Summary</h2>
//         <button
//           onClick={handlePrint}
//           className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
//         >
//           Print
//         </button>
//       </div>

//       <div id="printable-area" className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
//           <thead className="bg-gray-50 dark:bg-gray-700">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 Party
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 Total Box
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 Salesman
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 Grand Total (Day by Day)
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
//             {data.map((item, index) => (
//               <tr key={index}>
//                 <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                   {item.party}
//                 </td>
//                 <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
//                   {item.totalBox}
//                 </td>
//                 <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
//                   {item.salesman}
//                 </td>
//                 <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
//                   ₹{item.grandTotal.toFixed(2)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//           {/* Footer totals intentionally omitted */}
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DailySummary;




import React, { useEffect, useState } from "react";
import { getDailySummary, SummaryRow } from "../../lib/ledgerApi";

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
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    if (date) fetchSummaryData();
  }, [date]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (data.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = Math.min(prev + 1, data.length - 1);
          return nextIndex;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const nextIndex = Math.max(prev - 1, 0);
          return nextIndex;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data]);

  // Scroll into view when focused index changes
  useEffect(() => {
    if (focusedIndex >= 0) {
      const row = document.getElementById(`summary-row-${focusedIndex}`);
      if (row) {
        row.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  const fetchSummaryData = async () => {
    setLoading(true);
    try {
      const res = await getDailySummary(date);
      // Map to the shape your table expects
      const mapped: SummaryData[] = (res.rows || []).map((r: SummaryRow) => ({
        party: r.party,
        totalBox: r.totalBox,
        salesman: r.salesman,
        grandTotal: r.grandTotal,
      }));
      setData(mapped);
    } catch (error) {
      console.error("Error fetching summary data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printable-area")?.innerHTML;
    if (printContents) {
      const printWindow = window.open("", "", "height=600,width=800");
      if (printWindow) {
        const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        printWindow.document.title = `Daily Summary - ${currentDate}`;
        printWindow.document.write('<html><head><title>Fishow - Daily Summary</title>');
        printWindow.document.write(
          '<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>'
        );
        printWindow.document.write("</head><body>");
        printWindow.document.write("<h1>Fishow</h1>");
        printWindow.document.write("<h2>Daily Summary</h2>");
        printWindow.document.write(printContents);
        printWindow.document.write('<div class="footer">Thank you for your business!</div>');
        printWindow.document.write("</body></html>");
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daily Summary</h2>
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
              <tr
                key={index}
                id={`summary-row-${index}`}
                onClick={() => setFocusedIndex(index)}
                className={`cursor-pointer transition-colors ${focusedIndex === index
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {item.party}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.totalBox}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {item.salesman}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  ₹{item.grandTotal.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Footer totals intentionally omitted */}
        </table>
      </div>
    </div>
  );
};

export default DailySummary;