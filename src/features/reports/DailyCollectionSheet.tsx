import React, { useEffect, useState } from "react";
import PrintLayout from "../../components/PrintLayout";
import { getLedgerCollection, saveLedgerCollection, LedgerRow } from "../../lib/ledgerApi";

interface DailyCollectionSheetProps {
  date: string;
  filterRowId?: string | null;
}

const DailyCollectionSheet: React.FC<DailyCollectionSheetProps> = ({ date, filterRowId }) => {
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [paidInputs, setPaidInputs] = useState<Record<string, number | undefined>>({});
  const [discountInputs, setDiscountInputs] = useState<Record<string, number | undefined>>({});
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!date) return;
    (async () => {
      setLoading(true);
      try {
        const { rows: apiRows } = await getLedgerCollection(date);
        // set rows directly — they contain customer: { id, name }
        setRows(apiRows);

        // Prefill Paid/Discount inputs keyed by id-or-name
        const paidPrefill: Record<string, number> = {};
        const discPrefill: Record<string, number> = {};
        for (const r of apiRows) {
          const key = typeof r.customer === 'object' && r.customer !== null
            ? (r.customer.id ?? r.customer.name)
            : (r.customer as string);

          if (r.paid) paidPrefill[key] = Number(r.paid) || 0;
          if (r.discount) discPrefill[key] = Number(r.discount) || 0;
        }
        setPaidInputs(paidPrefill);
        setDiscountInputs(discPrefill);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [date]);


  // Totals
  // Totals
  const visibleRows = rows.filter(item => {
    if (!filterRowId) return true;
    const cObj = typeof item.customer === 'object' && item.customer !== null
      ? item.customer
      : { id: null, name: String(item.customer) };
    return cObj.id ? String(cObj.id) === String(filterRowId) : false;
  });

  const totalOpening = visibleRows.reduce((s, it) => s + it.opening, 0);
  const totalToday = visibleRows.reduce((s, it) => s + it.todaysAmount, 0);

  // Calculate total paid/discount based on VISIBLE rows
  const totalPaid = visibleRows.reduce((sum, r) => {
    const key = typeof r.customer === 'object' && r.customer !== null
      ? (r.customer.id ?? r.customer.name)
      : (r.customer as string);
    return sum + (paidInputs[key] ?? 0);
  }, 0);

  const totalDiscount = visibleRows.reduce((sum, r) => {
    const key = typeof r.customer === 'object' && r.customer !== null
      ? (r.customer.id ?? r.customer.name)
      : (r.customer as string);
    return sum + (discountInputs[key] ?? 0);
  }, 0);

  const handleSave = async () => {
    try {
      // Build items using id if present, else skip (because ar_ledger now requires customer_id)
      const items = rows.map(r => {
        const customerObj = typeof r.customer === 'object' && r.customer !== null
          ? r.customer
          : { id: null, name: String(r.customer) };

        const key = String(customerObj.id ?? customerObj.name);

        return {
          customerId: customerObj.id ?? null,     // <-- send id when present (or null)
          paid: Number(paidInputs[key] ?? 0),
          discount: Number(discountInputs[key] ?? 0),
        };
      });

      // You might want to filter out rows without customerId if the server now requires it:
      const itemsToSend = items.filter(it => it.customerId !== null);

      console.log(itemsToSend, "ledger input");

      await saveLedgerCollection({ date, items: itemsToSend });

      setSaveMessage("Data saved successfully!");
      setTimeout(() => setSaveMessage(""), 2500);
    } catch (e) {
      console.error(e);
      setSaveMessage("Save failed.");
      setTimeout(() => setSaveMessage(""), 2500);
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
    <PrintLayout title="Daily Collection Sheet">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4 print:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Collection Sheet</h2>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("printable-area");
                if (!el) return;
                const w = window.open("", "", "height=600,width=800");
                if (!w) return;
                const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
                w.document.title = `Daily Collection Sheet - ${currentDate}`;
                w.document.write(`<html><head><title>Fishow - Daily Collection Sheet</title>`);
                w.document.write(
                  `<style>
                    body{font-family: Arial, sans-serif; margin: 20px;}
                    h1,h2{text-align:center;}
                    table{width:100%; border-collapse:collapse;}
                    th,td{border:1px solid #000; padding:8px; text-align:left;}
                    th{background:#f2f2f2;}
                    .footer{margin-top:20px; text-align:center; font-size:12px;}
                  </style>`
                );
                w.document.write(`</head><body><h1>Fishow</h1><h2>Daily Collection Sheet</h2>`);
                w.document.write(el.innerHTML);
                w.document.write(`<div class="footer">Thank you for your business!</div>`);
                w.document.write(`</body></html>`);
                w.document.close();
                w.focus();
                w.print();
                w.close();
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Print
            </button>
          </div>
        </div>

        {saveMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded print:hidden">
            {saveMessage}
          </div>
        )}

        <div id="printable-area" className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance (Carried Forward)</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Today&apos;s Amount</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Paid</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Discount</th>
                <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Closing Balance</th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
              {rows
                .filter(item => {
                  if (!filterRowId) return true;
                  const cObj = typeof item.customer === 'object' && item.customer !== null
                    ? item.customer
                    : { id: null, name: String(item.customer) };
                  // If filterRowId is present, we try to match ID
                  // Note: item.customer might have string ID or number ID due to API variations, so comparing as string is safer.
                  if (cObj.id) {
                    return String(cObj.id) === String(filterRowId);
                  }
                  // Optional: match by name if ID is missing? 
                  // But filterRowId is likely an ID.
                  return false;
                })
                .map((item, index) => {
                  const customerObj =
                    typeof item.customer === "object" && item.customer !== null
                      ? item.customer
                      : { id: null, name: String(item.customer) };

                  const key = customerObj.id ?? customerObj.name;

                  return (
                    <tr key={customerObj.id ?? `c-${index}`}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {customerObj.name}
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₹{item.opening.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        ₹{item.todaysAmount.toFixed(2)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="border border-gray-300 dark:border-gray-600 rounded p-1">
                          ₹{(item.opening + item.todaysAmount).toFixed(2)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 print:hidden">
                        <input
                          type="number"
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance:textfield]"
                          value={paidInputs[key] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const value = val === "" ? undefined : Math.max(0, Number(val) || 0);
                            setPaidInputs((prev) => ({ ...prev, [key]: value }));
                          }}
                          placeholder="Enter amount"
                          min={0}
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 print:hidden">
                        <input
                          type="number"
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-moz-appearance:textfield]"
                          value={discountInputs[key] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            const value = val === "" ? undefined : Math.max(0, Number(val) || 0);
                            setDiscountInputs((prev) => ({ ...prev, [key]: value }));
                          }}
                          placeholder="Enter amount"
                          min={0}
                        />
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        <div className="border border-gray-300 dark:border-gray-600 rounded p-1 font-semibold text-gray-900 dark:text-white">
                          ₹{((item.opening + item.todaysAmount) - (Number(paidInputs[key] ?? 0) + Number(discountInputs[key] ?? 0))).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>

            <tfoot className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <td colSpan={4} className="px-2 sm:px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                  Grand Total (Paid - Discount):
                </td>
                <td className="px-2 sm:px-6 py-3 text-sm font-bold text-green-600 dark:text-green-400">
                  ₹{(totalPaid - totalDiscount).toFixed(2)}
                </td>
                <td colSpan={2} className="print:hidden"></td>
              </tr>
              <tr>
                <td colSpan={6} className="px-2 sm:px-6 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                  Grand Total Closing Balance:
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-left text-sm font-bold text-blue-600 dark:text-blue-400">
                  ₹{(totalOpening + totalToday - (totalPaid + totalDiscount)).toFixed(2)}
                </td>
              </tr>
            </tfoot>

          </table>
        </div>
      </div>
    </PrintLayout>
  );
};

export default DailyCollectionSheet;