// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AdminBoard from '../../components/AdminBoard';
// import { Save } from 'lucide-react';
// import { getBoxTracking, receiveBoxes } from '../../lib/boxTracking';

// interface BoxTrackingItem {
//   id: string;
//   customer: string;
//   party: string;
//   openingBalance: number;
//   todaySales: number;
//   total: number;
//   currentDbBalance: number;
//   rcdBox: number;
//   balance: number;
//   isModified?: boolean;
//   totalReceived: number;
// }

// const MultipleBoxReceiveUpdate: React.FC = () => {
//   const navigate = useNavigate();
//   const [items, setItems] = useState<BoxTrackingItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

//   useEffect(() => {
//     const isAuthenticated = localStorage.getItem('isAuthenticated');
//     if (!isAuthenticated) {
//       navigate('/login');
//       return;
//     }
//     fetchData();
//   }, [navigate]);

//   useEffect(() => {
//     if (notification) {
//       const timer = setTimeout(() => setNotification(null), 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [notification]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const today = new Date().toISOString().slice(0, 10);
//       const payload = await getBoxTracking(today);
//       const rows = Array.isArray(payload.items) ? payload.items : [];

//       const mapped: BoxTrackingItem[] = rows.map((r: any, idx: number) => {
//         const partyId = r.party_id ?? r.partyId ?? null;
//         const customerId = r.customer_id ?? r.customerId ?? null;
//         const partyName = r.party_name ?? r.party ?? null;
//         const customerName = r.customer_name ?? r.customer ?? null;
//         const openingBalance = Number(r.openingBalance ?? r.opening_balance ?? 0);
//         const todaySales = Number(r.todaySales ?? r.todays_sales ?? 0);
//         const total = Number(r.total ?? openingBalance + todaySales);
//         const closing = Number(r.closingBalance ?? r.closing_balance ?? 0);
//         const totalReceived = Number(r.totalReceived ?? r.total_received ?? r.box_receive ?? 0);

//         return {
//           id: String(r.id ?? `${partyId ?? partyName}|||${customerId ?? customerName}|||${idx}`),
//           customer: customerName ?? '',
//           party: partyName ?? '',
//           openingBalance,
//           todaySales,
//           total,
//           currentDbBalance: closing,
//           rcdBox: 0, // default empty for input
//           balance: closing,
//           isModified: false,
//           totalReceived,
//           // @ts-ignore
//           partyId,
//           // @ts-ignore
//           customerId,
//         };
//       });

//       // Sort alphabetically by customer name
//       const sorted = mapped.sort((a, b) => a.customer.localeCompare(b.customer));
//       setItems(sorted);
//     } catch (err) {
//       console.error('Error fetching box tracking', err);
//       setNotification({ message: 'Error loading data. Please refresh the page.', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveChanges = async () => {
//     if (saving) return;
//     setSaving(true);
//     try {
//       const modified = items.filter(it => it.isModified && Number(it.rcdBox) > 0);
//       if (modified.length === 0) {
//         setNotification({ message: 'No changes to save!', type: 'error' });
//         setSaving(false);
//         return;
//       }

//       const updates = modified.map(it => {
//         const base: any = {
//           receiveDelta: Number(it.rcdBox),
//         };
//         if ((it as any).partyId && (it as any).customerId) {
//           base.partyId = (it as any).partyId;
//           base.customerId = (it as any).customerId;
//         } else {
//           base.partyName = it.party;
//           base.customerName = it.customer;
//         }
//         return base;
//       });

//       await receiveBoxes(updates);
//       setNotification({ message: `${modified.length} record(s) saved successfully!`, type: 'success' });
//       await fetchData();
//     } catch (err: any) {
//       console.error('Save error', err);
//       const message = err?.response?.data?.message ?? err.message ?? 'Error saving data.';
//       setNotification({ message, type: 'error' });
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
//         <AdminBoard />
//         <div className="flex items-center justify-center h-64">
//           <p className="text-gray-900 dark:text-white text-sm sm:text-base">Loading data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
//       <AdminBoard />

//       {/* Notification */}
//       {notification && (
//         <div className="fixed top-4 right-4 z-50">
//           <div
//             className={`px-4 py-3 rounded-lg shadow-lg border ${notification.type === 'success'
//               ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
//               : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
//               }`}
//           >
//             <span className="font-medium">{notification.message}</span>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
//             <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
//               Multiple Box Receive
//             </h1>
//             <button
//               onClick={handleSaveChanges}
//               disabled={items.filter(item => item.isModified).length === 0 || saving}
//               className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg w-full sm:w-auto"
//             >
//               <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
//               <span>{saving ? 'Saving...' : 'Save Changes'}</span>
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table
//               className="w-full border-collapse border border-gray-300 dark:border-gray-600"
//               style={{ minWidth: '600px' }}
//             >
//               <thead>
//                 <tr className="bg-gray-50 dark:bg-gray-700">
//                   <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[80px]">Customer</th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[60px]">Party</th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[70px]">Opening</th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[60px]">Sales</th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[50px]">Total</th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[80px]">Received</th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[70px]">Balance</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, index) => (
//                   <tr
//                     key={`${item.id}-${index}`}
//                     className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
//                   >
//                     <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.customer}</td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.party}</td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.openingBalance}</td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.todaySales}</td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.total}</td>

