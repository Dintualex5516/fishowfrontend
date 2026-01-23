// import React, { useEffect, useState } from 'react';
// import {
//     getDailyReturn,
//     getDailyReturnCustomers,
//     DailyReturnRow,
//     DailyReturnCustomerRow,
// } from '../../lib/statementApi';

// interface Props {
//     date: string;
// }

// const DailyBoxReturnReport: React.FC<Props> = ({ date }) => {
//     const [data, setData] = useState<DailyReturnRow[]>([]);
//     const [customers, setCustomers] = useState<DailyReturnCustomerRow[]>([]);
//     const [expandedPartyId, setExpandedPartyId] = useState<number | null>(null);
//     const [loading, setLoading] = useState(false);
//     const [customerLoading, setCustomerLoading] = useState(false);

//     useEffect(() => {
//         if (!date) return;

//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const res = await getDailyReturn(date);
//                 setData(res.rows || []);
//             } catch (e) {
//                 console.error(e);
//                 setData([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [date]);

//     const handlePrint = () => {
//         const printContents = document.getElementById("printable-area")?.innerHTML;
//         if (!printContents) return;

//         const w = window.open("", "", "height=600,width=800");
//         if (!w) return;

//         w.document.title = `Daily Box Return Report - ${new Date(date).toLocaleDateString('en-GB').replace(/\//g, '-')}`;
//         w.document.write("<html><head><title>Fishow - Daily Box Return</title>");
//         w.document.write(`
//     <style>
//       body { font-family: Arial, sans-serif; margin: 20px; }
//       h1, h2 { text-align: center; }
//       table { width: 100%; border-collapse: collapse; }
//       th, td { border: 1px solid #000; padding: 8px; text-align: left; }
//       th { background: #f2f2f2; }
//       .footer { margin-top: 20px; text-align: center; font-size: 12px; }
//       .no-print { display: none !important; }
//     </style>
//   `);
//         w.document.write("</head><body>");
//         w.document.write("<h1>Fishow</h1>");
//         w.document.write("<h2>Daily Box Return Report</h2>");
//         w.document.write(printContents);
//         w.document.write('<div class="footer">Thank you for your business!</div>');
//         w.document.write("</body></html>");
//         w.document.close();
//         w.focus();
//         w.print();
//         w.close();
//     };


//     const handlePrintCustomerDetails = (partyName: string) => {
//         const w = window.open("", "", "height=600,width=800");
//         if (!w) return;
//         const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
//         w.document.title = `Customer Box Return - ${partyName} - ${currentDate}`;
//         w.document.write('<html><head><title>Fishow - Customer Box Return</title>');
//         w.document.write('<style>body { font-family: Arial, sans-serif; margin: 20px; } h1, h2 { text-align: center; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: left; } th { background: #f2f2f2; } .footer { margin-top: 20px; text-align: center; font-size: 12px; }</style>');
//         w.document.write(`</head><body><h1>Fishow</h1><h2>Customer Box Return Details: ${partyName}</h2>`);
//         w.document.write('<p style="text-align:center;">Date: ' + currentDate + '</p>');

//         let tableHtml = '<table><thead><tr><th>Customer</th><th>Boxes Returned</th></tr></thead><tbody>';
//         customers.forEach(c => {
//             tableHtml += `<tr><td>${c.customer}</td><td>${c.boxes_returned}</td></tr>`;
//         });
//         tableHtml += '</tbody></table>';

//         w.document.write(tableHtml);
//         w.document.write('<div class="footer">Thank you for your business!</div>');
//         w.document.write("</body></html>");
//         w.document.close();
//         w.focus();
//         w.print();
//         w.close();
//     };


//     const fetchCustomers = async (partyId: number) => {
//         setCustomerLoading(true);
//         try {
//             const res = await getDailyReturnCustomers(date, partyId);
//             setCustomers(res.rows || []);
//             setExpandedPartyId(partyId);
//         } catch (e) {
//             console.error(e);
//             setCustomers([]);
//         } finally {
//             setCustomerLoading(false);
//         }
//     };

//     if (loading) {
//         return (
//             <div className="flex justify-center py-12">
//                 <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//                     Daily Box Return Report
//                 </h2>

//                 <button
//                     onClick={handlePrint}
//                     className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
//                 >
//                     Print
//                 </button>
//             </div>


