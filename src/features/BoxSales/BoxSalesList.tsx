


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AdminBoard from '../../components/AdminBoard';
// import SearchableInput from '../../components/SearchableInput';
// import { Eye, FileText, Edit, Save, Trash2, Plus, X } from 'lucide-react';
// import { deleteBoxSaleRow, listBoxSaleRows, updateBoxSaleRow } from '../../lib/boxSale';
// import { listEntities } from '../../lib/entities';


// interface BoxSalesEntry {
//   id: string;
//   date: string;
//   party: string;
//   totalBox: string;
//   salesman: string;
//   items: Array<{
//     id: string;
//     customer: string;
//     box: string;
//     box_type?: string | null;
//     remark?: string | null;
//   }>;

//   totalAmount: string;
//   createdAt: string;
//   load_number?: number;
//   load_number_string?: string;
//   balance: number;
// }

// // API shape we receive from /api/box-sale-list
// type ApiBoxItem = {
//   id: string | number;
//   customer?: string | null;
//   box?: number | null;
//   product_name?: string | null;
//   box_type?: string | null;
//   price?: number | null;
//   total_amount?: number | null;
//   remark?: string | null;
//   kg?: number | null;
//   created_at?: string | null;
// };

// type ApiBoxEntry = {
//   id: string;
//   load_number?: number | null;
//   load_number_str?: string | null;
//   date?: string | null;
//   party?: string | null;
//   salesman?: string | null;
//   total_box?: number | null;
//   items?: ApiBoxItem[];
//   sold_boxes?: number;
//   balance?: number;
//   total_amount?: number | null;
//   created_at?: string | null;
// };

// // The UI shape you were using (example — adapt if your component's BoxSalesEntry differs)
// type UiItem = {
//   id: string;
//   customer: string;
//   box: string;
//   box_type?: string | null;
// };


// type BoxSalesEntry1 = {
//   id: string;
//   date: string;
//   party: string;
//   totalBox: string;
//   salesman: string;
//   items: UiItem[];
//   totalAmount: string;
//   createdAt: string;
//   load_number?: number;
//   load_number_string?: string;
//   balance: number;
// };


// interface EditModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   entry: BoxSalesEntry | null;
//   onSave: (updatedEntry: BoxSalesEntry) => void;
//   onDelete: (entry: BoxSalesEntry) => void;
//   parties: { id: string; name: string }[];
//   salesmenList: { id: string; name: string }[];
//   products: { id: string; name: string }[];
//   customers: { id: string; name: string }[];
// }

// const EditModal: React.FC<EditModalProps> = ({
//   isOpen,
//   onClose,
//   entry,
//   onSave,
//   onDelete,
//   parties,
//   salesmenList,
//   products,
//   customers,
// }) => {
//   const [editData, setEditData] = useState<BoxSalesEntry | null>(null);

//   useEffect(() => {
//     if (entry) {
//       const partyId = parties.find(p => p.name === entry.party)?.id || entry.party;
//       const salesmanId = salesmenList.find(s => s.name === entry.salesman)?.id || entry.salesman;
//       const updatedItems = entry.items.map(item => {
//         // const itemId = products.find(p => p.name === item.item)?.id || item.item;
//         const customerId = customers.find(c => c.name === item.customer)?.id || item.customer;
//         const boxTypeId =
//           parties.find(p => p.name === item.box_type)?.id || // if name coming from FE mapping
//           parties.find(p => p.id === String(item.box_type))?.id || // if ID already in place
//           item.box_type;
//         return { ...item, customer: customerId, box_type: boxTypeId, remark: item.remark ?? "" };
//       });
//       setEditData({ ...entry, party: partyId, salesman: salesmanId, items: updatedItems });
//     }
//   }, [entry, parties, salesmenList, products, customers]);
//   const boxTypeTotals = React.useMemo(() => {
//     if (!editData) return [];

//     const map = new Map<string, number>();

//     editData.items.forEach(item => {
//       if (!item.box_type) return;

//       const boxCount = parseFloat(item.box) || 0;
//       map.set(item.box_type, (map.get(item.box_type) || 0) + boxCount);
//     });

//     return Array.from(map.entries()).map(([boxTypeId, total]) => {
//       const name =
//         parties.find(p => p.id === String(boxTypeId))?.name || boxTypeId;

//       return { name, total };
//     });
//   }, [editData, parties]);


//   if (!isOpen || !editData) return null;

//   const handleHeaderChange = (field: keyof BoxSalesEntry, value: any) => {
//     setEditData(prev => {
//       if (!prev) return null;
//       let updatedItems = prev.items;

//       // If party changes, update box_type for all items
//       if (field === 'party') {
//         updatedItems = prev.items.map(item => ({ ...item, box_type: value }));
//       }

//       const updated = { ...prev, [field]: value, items: updatedItems };

//       // If totalBox changes, recalculate balance
//       if (field === 'totalBox') {
//         const totalBoxNum = parseInt(String(value)) || 0;
//         const soldBoxes = updated.items.reduce((sum, item) => sum + (parseFloat(item.box) || 0), 0);
//         updated.balance = totalBoxNum - soldBoxes;
//       }

//       return updated;
//     });
//   };

//   const handleItemChange = (itemId: string, field: string, value: string) => {
//     setEditData(prev => {
//       if (!prev) return null;
//       const updatedItems = prev.items.map(item => {
//         if (item.id === itemId) {
//           const updatedItem = { ...item, [field]: value };
//           return updatedItem;
//         }
//         return item;
//       });
//       // Calculate sum of sold boxes
//       const soldBoxes = updatedItems.reduce((sum, item) => sum + (parseFloat(item.box) || 0), 0);
//       // Balance = totalBox - soldBoxes (totalBox fixed)
//       const totalBoxNum = parseInt(prev.totalBox);
//       const balance = totalBoxNum - soldBoxes;
//       return {
//         ...prev,
//         items: updatedItems,
//         balance,
//       };
//     });
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string, field: string) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();

//       const currentItemIndex = editData?.items.findIndex(item => item.id === itemId) ?? -1;
//       if (currentItemIndex === -1) return;

//       if (field === 'customer') {
//         // Move to box_type field in same row
//         setTimeout(() => {
//           const nextWrapper = document.querySelector<HTMLDivElement>(
//             `[data-item-id="${itemId}"][data-field="box_type"]`
//           );
//           if (nextWrapper) {
//             const input = nextWrapper.querySelector('input');
//             input?.focus();
//           }
//         }, 0);
//       } else if (field === 'box_type') {
//         // Move to box field in same row
//         setTimeout(() => {
//           const nextInput = document.querySelector<HTMLInputElement>(
//             `input[data-item-id="${itemId}"][data-field="box"]`
//           );
//           nextInput?.focus();
//         }, 0);
//       } else if (field === 'box') {
//         // Check if there's a row above this one
//         if (currentItemIndex > 0) {
//           // Navigate to the row above (previous row's customer field)
//           const prevRowItem = editData!.items[currentItemIndex - 1];
//           if (prevRowItem) {
//             setTimeout(() => {
//               const prevWrapper = document.querySelector<HTMLDivElement>(
//                 `[data-item-id="${prevRowItem.id}"][data-field="customer"]`
//               );
//               if (prevWrapper) {
//                 const input = prevWrapper.querySelector('input');
//                 input?.focus();
//               }
//             }, 0);
//           }
//         } else {
//           // No row above (index 0), create new row and focus on its customer field
//           const newItemId = addRow();
//           if (newItemId) {
//             setTimeout(() => {
//               const firstWrapper = document.querySelector<HTMLDivElement>(
//                 `[data-item-id="${newItemId}"][data-field="customer"]`
//               );
//               if (firstWrapper) {
//                 const input = firstWrapper.querySelector('input');
//                 input?.focus();
//               }
//             }, 0);
//           }
//         }
//       }
//     }
//   };