//                     {/* ✅ Editable "Received Box" input with existing value shown as placeholder */}
//                     <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3">
//                       <input
//                         type="text"
//                         value={item.rcdBox === 0 ? '' : item.rcdBox.toString()}
//                         placeholder={`Today's Entry: ${item.totalReceived}`}
//                         onChange={(e) => {
//                           const val = e.target.value;
//                           if (val === '' || /^\d+$/.test(val)) {
//                             setItems(prevItems => {
//                               const itemIndex = prevItems.findIndex(prevItem => prevItem.id === item.id);
//                               if (itemIndex !== -1) {
//                                 const available = prevItems[itemIndex].currentDbBalance;
//                                 const entered = Number(val) || 0;
//                                 const safeValue = Math.min(entered); // ✅ prevent negatives

//                                 const updatedItem = {
//                                   ...prevItems[itemIndex],
//                                   rcdBox: entered,
//                                   balance: available - entered,
//                                   isModified: true,
//                                 };
//                                 return [
//                                   ...prevItems.slice(0, itemIndex),
//                                   updatedItem,
//                                   ...prevItems.slice(itemIndex + 1),
//                                 ];
//                               }
//                               return prevItems;
//                             });
//                           }
//                         }}
//                         className="w-full px-2 sm:px-3 py-1 sm:py-2 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                       />
//                     </td>

//                     <td
//                       className={`border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium ${item.balance < 0
//                         ? 'text-red-600 dark:text-red-400'
//                         : item.balance > 0
//                           ? 'text-green-600 dark:text-green-400'
//                           : 'text-gray-900 dark:text-white'
//                         }`}
//                     >
//                       {item.balance}
//                       {item.isModified && <span className="ml-1 sm:ml-2 text-xs text-blue-600 dark:text-blue-400">(modified)</span>}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MultipleBoxReceiveUpdate;







import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBoard from '../../components/AdminBoard';
import SearchableInput from '../../components/SearchableInput';
import { Save, Printer } from 'lucide-react';
import { getBoxTracking, receiveBoxes } from '../../lib/boxTracking';

interface BoxTrackingItem {
  id: string;
  customer: string;
  party: string;
  openingBalance: number;
  todaySales: number;
  total: number;
  currentDbBalance: number;
  rcdBox: number;
  balance: number;
  isModified?: boolean;
  totalReceived: number;
}

