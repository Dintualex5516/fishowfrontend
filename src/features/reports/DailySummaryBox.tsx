// import React, { useEffect, useState } from "react";
// import { getDailyBoxSummary, BoxSummaryRow, getDailyBoxSummaryCustomers } from "../../lib/box";

// interface DailySummaryBoxProps {
//   date: string;
// }

// const DailySummaryBox: React.FC<DailySummaryBoxProps> = ({ date }) => {
//   const [data, setData] = useState<BoxSummaryRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [totalBalance, setTotalBalance] = useState(0);
//   const [expandedPartyId, setExpandedPartyId] = useState<number | null>(null);
//   const [customers, setCustomers] = useState<any[]>([]);
//   const [customerLoading, setCustomerLoading] = useState(false);


//   useEffect(() => {
//     if (date) fetchData();
//   }, [date]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const res = await getDailyBoxSummary(date);
//       setData(res.rows || []);
//       setTotalBalance(res.totals?.totalBalance ?? 0);
//     } catch (e) {
//       console.error("Error fetching box summary:", e);
//       setData([]);
//       setTotalBalance(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCustomers = async (partyId: number) => {
//     setCustomerLoading(true);
//     try {
//       const res = await getDailyBoxSummaryCustomers(date, partyId);
//       setCustomers(res.rows || []);
//       setExpandedPartyId(partyId);
//     } catch (e) {
//       console.error(e);
//       setCustomers([]);
//     } finally {
//       setCustomerLoading(false);
//     }
//   };

//   const handlePrintCustomerDetails = (partyName: string) => {
//     const w = window.open("", "", "height=600,width=800");
//     if (!w) return;
//     const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
//     w.document.title = `Customer Box Summary - ${partyName} - ${currentDate}`;
//     w.document.write('<html><head><title>Fishow - Customer Box Summary</title>');
//     w.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px;} h1,h2{text-align:center;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:8px; text-align:left;} th{background:#f2f2f2;} .footer{margin-top:20px; text-align:center; font-size:12px;}</style>');
//     w.document.write(`</head><body><h1>Fishow</h1><h2>Customer Box Summary: ${partyName}</h2>`);
//     w.document.write('<p style="text-align:center;">Date: ' + currentDate + '</p>');

//     let tableHtml = '<table><thead><tr><th>Customer</th><th>Boxes</th></tr></thead><tbody>';
//     customers.forEach(c => {
//       tableHtml += `<tr><td>${c.customer}</td><td>${c.boxes}</td></tr>`;
//     });
//     tableHtml += '</tbody></table>';

//     w.document.write(tableHtml);
//     w.document.write('<div class="footer">Thank you for your business!</div>');
//     w.document.write("</body></html>");
//     w.document.close();
//     w.focus();
//     w.print();
//     w.close();
//   };


//   const handlePrint = () => {
//     const printContents = document.getElementById("printable-area")?.innerHTML;
//     if (!printContents) return;
//     const w = window.open("", "", "height=600,width=800");
//     if (!w) return;
//     const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
//     w.document.title = `Daily Summary Box - ${currentDate}`;
//     w.document.write('<html><head><title>Fishow - Daily Summary Box</title>');
//     w.document.write(
//       '<style>body{font-family: Arial, sans-serif; margin:20px;} h1,h2{text-align:center;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:8px; text-align:left;} th{background:#f2f2f2;} .footer{margin-top:20px; text-align:center; font-size:12px;} .no-print{display:none !important;}</style>'
//     );
//     w.document.write("</head><body><h1>Fishow</h1><h2>Daily Summary (Box)</h2>");
//     w.document.write(printContents);
//     w.document.write('<div class="footer">Thank you for your business!</div>');
//     w.document.write("</body></html>");
//     w.document.close();
//     w.focus();
//     w.print();
//     w.close();
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
//         <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//           Daily Summary (Box)
//         </h2>
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
//               <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 Party
//               </th>
//               <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                 Box Sold(cash sale+box sale)
//               </th>
//               <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider no-print">
//                 Action
//               </th>
//             </tr>
//           </thead>
//           {/* <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
//             {data.map((row, idx) => (
//               <tr key={idx}>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                   {row.party}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
//                   {row.balance}
//                 </td>
//               </tr>
//             ))}
//           </tbody> */}

//           <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
//             {data.map((row, idx) => (
//               <React.Fragment key={idx}>
//                 <tr>
//                   <td className="px-6 py-4 font-medium text-sm text-gray-900 dark:text-white">{row.party}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{row.balance}</td>
//                   <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 no-print">
//                     <button
//                       onClick={() => fetchCustomers(row.partyId)}
//                       className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
//                     >
//                       View Customers
//                     </button>
//                   </td>
//                 </tr>