//   // Helper to get name from ID
//   const getName = (id: string, list: { id: string; name: string }[]) => {
//     const entity = list.find(e => e.id === id);
//     return entity ? entity.name : id;
//   };

//   const addRow = () => {
//     if (!editData) return null;

//     const newItem = {
//       id: crypto.randomUUID(),
//       customer: '',
//       box: '',
//       box_type: editData.party,
//     };


//     setEditData(prev => {
//       if (!prev) return null;
//       return {
//         ...prev,
//         items: [newItem, ...prev.items]
//       };
//     });

//     return newItem.id;
//   };

//   const removeRow = (itemId: string) => {
//     if (!editData) return;
//     if (editData.items.length <= 1) return; // Keep at least one row

//     setEditData(prev => {
//       if (!prev) return null;
//       return {
//         ...prev,
//         items: prev.items.filter(item => item.id !== itemId)
//       };
//     });
//   };

//   const handleSave = () => {
//     if (editData) {
//       onSave(editData);
//       onClose();
//     }
//   };



//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
//           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Box Sales Entry</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Header Information - Read-only */}
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                 Date
//               </label>
//               <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
//                 {new Date(editData.date).toLocaleDateString("en-GB")}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                 Party
//               </label>
//               {/* <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
//                 {getName(editData.party, parties)}
//               </p> */}
//               <SearchableInput
//                 value={editData.party}
//                 onChange={(value) => handleHeaderChange('party', value)}
//                 placeholder="Select Party"
//                 searchData={parties}
//                 onSelect={(party) => handleHeaderChange('party', party.id)}
//                 createRoute="/create-party"
//                 entityType="party"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                 Total Box
//               </label>
//               <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-semibold">
//                 {editData.totalBox}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                 Balance Boxes
//               </label>
//               <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-semibold">
//                 {editData.balance || 0}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                 Salesman
//               </label>
//               <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
//                 {getName(editData.salesman, salesmenList)}
//               </p>
//             </div>
//           </div>

//           {/* Action Buttons Row */}
//           <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4">
//             <div className="flex items-center">
//               <button
//                 onClick={addRow}
//                 className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-all w-full sm:w-auto"
//               >
//                 <Plus className="w-4 h-4" />
//                 <span>Add Row</span>
//               </button>
//             </div>
//             <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
//               <button
//                 onClick={() => entry && onDelete(entry)}
//                 className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
//               >
//                 <Trash2 className="w-4 h-4" />
//                 <span>Delete Entry</span>
//               </button>
//               <button
//                 onClick={onClose}
//                 className="px-4 sm:px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="px-4 sm:px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
//               >
//                 <Save className="w-4 h-4" />
//                 <span>Save Changes</span>
//               </button>
//             </div>
//           </div>

//           {/* Items Table */}
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
//               <thead>
//                 <tr className="bg-gray-50 dark:bg-gray-700">
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Customer
//                   </th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Box Type
//                   </th>
//                   {/* <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Items
//                   </th> */}
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Box
//                   </th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Remark
//                   </th>
//                   {/* <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Total
//                   </th> */}
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200 w-20">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {editData.items.map((item) => (
//                   <tr key={item.id} className="bg-white dark:bg-gray-800">
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
//                       <SearchableInput
//                         value={item.customer}
//                         onChange={(value) => handleItemChange(item.id, 'customer', value)}
//                         placeholder="Search Customer"
//                         searchData={customers}
//                         onSelect={(customer) => handleItemChange(item.id, 'customer', customer.id)}
//                         createRoute="/create-customer"
//                         entityType="customer"
//                         data-field="customer"
//                         data-item-id={item.id}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter' && !e.defaultPrevented) {
//                             // Move to box_type field in same row only if dropdown is not open
//                             setTimeout(() => {
//                               const nextWrapper = document.querySelector<HTMLDivElement>(
//                                 `[data-item-id="${item.id}"][data-field="box_type"]`
//                               );
//                               if (nextWrapper) {
//                                 const input = nextWrapper.querySelector('input');
//                                 input?.focus();
//                               }
//                             }, 0);
//                           } else {
//                             // Let handleKeyDown handle the case where dropdown might be closed (though Enter usually closes it)
//                             handleKeyDown(e, item.id, 'customer');
//                           }
//                         }}
//                       />
//                     </td>

//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
//                       <SearchableInput
//                         // value={
//                         //   parties.find(p => p.id === String(item.box_type))?.name || ""
//                         // }
//                         value={item.box_type || ""}

//                         onChange={(value) => {
//                           // this is user typing name, but we store raw text until they select
//                           handleItemChange(item.id, "box_type", value);
//                         }}
//                         placeholder="Select Party (Box Type)"
//                         searchData={parties}
//                         onSelect={(party) => {
//                           // When selecting → store ID only
//                           handleItemChange(item.id, "box_type", party.id);
//                         }}
//                         createRoute="/create-party"
//                         entityType="party"
//                         data-field="box_type"
//                         data-item-id={item.id}
//                         onKeyDown={(e) => {
//                           if (e.key === 'Enter' && !e.defaultPrevented) {
//                             // Move to box field in same row
//                             setTimeout(() => {
//                               const nextInput = document.querySelector<HTMLInputElement>(
//                                 `input[data-item-id="${item.id}"][data-field="box"]`
//                               );
//                               nextInput?.focus();
//                             }, 0);
//                           } else {
//                             handleKeyDown(e, item.id, "box_type");
//                           }
//                         }}
//                       />
//                     </td>


//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
//                       <input
//                         type="number"
//                         value={item.box}
//                         onChange={(e) => handleItemChange(item.id, 'box', e.target.value)}
//                         onKeyDown={(e) => handleKeyDown(e, item.id, 'box')}
//                         className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
//                         placeholder="0"
//                         data-field="box"
//                         data-item-id={item.id}
//                       />
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
//                       <input
//                         type="text"
//                         value={item.remark || ""}
//                         onChange={(e) => handleItemChange(item.id, "remark", e.target.value)}
//                         className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
//                         placeholder="Remark"
//                       />
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
//                       <button
//                         onClick={() => removeRow(item.id)}
//                         disabled={editData?.items.length <= 1}
//                         className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                         title="Remove Row"
//                       >
//                         <X className="w-4 h-4" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//               <tfoot>
//                 <tr className="bg-gray-100 dark:bg-gray-700">
//                   <td
//                     colSpan={4}
//                     className="border border-gray-300 dark:border-gray-600 px-4 py-3"
//                   >
//                     <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-900 dark:text-white">
//                       {boxTypeTotals.length > 0 ? (
//                         boxTypeTotals.map(bt => (
//                           <span
//                             key={bt.name}
//                             className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
//                           >
//                             {bt.name} – {bt.total}
//                           </span>
//                         ))
//                       ) : (
//                         <span className="text-gray-500 dark:text-gray-400">
//                           No box types
//                         </span>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               </tfoot>

//             </table>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// const BoxSalesList: React.FC = () => {
//   const navigate = useNavigate();
//   const [salesEntries, setSalesEntries] = useState<BoxSalesEntry[]>([]);
//   const [selectedEntry, setSelectedEntry] = useState<BoxSalesEntry | null>(
//     null
//   );
//   const [editingEntry, setEditingEntry] = useState<BoxSalesEntry | null>(null);
//   const [focusedIndex, setFocusedIndex] = useState<number>(-1);
//   const [viewFocusedIndex, setViewFocusedIndex] = useState<number>(-1);
//   const [deletingEntry, setDeletingEntry] = useState<BoxSalesEntry | null>(null);
//   const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
//   const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
//   const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
//   const [selectedSalesman, setSelectedSalesman] = useState('');
//   const [parties, setParties] = useState<{ id: string; name: string }[]>([]);
//   const [salesmenList, setSalesmenList] = useState<{ id: string; name: string }[]>([]);
//   const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
//   const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage] = useState(25);
//   const [kpis, setKpis] = useState<{ totalSale: number; boxesAdded: number; boxesSold: number; currentBalance: number } | null>(null);
//   const [loadingLookups, setLoadingLookups] = useState(false);
//   // Generate load number string
//   const getPartyName = (id?: string | null) =>
//     parties.find(p => p.id === String(id))?.name ?? "";

//   const generateLoadNumberString = (num: number) => {
//     const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
//     const letterIndex = Math.floor((num - 1) / 1000);
//     const numberPart = ((num - 1) % 1000) + 1;

//     if (letterIndex === 0) {
//       return `LD${String(numberPart).padStart(3, '0')}`;
//     } else {
//       const letter = letters[letterIndex - 1];
//       return `${letter}${String(numberPart).padStart(3, '0')}`;
//     }
//   };


//   const filteredEntries = salesEntries.filter((entry) => {
//     const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
//     const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
//     const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

//     // Date filtering
//     let dateMatch = true;
//     if (start && end && start === end) dateMatch = entryDate === start;
//     else if (start && !end) dateMatch = entryDate === start;
//     else if (!start && end) dateMatch = entryDate === end;
//     else if (start && end) dateMatch = entryDate >= start && entryDate <= end;

//     // Salesman filtering
//     const salesmanMatch = !selectedSalesman || entry.salesman.toLowerCase().includes(selectedSalesman.toLowerCase());

//     return dateMatch && salesmanMatch;
//   });

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const endIndex = startIndex + entriesPerPage;
//   const currentEntries = filteredEntries.slice(startIndex, endIndex);

//   useEffect(() => {
//     if (startDate && !endDate) setEndDate(startDate);
//   }, [startDate, endDate]);

//   useEffect(() => { fetchSales(); }, [startDate, endDate]);

//   // Keyboard Navigation
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       // Don't intercept if focus is in an input
//       if (
//         document.activeElement?.tagName === 'INPUT' ||
//         document.activeElement?.tagName === 'TEXTAREA' ||
//         editingEntry ||
//         deletingEntry
//       ) {
//         return;
//       }

//       // If View Details Modal is open
//       if (selectedEntry) {
//         const modalItems = selectedEntry.items.length;
//         if (modalItems === 0) return;

//         if (e.key === 'ArrowDown') {
//           e.preventDefault();
//           setViewFocusedIndex(prev => Math.min(prev + 1, modalItems - 1));
//         } else if (e.key === 'ArrowUp') {
//           e.preventDefault();
//           setViewFocusedIndex(prev => Math.max(prev - 1, 0));
//         } else if (e.key === 'Escape') {
//           e.preventDefault();
//           closeDetails();
//         }
//         return;
//       }

//       // Main list navigation
//       if (salesEntries.length === 0) return;
//       const totalItems = currentEntries.length;
//       if (totalItems === 0) return;

//       if (e.key === 'ArrowDown') {
//         e.preventDefault();
//         setFocusedIndex(prev => Math.min(prev + 1, totalItems - 1));
//       } else if (e.key === 'ArrowUp') {
//         e.preventDefault();
//         setFocusedIndex(prev => Math.max(prev - 1, 0));
//       } else if (e.key === 'Enter') {
//         if (focusedIndex >= 0 && focusedIndex < totalItems) {
//           e.preventDefault();
//           setSelectedEntry(currentEntries[focusedIndex]);
//           setViewFocusedIndex(0); // Start modal focus at first row
//         }
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [currentEntries, focusedIndex, viewFocusedIndex, editingEntry, deletingEntry, selectedEntry, salesEntries.length]);

//   // Scroll focused row into view
//   useEffect(() => {
//     if (selectedEntry && viewFocusedIndex >= 0) {
//       const row = document.getElementById(`view-row-${viewFocusedIndex}`);
//       row?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
//     } else if (focusedIndex >= 0) {
//       const row = document.getElementById(`sales-row-${focusedIndex}`);
//       row?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
//     }
//   }, [focusedIndex, viewFocusedIndex, selectedEntry]);


//   const fetchSales = async () => {
//     try {
//       const from = startDate;
//       const to = endDate;
//       // call backend route that groups by load and returns KPIs
//       const resp = await listBoxSaleRows({ from, to });

//       console.log(resp, "list includes box type")

//       const entries: BoxSalesEntry1[] = (resp.items || []).map((e: ApiBoxEntry) => {
//         return {
//           id: String(e.id ?? ''), // unique key for the group/load
//           // date: (e.date ?? (e.created_at ? e.created_at.split('T')[0] : new Date().toISOString().split('T')[0])),
//           date: (() => {
//             const raw = e.date ?? e.created_at ?? new Date().toISOString();
//             // If the value contains a time part, keep only date portion (YYYY-MM-DD)
//             return String(raw).split('T')[0];
//           })(),
//           party: e.party ?? '',
//           totalBox: String(Number(e.total_box ?? 0)),
//           salesman: e.salesman ?? '',
//           items: (e.items ?? []).map((it: ApiBoxItem) => ({
//             id: String(it.id ?? ''),
//             customer: it.customer ?? '',
//             box: String(it.box ?? 0),
//             box_type: it.box_type ? String(it.box_type) : null,
//             remark: it.remark ?? "",
//           }))

//           ,
//           totalAmount: String(Number(e.total_amount ?? 0)),
//           createdAt: e.created_at ?? '',
//           load_number: e.load_number ?? undefined,
//           load_number_string: e.load_number_str ?? undefined,
//           balance: Number(e.balance ?? 0),
//         };
//       });


//       setSalesEntries(entries);

//       // Set KPI state for UI KPI boxes
//       setKpis(resp.kpis);
//     } catch (err) {
//       console.error('Error fetching box sale list:', err);
//       setNotification({ message: 'Error loading box sale data', type: 'error' });
//     }
//   };

//   useEffect(() => {
//     const isAuthenticated = localStorage.getItem('isAuthenticated');
//     if (!isAuthenticated) {
//       navigate('/login');
//       return;
//     }

//     let mounted = true;
//     const fetchLookupsAndSales = async () => {
//       setLoadingLookups(true);
//       try {
//         const pageSize = 200;
//         const [custResp, partyResp, salesResp, prodResp] = await Promise.all([
//           listEntities("customers", { page: 1, pageSize }),
//           listEntities("parties", { page: 1, pageSize }),
//           listEntities("salesmen", { page: 1, pageSize }),
//           listEntities("products", { page: 1, pageSize }),
//         ]);

//         if (!mounted) return;

//         if (custResp && Array.isArray(custResp.data)) {
//           setCustomers(custResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
//         }
//         if (partyResp && Array.isArray(partyResp.data)) {
//           setParties(partyResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
//         }
//         if (salesResp && Array.isArray(salesResp.data)) {
//           setSalesmenList(salesResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
//         }
//         if (prodResp && Array.isArray(prodResp.data)) {
//           setProducts(prodResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
//         }