const MultipleBoxReceiveUpdate: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<BoxTrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [customerList, setCustomerList] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const payload = await getBoxTracking(today);
      const rows = Array.isArray(payload.items) ? payload.items : [];

      const mapped: BoxTrackingItem[] = rows.map((r: any, idx: number) => {
        const partyId = r.party_id ?? r.partyId ?? null;
        const customerId = r.customer_id ?? r.customerId ?? null;
        const partyName = r.party_name ?? r.party ?? null;
        const customerName = r.customer_name ?? r.customer ?? null;
        const openingBalance = Number(r.openingBalance ?? r.opening_balance ?? 0);
        const todaySales = Number(r.todaySales ?? r.todays_sales ?? 0);
        const total = Number(r.total ?? openingBalance + todaySales);
        const closing = Number(r.closingBalance ?? r.closing_balance ?? 0);
        const totalReceived = Number(r.totalReceived ?? r.total_received ?? r.box_receive ?? 0);

        return {
          id: String(r.id ?? `${partyId ?? partyName}|||${customerId ?? customerName}|||${idx}`),
          customer: customerName ?? '',
          party: partyName ?? '',
          openingBalance,
          todaySales,
          total,
          currentDbBalance: closing,
          rcdBox: 0, // default empty for input
          balance: closing,
          isModified: false,
          totalReceived,
          // @ts-ignore
          partyId,
          // @ts-ignore
          customerId,
        };
      });

      // Sort alphabetically by customer name
      const sorted = mapped.sort((a, b) => a.customer.localeCompare(b.customer));
      setItems(sorted);

      // Extract unique customer names for autocomplete
      const uniqueCustomers = Array.from(
        new Set(sorted.map(item => item.customer).filter(name => name))
      ).map((name, index) => ({
        id: String(index),
        name: name
      }));
      setCustomerList(uniqueCustomers);
    } catch (err) {
      console.error('Error fetching box tracking', err);
      setNotification({ message: 'Error loading data. Please refresh the page.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const modified = items.filter(it => it.isModified && Number(it.rcdBox) > 0);
      if (modified.length === 0) {
        setNotification({ message: 'No changes to save!', type: 'error' });
        setSaving(false);
        return;
      }

      const updates = modified.map(it => {
        const base: any = {
          receiveDelta: Number(it.rcdBox),
        };
        if ((it as any).partyId && (it as any).customerId) {
          base.partyId = (it as any).partyId;
          base.customerId = (it as any).customerId;
        } else {
          base.partyName = it.party;
          base.customerName = it.customer;
        }
        return base;
      });

      await receiveBoxes(updates);
      setNotification({ message: `${modified.length} record(s) saved successfully!`, type: 'success' });
      await fetchData();
    } catch (err: any) {
      console.error('Save error', err);
      const message = err?.response?.data?.message ?? err.message ?? 'Error saving data.';
      setNotification({ message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById("printable-box-receive")?.innerHTML;
    if (printContents) {
      const printWindow = window.open("", "", "height=600,width=800");
      if (printWindow) {
        const currentDate = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        printWindow.document.title = `Multiple Box Receive - ${currentDate}`;
        printWindow.document.write('<html><head><title>Fishow - Multiple Box Receive</title>');
        printWindow.document.write(
          '<style>body{font-family: Arial, sans-serif; margin: 20px; overflow: visible !important; max-width: 100% !important;} h1, h2 {text-align: center;} table {width: 100%; border-collapse: collapse; overflow: visible !important; max-width: 100% !important;} th, td {border: 1px solid #000; padding: 8px; text-align: left;} th {background-color: #f2f2f2;} .footer {margin-top: 20px; text-align: center; font-size: 12px;}</style>'
        );
        printWindow.document.write("</head><body>");
        printWindow.document.write("<h1>Fishow</h1>");
        printWindow.document.write("<h2>Multiple Box Receive</h2>");
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <AdminBoard />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-900 dark:text-white text-sm sm:text-base">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg border ${notification.type === 'success'
              ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
              : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
              }`}
          >
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Multiple Box Receive
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-64">
                <SearchableInput
                  value={searchFilter}
                  onChange={setSearchFilter}
                  searchData={customerList}
                  onSelect={(customer) => setSearchFilter(customer.name)}
                  placeholder="Search customer..."
                  createRoute="#"
                  entityType="Customer"
                />
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={items.filter(item => item.isModified).length === 0 || saving}
                className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <Save className={`w-4 h-4 ${saving ? 'animate-pulse' : ''}`} />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div id="printable-box-receive">
              <table
                className="w-full border-collapse border border-gray-300 dark:border-gray-600"
                style={{ minWidth: '600px' }}
              >
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[80px]">Customer</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[60px]">Party</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[70px]">Opening</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[60px]">Sales</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[50px]">Total</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[80px]">Received</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[70px]">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter(item =>
                      item.customer.toLowerCase().includes(searchFilter.toLowerCase())
                    )
                    .map((item, index) => (
                      <tr
                        key={`${item.id}-${index}`}
                        className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                      >
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.customer}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.party}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.openingBalance}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.todaySales}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">{item.total}</td>

                        {/* ✅ Editable "Received Box" input with existing value shown as placeholder */}
                        <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3">
                          <input
                            type="text"
                            value={item.rcdBox === 0 ? '' : item.rcdBox.toString()}
                            placeholder={`Today's Entry: ${item.totalReceived}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '' || /^\d+$/.test(val)) {
                                setItems(prevItems => {
                                  const itemIndex = prevItems.findIndex(prevItem => prevItem.id === item.id);
                                  if (itemIndex !== -1) {
                                    const available = prevItems[itemIndex].currentDbBalance;
                                    const entered = Number(val) || 0;
                                    const safeValue = Math.min(entered, available); // ✅ prevent negatives
                                    const updatedItem = {
                                      ...prevItems[itemIndex],
                                      rcdBox: safeValue,
                                      balance: Math.max(0, available - safeValue),
                                      isModified: true,
                                    };
                                    return [
                                      ...prevItems.slice(0, itemIndex),
                                      updatedItem,
                                      ...prevItems.slice(itemIndex + 1),
                                    ];
                                  }
                                  return prevItems;
                                });
                              }
                            }}
                            className="w-full px-2 sm:px-3 py-1 sm:py-2 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </td>

                        <td
                          className={`border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium ${item.balance < 0
                            ? 'text-red-600 dark:text-red-400'
                            : item.balance > 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-900 dark:text-white'
                            }`}
                        >
                          {item.balance}
                          {item.isModified && <span className="ml-1 sm:ml-2 text-xs text-blue-600 dark:text-blue-400">(modified)</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleBoxReceiveUpdate;