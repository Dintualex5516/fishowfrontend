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

    const handlePrint = () => {
        const printContents = document.getElementById("printable-area")?.innerHTML;
        if (!printContents) return;

        const w = window.open("", "", "height=600,width=800");
        if (!w) return;

        w.document.title = `Daily Box Return Report - ${date}`;
        w.document.write("<html><head><title>Fishow - Daily Box Return</title>");
        w.document.write(`
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1, h2 { text-align: center; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #000; padding: 8px; text-align: left; }
      th { background: #f2f2f2; }
      .footer { margin-top: 20px; text-align: center; font-size: 12px; }
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
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                Box Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                Boxes Returned
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                                Action
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white dark:bg-gray-800 divide-y">
                        {data.map((row) => (
                            <React.Fragment key={row.party_id}>
                                <tr>
                                    <td className="px-6 py-4 font-medium">{row.box_type}</td>
                                    <td className="px-6 py-4">{row.total_returned}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => fetchCustomers(row.party_id)}
                                            className="text-blue-600 underline text-sm"
                                        >
                                            View Customers
                                        </button>
                                    </td>
                                </tr>

                                {expandedPartyId === row.party_id && (
                                    <tr>
                                        <td colSpan={3} className="bg-gray-50 p-4">
                                            {customerLoading ? (
                                                <div>Loading...</div>
                                            ) : (
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr>
                                                            <th className="text-left">Customer</th>
                                                            <th className="text-left">Boxes Returned</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {customers.map((c) => (
                                                            <tr key={c.customer_id}>
                                                                <td>{c.customer}</td>
                                                                <td>{c.boxes_returned}</td>
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
                </table>
                </div>
            </div>
        </div>
    );
};

export default DailyBoxReturnReport;