//         // finally fetch grouped sales entries
//         await fetchSales();
//       } catch (err) {
//         console.error("Error loading lookup data via listEntities:", err);
//         setNotification({ message: "Failed loading lookup data", type: "error" });
//       } finally {
//         if (mounted) setLoadingLookups(false);
//       }
//     };

//     fetchLookupsAndSales();
//     return () => { mounted = false; };

//     fetchSales();
//   }, [navigate]);

//   const viewDetails = (entry: BoxSalesEntry) => setSelectedEntry(entry);
//   const closeDetails = () => {
//     setSelectedEntry(null);
//     setViewFocusedIndex(-1);
//   };

//   const handleEdit = (entry: BoxSalesEntry) => {
//     setEditingEntry(entry);
//   };

//   const closeEdit = () => {
//     setEditingEntry(null);
//   };

//   const handleDelete = (entry: BoxSalesEntry) => {
//     setDeletingEntry(entry);
//   };

//   const closeDelete = () => {
//     setDeletingEntry(null);
//   };

//   const confirmDelete = async () => {
//     if (!deletingEntry) return;
//     try {
//       await deleteBoxSaleRow(deletingEntry.id);
//       // remove locally for instant feedback
//       setSalesEntries(prev => prev.filter(e => e.id !== deletingEntry.id));
//       setNotification({ message: 'Box sales entry deleted successfully!', type: 'success' });
//       closeDelete();
//       closeEdit();
//     } catch (err: any) {
//       console.error('Error deleting box sale entry:', err);
//       const message = err?.response?.data?.message ?? 'Error deleting entry';
//       setNotification({ message, type: 'error' });
//     }
//   };


//   const handleSaveEdit = async (updatedEntry: BoxSalesEntry) => {
//     try {
//       // Build payload for patch: use fields in box_sale_list table
//       // Note: backend PATCH accepts partial update; here we send representative fields.
//       const payload: any = {
//         date: updatedEntry.date,
//         party_name: updatedEntry.party,
//         salesman_name: updatedEntry.salesman,
//         total_box: Number(updatedEntry.totalBox || 0),
//         total_amount: Number(updatedEntry.totalAmount || 0),
//         // You may store items JSON in the row; if so include items
//         items: updatedEntry.items.map(it => ({
//           customer: it.customer,
//           box: Number(it.box || 0),
//           box_type: it.box_type ? Number(it.box_type) : null,
//           remark: it.remark ?? null,
//         }))
//         ,
//         // optionally load_number/load_number_str if you want to change them
//         load_number: updatedEntry.load_number,
//         load_number_str: updatedEntry.load_number_string,
//       };

//       // id here is loadKey which we used as the id in fetchSales mapping
//       const resp = await updateBoxSaleRow(updatedEntry.id, payload);

//       // success -> re-fetch canonical data
//       await fetchSales();
//       setNotification({ message: 'Box sales entry updated successfully!', type: 'success' });
//       closeEdit();
//     } catch (err: any) {
//       console.error('Error updating box sale entry:', err);
//       const message = err?.response?.data?.message ?? 'Error updating entry';
//       setNotification({ message, type: 'error' });
//     }
//   };


//   // Auto-hide notification after 3 seconds
//   useEffect(() => {
//     if (notification) {
//       const timer = setTimeout(() => {
//         setNotification(null);
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [notification]);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
//       <AdminBoard />

