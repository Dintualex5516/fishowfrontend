import React, { useEffect, useState } from "react";
import {
  getBoxReceiveReport,
  addBoxReceive,
  BoxReceiveRow,
} from "../../lib/box";

interface BoxReceiveReportProps {
  dateRange: { startDate: string; endDate: string };
}

const BoxReceiveReport: React.FC<BoxReceiveReportProps> = ({ dateRange }) => {
  const [data, setData] = useState<BoxReceiveRow[]>([]);
  const [typeInputs, setTypeInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchBoxReceiveData();
    }
  }, [dateRange]);

  const fetchBoxReceiveData = async () => {
    setLoading(true);
    try {
      const res = await getBoxReceiveReport(dateRange.startDate, dateRange.endDate);
      setData(res.rows || []);
      setTypeInputs({});
    } catch (e) {
      console.error("Error fetching box receive data:", e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const entries = Object.entries(typeInputs)
      .map(([rowId, val]) => {
        const n = Number(val);
        if (!n || n <= 0 || Number.isNaN(n)) return null;
        const row = data.find((r) => r.id === rowId);
        if (!row) return null;
        return {
          partyName: row.party,
          customerName: row.customer,
          boxes: n,
          date: new Date(row.date).toISOString().split("T")[0],
        };
      })
      .filter(Boolean) as Array<{
        partyName: string;
        customerName: string;
        boxes: number;
        date: string;
      }>;

    console.log("Prepared payloads for box receive:", entries);

    if (!entries.length) {
      setSaveMsg("Nothing to save");
      setTimeout(() => setSaveMsg(""), 2000);
      return;
    }

    try {
      for (const p of entries) {
        await addBoxReceive(p);
      }
      setSaveMsg("Saved successfully");
      setTimeout(() => setSaveMsg(""), 2000);
      await fetchBoxReceiveData();
    } catch (e) {
      console.error(e);
      setSaveMsg("Save failed");
      setTimeout(() => setSaveMsg(""), 2500);
    }
  };

  const handlePrint = () => {
    const el = document.getElementById("printable-area")?.innerHTML;
    if (!el) return;
    const w = window.open("", "", "height=600,width=800");
    if (!w) return;
    const currentDate = new Date().toISOString().split("T")[0];
    w.document.title = `Box Receive Report - ${currentDate}`;
    w.document.write('<html><head><title>Fishow - Box Receive Report</title>');
    w.document.write(
      '<style>body{font-family: Arial, sans-serif; margin: 20px;} h1,h2{text-align:center;} table{width:100%; border-collapse:collapse;} th,td{border:1px solid #000; padding:8px; text-align:left;} th{background:#f2f2f2;} .footer{margin-top:20px; text-align:center; font-size:12px;}</style>'
    );
    w.document.write("</head><body><h1>Fishow</h1><h2>Box Receive Report</h2>");
    w.document.write(el);
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

  const totalBoxes = data.reduce((sum, r) => sum + (r.totalBox || 0), 0);
  const totalSold = data.reduce((sum, r) => sum + (r.boxesSold || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Box Receive Report
        </h2>
        <div className="flex items-center gap-2 print:hidden">
          {saveMsg && (
            <span className="text-sm text-gray-700 dark:text-gray-300 mr-2">
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
          >
            Save
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Print
          </button>
        </div>
      </div>

      <div id="printable-area" className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Party</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Box</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Salesman</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Item</th> */}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Boxes Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Box Received</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Balance</th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.map((row) => {
              const typed = Number(typeInputs[row.id] ?? "");
              const receivedNow = Number.isFinite(typed) ? Math.max(0, typed) : 0;
              const liveBalance = row.boxesSold - receivedNow;

              return (
                <tr key={row.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {new Date(row.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {row.party}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {row.totalBox}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {row.salesman}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {row.customer}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {row.item}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                    {row.boxesSold}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 flex items-center gap-2">
                    <span>{row.boxReceived}</span>
                    <input
                      type="number"
                      min={0}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm text-center"
                      value={typeInputs[row.id] ?? ""}
                      onChange={(e) =>
                        setTypeInputs((prev) => ({ ...prev, [row.id]: e.target.value }))
                      }
                      placeholder="Enter"
                    />
                  </td>

                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      (Number.isFinite(typed) && typed !== 0 ? liveBalance : row.balance) < 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {Number.isFinite(typed) && typed !== 0
                      ? liveBalance
                      : row.balance}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-gray-900 dark:text-gray-200">
        Total Boxes: <b>{totalBoxes}</b> &nbsp;|&nbsp; Boxes Sold:{" "}
        <b>{totalSold}</b>
      </div>
    </div>
  );
};

export default BoxReceiveReport;