//             <div className="overflow-x-auto">
//                 <div id="printable-area" className="overflow-x-auto">
//                     <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
//                         <thead className="bg-gray-50 dark:bg-gray-700">
//                             <tr>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                                     Box Type
//                                 </th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                                     Boxes Returned
//                                 </th>
//                                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider no-print">
//                                     Action
//                                 </th>
//                             </tr>
//                         </thead>

//                         <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
//                             {data.map((row) => (
//                                 <React.Fragment key={row.party_id}>
//                                     <tr>
//                                         <td className="px-6 py-4 font-medium text-sm text-gray-900 dark:text-white">{row.box_type}</td>
//                                         <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{row.total_returned}</td>
//                                         <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 no-print">
//                                             <button
//                                                 onClick={() => fetchCustomers(row.party_id)}
//                                                 className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline text-sm"
//                                             >
//                                                 View Customers
//                                             </button>
//                                         </td>
//                                     </tr>

//                                     {expandedPartyId === row.party_id && (
//                                         <tr>
//                                             <td colSpan={3} className="bg-gray-50 dark:bg-gray-700 p-4">
//                                                 {customerLoading ? (
//                                                     <div className="text-gray-500 dark:text-gray-400">Loading...</div>
//                                                 ) : (
//                                                     <div className="space-y-4">
//                                                         <div className="flex justify-between items-center no-print">
//                                                             <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Customer Details: {row.box_type}</h3>
//                                                             <button
//                                                                 onClick={() => handlePrintCustomerDetails(row.box_type)}
//                                                                 className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
//                                                             >
//                                                                 Print Details
//                                                             </button>
//                                                         </div>
//                                                         <table className="w-full text-sm">
//                                                             <thead className="bg-gray-50 dark:bg-gray-700">
//                                                                 <tr>
//                                                                     <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
//                                                                     <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Boxes Returned</th>
//                                                                 </tr>
//                                                             </thead>
//                                                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
//                                                                 {customers.map((c) => (
//                                                                     <tr key={c.customer_id}>
//                                                                         <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{c.customer}</td>
//                                                                         <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.boxes_returned}</td>
//                                                                     </tr>
//                                                                 ))}
//                                                             </tbody>
//                                                         </table>
//                                                     </div>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     )}
//                                 </React.Fragment>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default DailyBoxReturnReport;





















import React, { useEffect, useState } from 'react';
import {
    getDailyReturn,
    getDailyReturnCustomers,
    DailyReturnRow,
    DailyReturnCustomerRow,
} from '../../lib/statementApi';

interface Props {
    date: string;
}