//                 {expandedPartyId === row.partyId && (
//                   <tr>
//                     <td colSpan={3} className="bg-gray-50 dark:bg-gray-700 p-4">
//                       {customerLoading ? (
//                         <div className="text-gray-500 dark:text-gray-400">Loading...</div>
//                       ) : (
//                         <div className="space-y-4">
//                           <div className="flex justify-between items-center no-print">
//                             <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Customer Details: {row.party}</h3>
//                             <button
//                               onClick={() => handlePrintCustomerDetails(row.party)}
//                               className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
//                             >
//                               Print Details
//                             </button>
//                           </div>
//                           <table className="w-full text-sm">
//                             <thead className="bg-gray-50 dark:bg-gray-700">
//                               <tr>
//                                 <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
//                                 <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Boxes</th>
//                               </tr>
//                             </thead>
//                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
//                               {customers.map((c, i) => (
//                                 <tr key={i}>
//                                   <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{c.customer}</td>
//                                   <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.boxes}</td>
//                                 </tr>
//                               ))}
//                             </tbody>
//                           </table>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 )}
//               </React.Fragment>
//             ))}
//           </tbody>

//           <tfoot className="bg-gray-50 dark:bg-gray-700">
//             <tr>
//               <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                 Total Balance
//               </td>
//               <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                 {totalBalance}
//               </td>
//               <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white no-print"></td>
//             </tr>
//           </tfoot>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default DailySummaryBox;




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
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);


  useEffect(() => {
    if (date) fetchData();
  }, [date]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || data.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, data.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (focusedIndex >= 0 && data[focusedIndex]) {
          if (expandedPartyId === data[focusedIndex].partyId) {
            setExpandedPartyId(null);
          } else {
            fetchCustomers(data[focusedIndex].partyId);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, loading, focusedIndex, expandedPartyId]);

  // Scroll into view
  useEffect(() => {
    if (focusedIndex >= 0) {
      const row = document.getElementById(`box-summary-row-${focusedIndex}`);
      if (row) {
        row.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }
  }, [focusedIndex]);

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

  const handlePrintCustomerDetails = (partyName: string) => {
    const w = window.open("", "", "height=600,width=800");
    if (!w) return;
    const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    w.document.title = `Customer Box Summary - ${partyName} - ${currentDate}`;
    w.document.write('<html><head><title>Fishow - Customer Box Summary</title>');
    w.document.write('<style>body{font-family: Arial, sans-serif; margin: 20px;} h1,h2{text-align:center;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:8px; text-align:left;} th{background:#f2f2f2;} .footer{margin-top:20px; text-align:center; font-size:12px;}</style>');
    w.document.write(`</head><body><h1>Fishow</h1><h2>Customer Box Summary: ${partyName}</h2>`);
    w.document.write('<p style="text-align:center;">Date: ' + currentDate + '</p>');

    let tableHtml = '<table><thead><tr><th>Customer</th><th>Boxes</th></tr></thead><tbody>';
    customers.forEach(c => {
      tableHtml += `<tr><td>${c.customer}</td><td>${c.boxes}</td></tr>`;
    });
    tableHtml += '</tbody></table>';

    w.document.write(tableHtml);
    w.document.write('<div class="footer">Thank you for your business!</div>');
    w.document.write("</body></html>");
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };


  const handlePrint = () => {
    const printContents = document.getElementById("printable-area")?.innerHTML;
    if (!printContents) return;
    const w = window.open("", "", "height=600,width=800");
    if (!w) return;
    const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    w.document.title = `Daily Summary Box - ${currentDate}`;
    w.document.write('<html><head><title>Fishow - Daily Summary Box</title>');
    w.document.write(
      '<style>body{font-family: Arial, sans-serif; margin:20px;} h1,h2{text-align:center;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:8px; text-align:left;} th{background:#f2f2f2;} .footer{margin-top:20px; text-align:center; font-size:12px;} .no-print{display:none !important;}</style>'
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
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Party
              </th>
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Box Sold(cash sale+box sale)
              </th>
              <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider no-print">
                Action
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

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr
                  id={`box-summary-row-${idx}`}
                  onClick={() => {
                    setFocusedIndex(idx);
                    fetchCustomers(row.partyId);
                  }}
                  className={`cursor-pointer transition-colors ${focusedIndex === idx
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <td className="px-6 py-4 font-medium text-sm text-gray-900 dark:text-white">{row.party}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{row.balance}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 no-print">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFocusedIndex(idx);
                        fetchCustomers(row.partyId);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm underline"
                    >
                      View Customers
                    </button>
                  </td>
                </tr>

                {expandedPartyId === row.partyId && (
                  <tr>
                    <td colSpan={3} className="bg-gray-50 dark:bg-gray-700 p-4">
                      {customerLoading ? (
                        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center no-print">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Customer Details: {row.party}</h3>
                            <button
                              onClick={() => handlePrintCustomerDetails(row.party)}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              Print Details
                            </button>
                          </div>
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                              <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Boxes</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                              {customers.map((c, i) => (
                                <tr key={i}>
                                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{c.customer}</td>
                                  <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.boxes}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>

          <tfoot className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                Total Balance
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {totalBalance}
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DailySummaryBox;