//       {/* Notification Toast */}
//       {notification && (
//         <div className="fixed top-4 right-4 z-50">
//           <div className={`px-4 py-3 rounded-lg shadow-lg border ${notification.type === 'success'
//             ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
//             : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
//             }`}>
//             <div className="flex items-center space-x-2">
//               {notification.type === 'success' ? (
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               ) : (
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//               )}
//               <span className="font-medium">{notification.message}</span>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
//           <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4">
//             <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Box Sales List</h1>
//             <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-300 w-full lg:w-auto">
//               <div className="flex items-center space-x-2 w-full sm:w-auto">
//                 <label className="whitespace-nowrap">Salesman:</label>
//                 <input
//                   type="text"
//                   value={selectedSalesman}
//                   onChange={(e) => {
//                     setSelectedSalesman(e.target.value);
//                     setCurrentPage(1); // Reset to first page when filtering
//                   }}
//                   placeholder="Search salesman..."
//                   className="flex-1 sm:flex-none min-w-0 sm:min-w-[120px] md:min-w-[150px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
//                 />
//               </div>
//               <div className="flex items-center space-x-2">
//                 <label className="whitespace-nowrap">From:</label>
//                 <input
//                   type="date"
//                   value={startDate}
//                   onChange={(e) => {
//                     setStartDate(e.target.value);
//                     setCurrentPage(1); // Reset to first page when filtering
//                   }}
//                   className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
//                 />
//               </div>
//               <div className="flex items-center space-x-2">
//                 <label className="whitespace-nowrap">To:</label>
//                 <input
//                   type="date"
//                   value={endDate}
//                   onChange={(e) => {
//                     setEndDate(e.target.value);
//                     setCurrentPage(1); // Reset to first page when filtering
//                   }}
//                   className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
//                 />
//               </div>
//               <div className="flex items-center space-x-1 text-xs sm:text-sm">
//                 <FileText className="w-4 h-4" />
//                 <span>{filteredEntries.length} entries found</span>
//               </div>

//               {/* Pagination Info */}
//               {totalPages > 1 && (
//                 <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
//                   <span>Page {currentPage} of {totalPages}</span>
//                   <div className="flex space-x-1">
//                     <button
//                       onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                       disabled={currentPage === 1}
//                       className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
//                     >
//                       ‹
//                     </button>
//                     <button
//                       onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                       disabled={currentPage === totalPages}
//                       className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
//                     >
//                       ›
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Summary Boxes - Responsive grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">

//             <div className="text-center">
//               <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Boxes Added</div>
//               <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                 {filteredEntries.reduce((sum, entry) => sum + (parseInt(entry.totalBox) || 0), 0)}
//               </div>
//               <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Total of Total Box column
//               </div>
//             </div>
//             <div className="text-center">
//               <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Boxes Sold</div>
//               <div className="text-2xl font-bold text-red-600 dark:text-red-400">
//                 {filteredEntries.reduce((sum, entry) => sum + entry.items.reduce((itemSum, item) => itemSum + (parseInt(item.box) || 0), 0), 0)}
//               </div>
//               <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Total boxes sold (from items)
//               </div>
//             </div>
//             <div className="text-center">
//               <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Current Balance</div>
//               <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
//                 {filteredEntries.reduce((sum, entry) => sum + (parseInt(entry.totalBox) || 0), 0) - filteredEntries.reduce((sum, entry) => sum + entry.items.reduce((itemSum, item) => itemSum + (parseInt(item.box) || 0), 0), 0)}
//               </div>
//               <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Boxes available (Added - Sold)
//               </div>
//             </div>
//           </div>

//           {filteredEntries.length === 0 ? (
//             <div className="text-center py-12">
//               <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
//               <p className="text-gray-600 dark:text-gray-300">No sales entries found.</p>
//               <button
//                 onClick={() => navigate('/fish-box-sent')}
//                 className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all"
//               >
//                 Create First Entry
//               </button>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
//                 <thead>
//                   <tr className="bg-gray-50 dark:bg-gray-700">
//                     <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                       Load No
//                     </th>
//                     <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                       Date
//                     </th>
//                     <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                       Party
//                     </th>
//                     <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                       Total Box
//                     </th>
//                     <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                       Balance
//                     </th>
//                     <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                       Salesman
//                     </th>
//                     <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {currentEntries.map((entry, index) => (
//                     /* <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"> */
//                     <tr
//                       key={entry.id}
//                       id={`sales-row-${index}`}
//                       onClick={() => setFocusedIndex(index)}
//                       className={`cursor-pointer transition-colors ${focusedIndex === index
//                         ? 'bg-blue-200 dark:bg-blue-900/30'
//                         : 'hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
//                         }`}
//                     >
//                       <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white truncate" title={entry.load_number_string || entry.id}>
//                         {entry.load_number_string || entry.id}
//                       </td>
//                       <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white">
//                         {new Date(entry.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
//                       </td>
//                       <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white truncate" title={entry.party}>
//                         {entry.party}
//                       </td>
//                       <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white">
//                         {entry.totalBox}
//                       </td>
//                       <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white">
//                         {entry.balance}
//                       </td>
//                       <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white hidden sm:table-cell" title={entry.salesman}>
//                         {entry.salesman}
//                       </td>
//                       <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-center">
//                         <div className="flex items-center justify-center space-x-1 sm:space-x-2">
//                           <button
//                             onClick={() => viewDetails(entry)}
//                             className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1 sm:p-0"
//                             title="View Details"
//                           >
//                             <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleEdit(entry)}
//                             className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors p-1 sm:p-0"
//                             title="Edit Entry"
//                           >
//                             <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Edit Modal */}
//       <EditModal
//         isOpen={!!editingEntry}
//         onClose={closeEdit}
//         entry={editingEntry}
//         onSave={handleSaveEdit}
//         onDelete={handleDelete}
//         parties={parties}
//         salesmenList={salesmenList}
//         products={products}
//         customers={customers}
//       />

//       {/* Details Modal */}
//       {selectedEntry && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-600">
//             <div className="p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                   Sales Entry Details
//                 </h2>
//                 <button
//                   onClick={closeDetails}
//                   className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Date
//                   </label>
//                   <p className="text-sm text-gray-900 dark:text-white">
//                     {new Date(selectedEntry.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Party
//                   </label>
//                   <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.party}</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Total Box
//                   </label>
//                   <p className="text-sm text-gray-900 dark:text-white">
//                     {selectedEntry.totalBox}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Balance Boxes
//                   </label>
//                   <p className="text-sm text-gray-900 dark:text-white">
//                     {selectedEntry.balance}
//                   </p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//                     Salesman
//                   </label>
//                   <p className="text-sm text-gray-900 dark:text-white">
//                     {selectedEntry.salesman}
//                   </p>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
//                   <thead>
//                     <tr className="bg-gray-50 dark:bg-gray-700">
//                       <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Customer
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Box
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Box Type
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Balance
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selectedEntry.items.map((item, idx) => {
//                       console.log(selectedEntry);
//                       return (
//                         <tr
//                           key={item.id}
//                           id={`view-row-${idx}`}
//                           onClick={() => setViewFocusedIndex(idx)}
//                           className={`transition-colors ${viewFocusedIndex === idx
//                             ? 'bg-blue-100 dark:bg-blue-900/40'
//                             : 'bg-white dark:bg-gray-800'
//                             }`}
//                         >
//                           <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
//                             {item.customer}
//                           </td>
//                           <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
//                             {item.box}
//                           </td>
//                           <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
//                             {/* {item.box_type} */}
//                             <td>
//                               {/* {parties.find(p => p.id === String(item.box_type))?.name || ""} */}
//                               {getPartyName(item.box_type)}

//                             </td>


//                             {/* {selectedEntry.party} */}
//                           </td>
//                           <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
//                             {selectedEntry.balance}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation Modal */}
//       {deletingEntry && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
//             <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Box Sales Entry</h2>
//               <button
//                 onClick={closeDelete}
//                 className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="p-6">
//               <div className="flex items-center mb-4">
//                 <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
//                   <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-medium text-gray-900 dark:text-white">
//                     Are you sure you want to delete this entry?
//                   </h3>
//                   <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
//                     This action cannot be undone. This will permanently delete the box sales entry for{' '}
//                     <span className="font-medium">{deletingEntry.party}</span> on{' '}
//                     <span className="font-medium">{new Date(deletingEntry.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>.
//                   </p>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={closeDelete}
//                   className="px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={confirmDelete}
//                   className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center space-x-2"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                   <span>Delete Entry</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BoxSalesList;







import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBoard from '../../components/AdminBoard';
import SearchableInput from '../../components/SearchableInput';
import { Eye, FileText, Edit, Save, Trash2, Plus, X } from 'lucide-react';
import { deleteBoxSaleRow, listBoxSaleRows, updateBoxSaleRow } from '../../lib/boxSale';
import { listEntities } from '../../lib/entities';


interface BoxSalesEntry {
  id: string;
  date: string;
  party: string;
  totalBox: string;
  salesman: string;
  items: Array<{
    id: string;
    customer: string;
    box: string;
    box_type?: string | null;
    remark?: string | null;
  }>;

  totalAmount: string;
  createdAt: string;
  load_number?: number;
  load_number_string?: string;
  balance: number;
}

// API shape we receive from /api/box-sale-list
type ApiBoxItem = {
  id: string | number;
  customer?: string | null;
  box?: number | null;
  product_name?: string | null;
  box_type?: string | null;
  price?: number | null;
  total_amount?: number | null;
  remark?: string | null;
  kg?: number | null;
  created_at?: string | null;
};

type ApiBoxEntry = {
  id: string;
  load_number?: number | null;
  load_number_str?: string | null;
  date?: string | null;
  party?: string | null;
  salesman?: string | null;
  total_box?: number | null;
  items?: ApiBoxItem[];
  sold_boxes?: number;
  balance?: number;
  total_amount?: number | null;
  created_at?: string | null;
};

// The UI shape you were using (example — adapt if your component's BoxSalesEntry differs)
type UiItem = {
  id: string;
  customer: string;
  box: string;
  box_type?: string | null;
};


type BoxSalesEntry1 = {
  id: string;
  date: string;
  party: string;
  totalBox: string;
  salesman: string;
  items: UiItem[];
  totalAmount: string;
  createdAt: string;
  load_number?: number;
  load_number_string?: string;
  balance: number;
};


interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BoxSalesEntry | null;
  onSave: (updatedEntry: BoxSalesEntry) => void;
  onDelete: (entry: BoxSalesEntry) => void;
  parties: { id: string; name: string }[];
  salesmenList: { id: string; name: string }[];
  products: { id: string; name: string }[];
  customers: { id: string; name: string }[];
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  entry,
  onSave,
  onDelete,
  parties,
  salesmenList,
  products,
  customers,
}) => {
  const [editData, setEditData] = useState<BoxSalesEntry | null>(null);

  useEffect(() => {
    if (entry) {
      const partyId = parties.find(p => p.name === entry.party)?.id || entry.party;
      const salesmanId = salesmenList.find(s => s.name === entry.salesman)?.id || entry.salesman;
      const updatedItems = entry.items.map(item => {
        // const itemId = products.find(p => p.name === item.item)?.id || item.item;
        const customerId = customers.find(c => c.name === item.customer)?.id || item.customer;
        const boxTypeId =
          parties.find(p => p.name === item.box_type)?.id || // if name coming from FE mapping
          parties.find(p => p.id === String(item.box_type))?.id || // if ID already in place
          item.box_type;
        return { ...item, customer: customerId, box_type: boxTypeId, remark: item.remark ?? "" };
      });
      setEditData({ ...entry, party: partyId, salesman: salesmanId, items: updatedItems });
    }
  }, [entry, parties, salesmenList, products, customers]);
  const boxTypeTotals = React.useMemo(() => {
    if (!editData) return [];

    const map = new Map<string, number>();

    editData.items.forEach(item => {
      if (!item.box_type) return;

      const boxCount = parseFloat(item.box) || 0;
      map.set(item.box_type, (map.get(item.box_type) || 0) + boxCount);
    });

    return Array.from(map.entries()).map(([boxTypeId, total]) => {
      const name =
        parties.find(p => p.id === String(boxTypeId))?.name || boxTypeId;

      return { name, total };
    });
  }, [editData, parties]);


  if (!isOpen || !editData) return null;

  const handleHeaderChange = (field: keyof BoxSalesEntry, value: any) => {
    setEditData(prev => {
      if (!prev) return null;
      let updatedItems = prev.items;

      // If party changes, update box_type for all items
      if (field === 'party') {
        updatedItems = prev.items.map(item => ({ ...item, box_type: value }));
      }

      const updated = { ...prev, [field]: value, items: updatedItems };

      // If totalBox changes, recalculate balance
      if (field === 'totalBox') {
        const totalBoxNum = parseInt(String(value)) || 0;
        const soldBoxes = updated.items.reduce((sum, item) => sum + (parseFloat(item.box) || 0), 0);
        updated.balance = totalBoxNum - soldBoxes;
      }

      return updated;
    });
  };

  const handleItemChange = (itemId: string, field: string, value: string) => {
    setEditData(prev => {
      if (!prev) return null;
      const updatedItems = prev.items.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          return updatedItem;
        }
        return item;
      });
      // Calculate sum of sold boxes
      const soldBoxes = updatedItems.reduce((sum, item) => sum + (parseFloat(item.box) || 0), 0);
      // Balance = totalBox - soldBoxes (totalBox fixed)
      const totalBoxNum = parseInt(prev.totalBox);
      const balance = totalBoxNum - soldBoxes;
      return {
        ...prev,
        items: updatedItems,
        balance,
      };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string, field: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const currentItemIndex = editData?.items.findIndex(item => item.id === itemId) ?? -1;
      if (currentItemIndex === -1) return;

      if (field === 'customer') {
        // Move to box_type field in same row
        setTimeout(() => {
          const nextWrapper = document.querySelector<HTMLDivElement>(
            `[data-item-id="${itemId}"][data-field="box_type"]`
          );
          if (nextWrapper) {
            const input = nextWrapper.querySelector('input');
            input?.focus();
          }
        }, 0);
      } else if (field === 'box_type') {
        // Move to box field in same row
        setTimeout(() => {
          const nextInput = document.querySelector<HTMLInputElement>(
            `input[data-item-id="${itemId}"][data-field="box"]`
          );
          nextInput?.focus();
        }, 0);
      } else if (field === 'box') {
        // Check if there's a row above this one
        if (currentItemIndex > 0) {
          // Navigate to the row above (previous row's customer field)
          const prevRowItem = editData!.items[currentItemIndex - 1];
          if (prevRowItem) {
            setTimeout(() => {
              const prevWrapper = document.querySelector<HTMLDivElement>(
                `[data-item-id="${prevRowItem.id}"][data-field="customer"]`
              );
              if (prevWrapper) {
                const input = prevWrapper.querySelector('input');
                input?.focus();
              }
            }, 0);
          }
        } else {
          // No row above (index 0), create new row and focus on its customer field
          const newItemId = addRow();
          if (newItemId) {
            setTimeout(() => {
              const firstWrapper = document.querySelector<HTMLDivElement>(
                `[data-item-id="${newItemId}"][data-field="customer"]`
              );
              if (firstWrapper) {
                const input = firstWrapper.querySelector('input');
                input?.focus();
              }
            }, 0);
          }
        }
      }
    }
  };

  // Helper to get name from ID
  const getName = (id: string, list: { id: string; name: string }[]) => {
    const entity = list.find(e => e.id === id);
    return entity ? entity.name : id;
  };

  const addRow = () => {
    if (!editData) return null;

    const newItem = {
      id: crypto.randomUUID(),
      customer: '',
      box: '',
      box_type: editData.party,
    };


    setEditData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: [newItem, ...prev.items]
      };
    });

    return newItem.id;
  };

  const removeRow = (itemId: string) => {
    if (!editData) return;
    if (editData.items.length <= 1) return; // Keep at least one row

    setEditData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      };
    });
  };

  const handleSave = () => {
    if (editData) {
      onSave(editData);
      onClose();
    }
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Box Sales Entry</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Information - Read-only */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Date
              </label>
              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {new Date(editData.date).toLocaleDateString("en-GB")}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Party
              </label>
              {/* <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {getName(editData.party, parties)}
              </p> */}
              <SearchableInput
                value={editData.party}
                onChange={(value) => handleHeaderChange('party', value)}
                placeholder="Select Party"
                searchData={parties}
                onSelect={(party) => handleHeaderChange('party', party.id)}
                createRoute="/create-party"
                entityType="party"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Total Box
              </label>
              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-semibold">
                {editData.totalBox}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Balance Boxes
              </label>
              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white font-semibold">
                {editData.balance || 0}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Salesman
              </label>
              <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                {getName(editData.salesman, salesmenList)}
              </p>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4 mb-4">
            <div className="flex items-center">
              <button
                onClick={addRow}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-all w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => entry && onDelete(entry)}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Entry</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 sm:px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 sm:px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Customer
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Box Type
                  </th>
                  {/* <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Items
                  </th> */}
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Box
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Remark
                  </th>
                  {/* <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Total
                  </th> */}
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200 w-20">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {editData.items.map((item) => (
                  <tr key={item.id} className="bg-white dark:bg-gray-800">
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <SearchableInput
                        value={item.customer}
                        onChange={(value) => handleItemChange(item.id, 'customer', value)}
                        placeholder="Search Customer"
                        searchData={customers}
                        onSelect={(customer) => handleItemChange(item.id, 'customer', customer.id)}
                        createRoute="/create-customer"
                        entityType="customer"
                        data-field="customer"
                        data-item-id={item.id}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.defaultPrevented) {
                            // Move to box_type field in same row only if dropdown is not open
                            setTimeout(() => {
                              const nextWrapper = document.querySelector<HTMLDivElement>(
                                `[data-item-id="${item.id}"][data-field="box_type"]`
                              );
                              if (nextWrapper) {
                                const input = nextWrapper.querySelector('input');
                                input?.focus();
                              }
                            }, 0);
                          } else {
                            // Let handleKeyDown handle the case where dropdown might be closed (though Enter usually closes it)
                            handleKeyDown(e, item.id, 'customer');
                          }
                        }}
                      />
                    </td>

                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <SearchableInput
                        // value={
                        //   parties.find(p => p.id === String(item.box_type))?.name || ""
                        // }
                        value={item.box_type || ""}

                        onChange={(value) => {
                          // this is user typing name, but we store raw text until they select
                          handleItemChange(item.id, "box_type", value);
                        }}
                        placeholder="Select Party (Box Type)"
                        searchData={parties}
                        onSelect={(party) => {
                          // When selecting → store ID only
                          handleItemChange(item.id, "box_type", party.id);
                        }}
                        createRoute="/create-party"
                        entityType="party"
                        data-field="box_type"
                        data-item-id={item.id}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.defaultPrevented) {
                            // Move to box field in same row
                            setTimeout(() => {
                              const nextInput = document.querySelector<HTMLInputElement>(
                                `input[data-item-id="${item.id}"][data-field="box"]`
                              );
                              nextInput?.focus();
                            }, 0);
                          } else {
                            handleKeyDown(e, item.id, "box_type");
                          }
                        }}
                      />
                    </td>


                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <input
                        type="number"
                        value={item.box}
                        onChange={(e) => handleItemChange(item.id, 'box', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, item.id, 'box')}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="0"
                        data-field="box"
                        data-item-id={item.id}
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      <input
                        type="text"
                        value={item.remark || ""}
                        onChange={(e) => handleItemChange(item.id, "remark", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        placeholder="Remark"
                      />
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                      <button
                        onClick={() => removeRow(item.id)}
                        disabled={editData?.items.length <= 1}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove Row"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <td
                    colSpan={4}
                    className="border border-gray-300 dark:border-gray-600 px-4 py-3"
                  >
                    <div className="flex flex-wrap gap-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {boxTypeTotals.length > 0 ? (
                        boxTypeTotals.map(bt => (
                          <span
                            key={bt.name}
                            className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                          >
                            {bt.name} – {bt.total}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">
                          No box types
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

const BoxSalesList: React.FC = () => {
  const navigate = useNavigate();
  const [salesEntries, setSalesEntries] = useState<BoxSalesEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<BoxSalesEntry | null>(
    null
  );
  const [editingEntry, setEditingEntry] = useState<BoxSalesEntry | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [viewFocusedIndex, setViewFocusedIndex] = useState<number>(-1);
  const [deletingEntry, setDeletingEntry] = useState<BoxSalesEntry | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSalesman, setSelectedSalesman] = useState('');
  const [parties, setParties] = useState<{ id: string; name: string }[]>([]);
  const [salesmenList, setSalesmenList] = useState<{ id: string; name: string }[]>([]);
  const [selectedParty, setSelectedParty] = useState('');

  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(25);
  const [kpis, setKpis] = useState<{ totalSale: number; boxesAdded: number; boxesSold: number; currentBalance: number } | null>(null);
  const [loadingLookups, setLoadingLookups] = useState(false);
  // Generate load number string
  const getPartyName = (id?: string | null) =>
    parties.find(p => p.id === String(id))?.name ?? "";

  const generateLoadNumberString = (num: number) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const letterIndex = Math.floor((num - 1) / 1000);
    const numberPart = ((num - 1) % 1000) + 1;

    if (letterIndex === 0) {
      return `LD${String(numberPart).padStart(3, '0')}`;
    } else {
      const letter = letters[letterIndex - 1];
      return `${letter}${String(numberPart).padStart(3, '0')}`;
    }
  };


  const filteredEntries = salesEntries.filter((entry) => {
    const entryDate = new Date(entry.date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    // Date filtering
    let dateMatch = true;
    if (start && end && start === end) dateMatch = entryDate === start;
    else if (start && !end) dateMatch = entryDate === start;
    else if (!start && end) dateMatch = entryDate === end;
    else if (start && end) dateMatch = entryDate >= start && entryDate <= end;

    // Salesman filtering
    // const salesmanMatch = !selectedSalesman || entry.salesman.toLowerCase().includes(selectedSalesman.toLowerCase());

    // return dateMatch && salesmanMatch;
    // Salesman filtering
    const salesmanMatch =
      !selectedSalesman ||
      entry.salesman.toLowerCase().includes(selectedSalesman.toLowerCase());

    // Party filtering
    const partyMatch =
      !selectedParty ||
      entry.party.toLowerCase().includes(selectedParty.toLowerCase());

    return dateMatch && salesmanMatch && partyMatch;

  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredEntries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  useEffect(() => {
    if (startDate && !endDate) setEndDate(startDate);
  }, [startDate, endDate]);

  useEffect(() => { fetchSales(); }, [startDate, endDate]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        editingEntry ||
        deletingEntry
      ) {
        return;
      }

      // If View Details Modal is open
      if (selectedEntry) {
        const modalItems = selectedEntry.items.length;
        if (modalItems === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setViewFocusedIndex(prev => Math.min(prev + 1, modalItems - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setViewFocusedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeDetails();
        }
        return;
      }

      // Main list navigation
      if (salesEntries.length === 0) return;
      const totalItems = currentEntries.length;
      if (totalItems === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, totalItems - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (focusedIndex >= 0 && focusedIndex < totalItems) {
          e.preventDefault();
          setSelectedEntry(currentEntries[focusedIndex]);
          setViewFocusedIndex(0); // Start modal focus at first row
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentEntries, focusedIndex, viewFocusedIndex, editingEntry, deletingEntry, selectedEntry, salesEntries.length]);

  // Scroll focused row into view
  useEffect(() => {
    if (selectedEntry && viewFocusedIndex >= 0) {
      const row = document.getElementById(`view-row-${viewFocusedIndex}`);
      row?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    } else if (focusedIndex >= 0) {
      const row = document.getElementById(`sales-row-${focusedIndex}`);
      row?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [focusedIndex, viewFocusedIndex, selectedEntry]);


  const fetchSales = async () => {
    try {
      const from = startDate;
      const to = endDate;
      // call backend route that groups by load and returns KPIs
      const resp = await listBoxSaleRows({ from, to });

      console.log(resp, "list includes box type")

      const entries: BoxSalesEntry1[] = (resp.items || []).map((e: ApiBoxEntry) => {
        return {
          id: String(e.id ?? ''), // unique key for the group/load
          // date: (e.date ?? (e.created_at ? e.created_at.split('T')[0] : new Date().toISOString().split('T')[0])),
          date: (() => {
            const raw = e.date ?? e.created_at ?? new Date().toISOString();
            // If the value contains a time part, keep only date portion (YYYY-MM-DD)
            return String(raw).split('T')[0];
          })(),
          party: e.party ?? '',
          totalBox: String(Number(e.total_box ?? 0)),
          salesman: e.salesman ?? '',
          items: (e.items ?? []).map((it: ApiBoxItem) => ({
            id: String(it.id ?? ''),
            customer: it.customer ?? '',
            box: String(it.box ?? 0),
            box_type: it.box_type ? String(it.box_type) : null,
            remark: it.remark ?? "",
          }))

          ,
          totalAmount: String(Number(e.total_amount ?? 0)),
          createdAt: e.created_at ?? '',
          load_number: e.load_number ?? undefined,
          load_number_string: e.load_number_str ?? undefined,
          balance: Number(e.balance ?? 0),
        };
      });


      setSalesEntries(entries);

      // Set KPI state for UI KPI boxes
      setKpis(resp.kpis);
    } catch (err) {
      console.error('Error fetching box sale list:', err);
      setNotification({ message: 'Error loading box sale data', type: 'error' });
    }
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    let mounted = true;
    const fetchLookupsAndSales = async () => {
      setLoadingLookups(true);
      try {
        const pageSize = 200;
        const [custResp, partyResp, salesResp, prodResp] = await Promise.all([
          listEntities("customers", { page: 1, pageSize }),
          listEntities("parties", { page: 1, pageSize }),
          listEntities("salesmen", { page: 1, pageSize }),
          listEntities("products", { page: 1, pageSize }),
        ]);

        if (!mounted) return;

        if (custResp && Array.isArray(custResp.data)) {
          setCustomers(custResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
        }
        if (partyResp && Array.isArray(partyResp.data)) {
          setParties(partyResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
        }
        if (salesResp && Array.isArray(salesResp.data)) {
          setSalesmenList(salesResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
        }
        if (prodResp && Array.isArray(prodResp.data)) {
          setProducts(prodResp.data.map((e: any) => ({ id: String(e.id), name: e.name })));
        }

        // finally fetch grouped sales entries
        await fetchSales();
      } catch (err) {
        console.error("Error loading lookup data via listEntities:", err);
        setNotification({ message: "Failed loading lookup data", type: "error" });
      } finally {
        if (mounted) setLoadingLookups(false);
      }
    };

    fetchLookupsAndSales();
    return () => { mounted = false; };

    fetchSales();
  }, [navigate]);

  const viewDetails = (entry: BoxSalesEntry) => setSelectedEntry(entry);
  const closeDetails = () => {
    setSelectedEntry(null);
    setViewFocusedIndex(-1);
  };

  const handleEdit = (entry: BoxSalesEntry) => {
    setEditingEntry(entry);
  };

  const closeEdit = () => {
    setEditingEntry(null);
  };

  const handleDelete = (entry: BoxSalesEntry) => {
    setDeletingEntry(entry);
  };

  const closeDelete = () => {
    setDeletingEntry(null);
  };

  const confirmDelete = async () => {
    if (!deletingEntry) return;
    try {
      await deleteBoxSaleRow(deletingEntry.id);
      // remove locally for instant feedback
      setSalesEntries(prev => prev.filter(e => e.id !== deletingEntry.id));
      setNotification({ message: 'Box sales entry deleted successfully!', type: 'success' });
      closeDelete();
      closeEdit();
    } catch (err: any) {
      console.error('Error deleting box sale entry:', err);
      const message = err?.response?.data?.message ?? 'Error deleting entry';
      setNotification({ message, type: 'error' });
    }
  };


  const handleSaveEdit = async (updatedEntry: BoxSalesEntry) => {
    try {
      // Build payload for patch: use fields in box_sale_list table
      // Note: backend PATCH accepts partial update; here we send representative fields.
      const payload: any = {
        date: updatedEntry.date,
        party_name: updatedEntry.party,
        salesman_name: updatedEntry.salesman,
        total_box: Number(updatedEntry.totalBox || 0),
        total_amount: Number(updatedEntry.totalAmount || 0),
        // You may store items JSON in the row; if so include items
        items: updatedEntry.items.map(it => ({
          customer: it.customer,
          box: Number(it.box || 0),
          box_type: it.box_type ? Number(it.box_type) : null,
          remark: it.remark ?? null,
        }))
        ,
        // optionally load_number/load_number_str if you want to change them
        load_number: updatedEntry.load_number,
        load_number_str: updatedEntry.load_number_string,
      };

      // id here is loadKey which we used as the id in fetchSales mapping
      const resp = await updateBoxSaleRow(updatedEntry.id, payload);

      // success -> re-fetch canonical data
      await fetchSales();
      setNotification({ message: 'Box sales entry updated successfully!', type: 'success' });
      closeEdit();
    } catch (err: any) {
      console.error('Error updating box sale entry:', err);
      const message = err?.response?.data?.message ?? 'Error updating entry';
      setNotification({ message, type: 'error' });
    }
  };


  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg border ${notification.type === 'success'
            ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
            : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
            }`}>
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Box Sales List</h1>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-4 text-sm text-gray-600 dark:text-gray-300 w-full lg:w-auto">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="whitespace-nowrap">Salesman:</label>
                <input
                  type="text"
                  value={selectedSalesman}
                  onChange={(e) => {
                    setSelectedSalesman(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  placeholder="Search salesman..."
                  className="flex-1 sm:flex-none min-w-0 sm:min-w-[120px] md:min-w-[150px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="whitespace-nowrap">Party:</label>
                <input
                  type="text"
                  value={selectedParty}
                  onChange={(e) => {
                    setSelectedParty(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  placeholder="Search party..."
                  className="flex-1 sm:flex-none min-w-0 sm:min-w-[120px] md:min-w-[150px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="whitespace-nowrap">From:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="whitespace-nowrap">To:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full sm:w-auto"
                />
              </div>
              <div className="flex items-center space-x-1 text-xs sm:text-sm">
                <FileText className="w-4 h-4" />
                <span>{filteredEntries.length} entries found</span>
              </div>

              {/* Pagination Info */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <span>Page {currentPage} of {totalPages}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Boxes - Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">

            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Boxes Added</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredEntries.reduce((sum, entry) => sum + (parseInt(entry.totalBox) || 0), 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total of Total Box column
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Boxes Sold</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {filteredEntries.reduce((sum, entry) => sum + entry.items.reduce((itemSum, item) => itemSum + (parseInt(item.box) || 0), 0), 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total boxes sold (from items)
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Current Balance</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {filteredEntries.reduce((sum, entry) => sum + (parseInt(entry.totalBox) || 0), 0) - filteredEntries.reduce((sum, entry) => sum + entry.items.reduce((itemSum, item) => itemSum + (parseInt(item.box) || 0), 0), 0)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Boxes available (Added - Sold)
              </div>
            </div>
          </div>

          {filteredEntries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">No sales entries found.</p>
              <button
                onClick={() => navigate('/fish-box-sent')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all"
              >
                Create First Entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Load No
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Date
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Party
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Total Box
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Balance
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                      Salesman
                    </th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.map((entry, index) => (
                    /* <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"> */
                    <tr
                      key={entry.id}
                      id={`sales-row-${index}`}
                      onClick={() => setFocusedIndex(index)}
                      className={`cursor-pointer transition-colors ${focusedIndex === index
                        ? 'bg-blue-200 dark:bg-blue-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800'
                        }`}
                    >
                      <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white truncate" title={entry.load_number_string || entry.id}>
                        {entry.load_number_string || entry.id}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white">
                        {new Date(entry.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white truncate" title={entry.party}>
                        {entry.party}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white">
                        {entry.totalBox}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white">
                        {entry.balance}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 dark:text-white hidden sm:table-cell" title={entry.salesman}>
                        {entry.salesman}
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-2 sm:py-3 text-center">
                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => viewDetails(entry)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors p-1 sm:p-0"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors p-1 sm:p-0"
                            title="Edit Entry"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={!!editingEntry}
        onClose={closeEdit}
        entry={editingEntry}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        parties={parties}
        salesmenList={salesmenList}
        products={products}
        customers={customers}
      />

      {/* Details Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-600">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Sales Entry Details
                </h2>
                <button
                  onClick={closeDetails}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(selectedEntry.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Party
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">{selectedEntry.party}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Box
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedEntry.totalBox}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Balance Boxes
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedEntry.balance}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Salesman
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedEntry.salesman}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700">
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                        Customer
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                        Box
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                        Box Type
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntry.items.map((item, idx) => {
                      console.log(selectedEntry);
                      return (
                        <tr
                          key={item.id}
                          id={`view-row-${idx}`}
                          onClick={() => setViewFocusedIndex(idx)}
                          className={`transition-colors ${viewFocusedIndex === idx
                            ? 'bg-blue-100 dark:bg-blue-900/40'
                            : 'bg-white dark:bg-gray-800'
                            }`}
                        >
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {item.customer}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {item.box}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {/* {item.box_type} */}
                            <td>
                              {/* {parties.find(p => p.id === String(item.box_type))?.name || ""} */}
                              {getPartyName(item.box_type)}

                            </td>


                            {/* {selectedEntry.party} */}
                          </td>
                          <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">
                            {selectedEntry.balance}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Box Sales Entry</h2>
              <button
                onClick={closeDelete}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Are you sure you want to delete this entry?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    This action cannot be undone. This will permanently delete the box sales entry for{' '}
                    <span className="font-medium">{deletingEntry.party}</span> on{' '}
                    <span className="font-medium">{new Date(deletingEntry.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</span>.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDelete}
                  className="px-4 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Entry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoxSalesList;






