const DailyBoxReturnReport: React.FC<Props> = ({ date }) => {
    const [data, setData] = useState<DailyReturnRow[]>([]);
    const [customers, setCustomers] = useState<DailyReturnCustomerRow[]>([]);
    const [expandedPartyId, setExpandedPartyId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const [customerFocusedIndex, setCustomerFocusedIndex] = useState<number>(-1);

    useEffect(() => {
        if (!date) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getDailyReturn(date);
                setData(res.rows || []);
            } catch (e) {
                console.error(e);
                setData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [date]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (loading || data.length === 0) return;

            if (expandedPartyId !== null && customers.length > 0) {
                // Navigation within customer table
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setCustomerFocusedIndex(prev => Math.min(prev + 1, customers.length - 1));
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setCustomerFocusedIndex(prev => Math.max(prev - 1, 0));
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    setExpandedPartyId(null);
                    setCustomerFocusedIndex(-1);
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setExpandedPartyId(null);
                    setCustomerFocusedIndex(-1);
                }
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setFocusedIndex(prev => Math.min(prev + 1, data.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setFocusedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (focusedIndex >= 0 && data[focusedIndex]) {
                    if (expandedPartyId === data[focusedIndex].party_id) {
                        setExpandedPartyId(null);
                        setCustomerFocusedIndex(-1);
                    } else {
                        fetchCustomers(data[focusedIndex].party_id);
                        setCustomerFocusedIndex(-1);
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [data, loading, focusedIndex, expandedPartyId, customers, customerLoading]);

    // Scroll into view
    useEffect(() => {
        if (customerFocusedIndex >= 0 && expandedPartyId !== null) {
            const row = document.getElementById(`customer-row-${customerFocusedIndex}`);
            if (row) {
                row.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        } else if (focusedIndex >= 0) {
            const row = document.getElementById(`return-row-${focusedIndex}`);
            if (row) {
                row.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            }
        }
    }, [focusedIndex, customerFocusedIndex, expandedPartyId]);

    const handlePrint = () => {
        const printContents = document.getElementById("printable-area")?.innerHTML;
        if (!printContents) return;

        const w = window.open("", "", "height=600,width=800");
        if (!w) return;

        w.document.title = `Daily Box Return Report - ${new Date(date).toLocaleDateString('en-GB').replace(/\//g, '-')}`;
        w.document.write("<html><head><title>Fishow - Daily Box Return</title>");
        w.document.write(`
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2 { text-align: center; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      th { background: #f2f2f2; }
      .footer { margin-top: 20px; text-align: center; font-size: 12px; }
      .no-print { display: none !important; }
    </style>
  `);
        w.document.write("</head><body>");
        w.document.write("<h1>Fishow</h1>");
        w.document.write("<h2>Daily Box Return Report</h2>");
        w.document.write(printContents);
        w.document.write('<div class="footer">Thank you for your business!</div>');
        w.document.write("</body></html>");
        w.document.close();
        w.focus();
        w.print();
        w.close();
    };

    const handlePrintCustomerDetails = (partyName: string) => {
        const w = window.open("", "", "height=600,width=800");
        if (!w) return;
        const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        w.document.title = `Customer Box Return - ${partyName} - ${currentDate}`;
        w.document.write('<html><head><title>Fishow - Customer Box Return</title>');
        w.document.write('<style>body { font-family: Arial, sans-serif; margin: 20px; } h1, h2 { text-align: center; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: left; } th { background: #f2f2f2; } .footer { margin-top: 20px; text-align: center; font-size: 12px; }</style>');
        w.document.write(`</head><body><h1>Fishow</h1><h2>Customer Box Return Details: ${partyName}</h2>`);
        w.document.write('<p style="text-align:center;">Date: ' + currentDate + '</p>');

        let tableHtml = '<table><thead><tr><th>Customer</th><th>Boxes Returned</th></tr></thead><tbody>';
        customers.forEach(c => {
            tableHtml += `<tr><td>${c.customer}</td><td>${c.boxes_returned}</td></tr>`;
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

    const fetchCustomers = async (partyId: number) => {
        setCustomerLoading(true);
        try {
            const res = await getDailyReturnCustomers(date, partyId);
            setCustomers(res.rows || []);
            setExpandedPartyId(partyId);
        } catch (e) {
            console.error(e);
            setCustomers([]);
        } finally {
            setCustomerLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Daily Box Return Report
                </h2>

                <button
                    onClick={handlePrint}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                    Print
                </button>
            </div>

            <div className="overflow-x-auto">
                <div id="printable-area" className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Box Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Boxes Returned
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider no-print">
                                    Action
                                </th>
                            </tr>
                        </thead>

                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                            {data.map((row, index) => (
                                <React.Fragment key={row.party_id}>
                                    <tr
                                        id={`return-row-${index}`}
                                        onClick={() => {
                                            setFocusedIndex(index);
                                            fetchCustomers(row.party_id);
                                        }}
                                        className={`cursor-pointer transition-colors ${focusedIndex === index
                                            ? 'bg-blue-100 dark:bg-blue-900'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        <td className="px-6 py-4 font-medium text-sm text-gray-900 dark:text-white">{row.box_type}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{row.total_returned}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 no-print">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setFocusedIndex(index);
                                                    fetchCustomers(row.party_id);
                                                }}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline text-sm"
                                            >
                                                View Customers
                                            </button>
                                        </td>
                                    </tr>

                                    {expandedPartyId === row.party_id && (
                                        <tr>
                                            <td colSpan={3} className="bg-gray-50 dark:bg-gray-700 p-4">
                                                {customerLoading ? (
                                                    <div className="text-gray-500 dark:text-gray-400">Loading...</div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center no-print">
                                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Customer Details: {row.box_type}</h3>
                                                            <button
                                                                onClick={() => handlePrintCustomerDetails(row.box_type)}
                                                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                                            >
                                                                Print Details
                                                            </button>
                                                        </div>
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                                <tr>
                                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                                                                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Boxes Returned</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                                                {customers.map((c, i) => (
                                                                    <tr
                                                                        key={c.customer_id || i}
                                                                        id={`customer-row-${i}`}
                                                                        onClick={() => setCustomerFocusedIndex(i)}
                                                                        className={`transition-colors ${customerFocusedIndex === i
                                                                            ? 'bg-blue-50 dark:bg-blue-900/40'
                                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                                                            }`}
                                                                    >
                                                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{c.customer}</td>
                                                                        <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{c.boxes_returned}</td>
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
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DailyBoxReturnReport;