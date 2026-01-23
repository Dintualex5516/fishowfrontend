// import { Plus, Save, Trash2, Eye } from 'lucide-react';
// import React, { useEffect, useState, useCallback } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AdminBoard from '../../components/AdminBoard';
// import SearchableInput from '../../components/SearchableInput';
// import { listEntities } from '../../lib/entities';
// // adjust path if your file is elsewhere
// import {
//   createSale,
//   updateSale,
//   getLatestEntry,
//   getSaleByEntry,
// } from "../../lib/sales";


// interface SalesItem {
//   id: string;
//   customer: string;
//   box: string;
//   kg: string;
//   price: string;
//   total: string;
//   item: string;
//   remark: string;
// }

// interface PreviewModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   formData: {
//     date: string;
//     party: string;
//     totalBox: string;
//     entryNumber: string;
//     salesman: string;
//     items: SalesItem[];
//     totalAmount: string;
//   };
//   parties: { id: string; name: string }[];
//   salesmenList: { id: string; name: string }[];
//   customers: { id: string; name: string }[];
//   products: { id: string; name: string }[];
// }


// const PreviewModal: React.FC<PreviewModalProps> = ({
//   isOpen,
//   onClose,
//   formData,
//   parties,
//   salesmenList,
//   customers,
//   products,
// }) => {
//   if (!isOpen) return null;

//   const getEntityName = (id: string, entityList: { id: string; name: string }[]) => {
//     const entity = entityList.find(item => item.id === id);
//     return entity ? entity.name : id;
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
//           <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sales Form Preview</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
//           >
//             ×
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           {/* Header Information */}
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                 Date
//               </label>
//               <p className="text-gray-900 dark:text-white">
//                 {formData.date ? new Date(formData.date).toLocaleDateString('en-GB').replace(/\//g, '-') : '-'}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                 Party
//               </label>
//               <p className="text-gray-900 dark:text-white">
//                 {getEntityName(formData.party, parties)}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                 Total Box
//               </label>
//               <p className="text-gray-900 dark:text-white">{formData.totalBox || '0'}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                 Entry Number
//               </label>
//               <p className="text-gray-900 dark:text-white">{formData.entryNumber || '1'}</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
//                 Salesman
//               </label>
//               <p className="text-gray-900 dark:text-white">
//                 {getEntityName(formData.salesman, salesmenList)}
//               </p>
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
//                     Box
//                   </th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     KG
//                   </th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Price
//                   </th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Total
//                   </th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Item
//                   </th>
//                   <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
//                     Remark
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {formData.items.map((item) => (
//                   <tr key={item.id} className="bg-white dark:bg-gray-800">
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
//                       {getEntityName(item.customer, customers)}
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
//                       {item.box || '0'}
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
//                       {item.kg || '0.00'}
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
//                       ₹{item.price || '0.00'}
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
//                       ₹{item.total || '0.00'}
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
//                       {getEntityName(item.item, products)}
//                     </td>
//                     <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
//                       {item.remark || '-'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//               <tfoot>
//                 <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
//                   <td
//                     colSpan={6}
//                     className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-900 dark:text-white"
//                   >
//                     Total Amount:
//                   </td>
//                   <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
//                     ₹{formData.totalAmount}
//                   </td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         </div>

//         <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-600">
//           <button
//             onClick={onClose}
//             className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Try to resolve a value to an entity id (value might already be an id string or a name)
// function resolveEntityId(value: string | null | undefined, list: { id: string; name: string }[]): string | null {
//   if (!value) return null;
//   const asId = String(value).trim();

//   // If it exactly matches an id in list, return it
//   if (list.some(x => x.id === asId)) return asId;

//   // Otherwise try to match by name (case-insensitive)
//   const byName = list.find(x => x.name && x.name.toLowerCase() === asId.toLowerCase());
//   if (byName) return byName.id;

//   // Not found
//   return null;
// }


// const SalesEntryForm: React.FC = () => {
//   const navigate = useNavigate();
//   const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
//     []
//   );
//   const [parties, setParties] = useState<{ id: string; name: string }[]>([]);
//   const [salesmenList, setSalesmenList] = useState<
//     { id: string; name: string }[]
//   >([]);
//   const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
//   const [showPreview, setShowPreview] = useState(false);

//   // Autosave states
//   const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
//   const [lastAutosave, setLastAutosave] = useState<Date | null>(null);
//   const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
//   const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
//   const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

//   // Validation error states - only show red borders after save attempt
//   const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
//   const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

//   // Default values for new rows
//   const [defaultCustomer, setDefaultCustomer] = useState('');
//   const [defaultPrice, setDefaultPrice] = useState('');
//   const [defaultItem, setDefaultItem] = useState('');

//   // Initialize with current date in YYYY-MM-DD format
//   const getCurrentDate = () => {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const day = String(today.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   //   const mapItemsForServer = (items: SalesItem[]) => {
//   //   return items
//   //     .filter(it => it && (it.customer?.trim() || it.box || it.kg || it.price || it.item?.trim() || it.remark?.trim()))
//   //     .map(it => ({
//   //       customerName: it.customer || null,
//   //       productName: it.item || null,
//   //       box: it.box !== "" ? it.box : null,
//   //       kg: it.kg !== "" ? it.kg : null,
//   //       price: it.price !== "" ? it.price : null,
//   //       total: it.total !== "" ? it.total : null,
//   //       remark: it.remark || null,
//   //     }));
//   // };
//   const mapItemsForServer = (items: SalesItem[]) => {
//     return items
//       .filter(it => it && (it.customer?.trim() || it.box || it.kg || it.price || it.item?.trim() || it.remark?.trim()))
//       .map(it => {
//         const customerId = resolveEntityId(it.customer, customers);
//         const productId = resolveEntityId(it.item, products);

//         return {
//           // The backend expects these fields to be IDs (your backend code used customerName/productName as IDs)
//           customerName: customerId,      // string id or null
//           productName: productId,       // string id or null
//           box: it.box !== "" ? it.box : null,
//           kg: it.kg !== "" ? it.kg : null,
//           price: it.price !== "" ? it.price : null,
//           total: it.total !== "" ? it.total : null,
//           remark: it.remark || null,
//         };
//       });
//   };


//   const [date, setDate] = useState(getCurrentDate());
//   const [party, setParty] = useState('');
//   const [salesman, setSalesman] = useState('');
//   const [manualTotalBox, setManualTotalBox] = useState('');
//   const [entryNumber, setEntryNumber] = useState('');
//   const [items, setItems] = useState<SalesItem[]>([
//     {
//       id: '1',
//       customer: '',
//       box: '',
//       kg: '',
//       price: '',
//       total: '',
//       item: '',
//       remark: '',
//     },
//   ]);

//   // localStorage key for header values
//   const HEADER_STORAGE_KEY = 'salesFormHeaderValues';

//   // Save header values to localStorage
//   const saveHeaderValues = useCallback(() => {
//     const headerData = {
//       party,
//       salesman,
//       manualTotalBox,
//       // Don't save entryNumber - it should be dynamic based on form data
//       lastSaved: new Date().toISOString(),
//     };
//     try {
//       localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(headerData));
//       console.log('Header values saved to localStorage:', headerData);
//     } catch (err) {
//       console.error('Error saving header values to localStorage:', err);
//     }
//   }, [party, salesman, manualTotalBox]);

//   // Load header values from localStorage
//   const loadHeaderValues = useCallback(() => {
//     try {
//       const savedData = localStorage.getItem(HEADER_STORAGE_KEY);
//       if (savedData) {
//         const parsedData = JSON.parse(savedData);
//         console.log('Loading header values from localStorage:', parsedData);
//         if (parsedData.party) setParty(parsedData.party);
//         if (parsedData.salesman) setSalesman(parsedData.salesman);
//         if (parsedData.manualTotalBox) setManualTotalBox(parsedData.manualTotalBox);
//         if (parsedData.entryNumber) setEntryNumber(parsedData.entryNumber);
//       }
//     } catch (err) {
//       console.error('Error loading header values from localStorage:', err);
//     }
//   }, []);

//   useEffect(() => {
//     const isAuthenticated = localStorage.getItem('isAuthenticated');
//     if (!isAuthenticated) {
//       navigate('/login');
//     }
//   }, [navigate]);


//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         // Fetch a reasonably large first page for selects/autocomplete fallback
//         const pageSize = 200;

//         const [custResp, partyResp, salesResp, prodResp] = await Promise.all([
//           listEntities('customers', { page: 1, pageSize }),
//           listEntities('parties', { page: 1, pageSize }),
//           listEntities('salesmen', { page: 1, pageSize }),
//           listEntities('products', { page: 1, pageSize }),
//         ]);

//         // listEntities returns { data, totalCount, page, pageSize }
//         if (custResp && Array.isArray(custResp.data)) {
//           setCustomers(custResp.data.map(e => ({ ...e, id: String(e.id) })));
//         }
//         if (partyResp && Array.isArray(partyResp.data)) {
//           setParties(partyResp.data.map(e => ({ ...e, id: String(e.id) })));
//         }
//         if (salesResp && Array.isArray(salesResp.data)) {
//           setSalesmenList(salesResp.data.map(e => ({ ...e, id: String(e.id) })));
//         }
//         if (prodResp && Array.isArray(prodResp.data)) {
//           setProducts(prodResp.data.map(e => ({ ...e, id: String(e.id) })));
//         }

//       } catch (err) {
//         console.error('Error loading entity lists', err);
//         // Optional: show notification
//         setNotification({ message: 'Failed loading lookup data', type: 'error' });
//       }
//     };

//     fetchData();
//   }, []);
//   // Load header values on component mount
//   useEffect(() => {
//     loadHeaderValues();
//   }, [loadHeaderValues]);

//   // Save header values when they change
//   useEffect(() => {
//     if (party || salesman || manualTotalBox) {
//       saveHeaderValues();
//     }
//   }, [party, salesman, manualTotalBox, saveHeaderValues]);

//   // Add F2 key event listener
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'F2') {
//         e.preventDefault();
//         handlePreview();
//       }
//     };

//     document.addEventListener('keydown', handleKeyDown);
//     return () => document.removeEventListener('keydown', handleKeyDown);
//   }, []);

//   // Reset autosave status after 3 seconds of being saved
//   useEffect(() => {
//     if (autosaveStatus === 'saved') {
//       const timeout = setTimeout(() => {
//         setAutosaveStatus('idle');
//       }, 3000);
//       return () => clearTimeout(timeout);
//     }
//   }, [autosaveStatus]);

//   const addItem = () => {
//     const newItem: SalesItem = {
//       id: crypto.randomUUID(), // optional temporary UUID for React
//       customer: '',
//       box: '',
//       kg: '',
//       price: defaultPrice,
//       total: '',
//       item: defaultItem,
//       remark: '',
//     };
//     setItems([newItem, ...items]);
//     return newItem.id;
//   };

//   const removeItem = (id: string) => {
//     if (items.length > 1) {
//       setItems(items.filter((item) => item.id !== id));
//     }
//   };

//   const updateItem = (id: string, field: keyof SalesItem, value: string) => {
//     try {
//       setItems(
//         items.map((item) => {
//           if (item.id === id) {
//             const updatedItem = { ...item, [field]: value };

//             // Update defaults when customer, price or item is changed
//             if (field === 'customer') {
//               setDefaultCustomer(value);
//             }
//             if (field === 'price') {
//               setDefaultPrice(value);
//             }
//             if (field === 'item') {
//               setDefaultItem(value);
//             }

//             // Auto-calculate total when box, kg, or price changes
//             if (field === 'box' || field === 'kg' || field === 'price') {
//               const box =
//                 parseFloat(field === 'box' ? value : updatedItem.box) || 0;
//               const kg = parseFloat(field === 'kg' ? value : updatedItem.kg) || 0;
//               const price =
//                 parseFloat(field === 'price' ? value : updatedItem.price) || 0;

//               // Use KG if available, otherwise use Box
//               const quantity = kg > 0 ? kg : box;
//               updatedItem.total = (price * quantity).toFixed(2);
//             }

//             return updatedItem;
//           }
//           return item;
//         })
//       );
//     } catch (error) {
//       console.error('Error updating item:', error);
//     }
//   };

//   const handleCustomerSelect = (itemId: string, customer: { id: string; name: string }) => {
//     try {
//       updateItem(itemId, 'customer', customer.id);
//       // You can add logic here to pre-fill customer-specific data if needed
//     } catch (error) {
//       console.error('Error selecting customer:', error);
//     }
//   };

//   const handleItemSelect = (itemId: string, product: { id: string; name: string }) => {
//     try {
//       updateItem(itemId, 'item', product.id);
//       // You can add logic here to pre-fill product-specific data if needed
//     } catch (error) {
//       console.error('Error selecting item:', error);
//     }
//   };

//   const handlePartySelect = (party: { id: string; name: string }) => {
//     try {
//       setParty(party.id);
//       // You can add logic here to pre-fill party-specific data if needed
//     } catch (error) {
//       console.error('Error selecting party:', error);
//     }
//   };

//   const handleSalesmanSelect = (salesman: { id: string; name: string }) => {
//     try {
//       setSalesman(salesman.id);
//       // You can add logic here to pre-fill salesman-specific data if needed
//     } catch (error) {
//       console.error('Error selecting salesman:', error);
//     }
//   };

//   const calculateTotal = () => {
//     return items
//       .reduce((total, item) => {
//         return total + (parseFloat(item.total) || 0);
//       }, 0)
//       .toFixed(2);
//   };

//   const calculateTotalBoxes = () => {
//     return items.reduce((total, item) => {
//       return total + (parseFloat(item.box) || 0);
//     }, 0);
//   };

//   // Get the calculated total boxes value
//   const totalBoxesValue = calculateTotalBoxes();


//   // Replace your current fetchAndLoadLastEntry useCallback with this:
//   const fetchAndLoadLastEntry = useCallback(async () => {
//     // require header fields
//     if (!date || !party || !salesman || !manualTotalBox ||
//       party.trim() === "" || salesman.trim() === "" || manualTotalBox.trim() === "") {
//       setEntryNumber("");
//       const newItem: SalesItem = {
//         id: crypto.randomUUID(),
//         customer: "",
//         box: "",
//         kg: "",
//         price: "",
//         total: "",
//         item: "",
//         remark: "",
//       };
//       setItems([newItem]);
//       return;
//     }

//     try {
//       const resp = await getLatestEntry({
//         date,
//         partyName: party,
//         salesmanName: salesman,
//         totalBox: manualTotalBox,
//       });

//       console.log(resp);


//       if (resp && resp.sale) {
//         const lastEntry = resp.sale;
//         setEntryNumber(String(lastEntry.entry_number || 1));
//         setCurrentEntryId(lastEntry.id || null);

//         if (Array.isArray(resp.items) && resp.items.length > 0) {
//           setItems(resp.items.map((it: any, idx: number) => ({
//             id: it.id ? String(it.id) : `${idx + 1}`,
//             customer: it.customer_name || "",
//             box: it.box != null ? String(it.box) : "",
//             kg: it.kg != null ? String(it.kg) : "",
//             price: it.price != null ? String(it.price) : "",
//             total: it.total != null ? String(it.total) : "",
//             item: it.product_name || "",
//             remark: it.remark || "",
//           })));
//           setNotification({ message: `Loaded entry ${lastEntry.entry_number}`, type: "success" });

//           // Add one empty row at top (use defaults but DO NOT include them as deps)
//           setTimeout(() => {
//             const newItem: SalesItem = {
//               id: crypto.randomUUID(),
//               customer: "",
//               box: "",
//               kg: "",
//               price: defaultPrice,
//               total: "",
//               item: defaultItem,
//               remark: "",
//             };
//             setItems(prev => [newItem, ...prev]);
//           }, 100);
//         } else {
//           setItems([{
//             id: crypto.randomUUID(),
//             customer: "",
//             box: "",
//             kg: "",
//             price: "",
//             total: "",
//             item: "",
//             remark: "",
//           }]);
//         }
//       } else {
//         setEntryNumber("1");
//         setCurrentEntryId(null);
//         setItems([{
//           id: crypto.randomUUID(),
//           customer: "",
//           box: "",
//           kg: "",
//           price: "",
//           total: "",
//           item: "",
//           remark: "",
//         }]);
//       }
//     } catch (err: any) {
//       console.error("fetchAndLoadLastEntry error", err);
//       setEntryNumber("1");
//       setCurrentEntryId(null);
//       setItems([{
//         id: crypto.randomUUID(),
//         customer: "",
//         box: "",
//         kg: "",
//         price: "",
//         total: "",
//         item: "",
//         remark: "",
//       }]);
//     }
//   }, [date, party, salesman, manualTotalBox]); // <- IMPORTANT: no defaultCustomer/defaultPrice/defaultItem here


//   // Replace current loadEntryData useCallback with this:
//   const loadEntryData = useCallback(async (entryNum: string) => {
//     if (!date || !party || !salesman || !manualTotalBox || !entryNum) {
//       setItems([{
//         id: crypto.randomUUID(),
//         customer: "",
//         box: "",
//         kg: "",
//         price: "",
//         total: "",
//         item: "",
//         remark: "",
//       }]);
//       return;
//     }

//     try {
//       const resp = await getSaleByEntry({
//         date,
//         partyName: party,
//         salesmanName: salesman,
//         totalBox: manualTotalBox,
//         entryNumber: entryNum,
//       });

//       if (resp && resp.sale) {
//         setCurrentEntryId(resp.sale.id || null);
//         setItems(resp.items.map((it: any, idx: number) => ({
//           id: it.id ? String(it.id) : `${idx + 1}`,
//           customer: it.customer_name || "",
//           box: it.box != null ? String(it.box) : "",
//           kg: it.kg != null ? String(it.kg) : "",
//           price: it.price != null ? String(it.price) : "",
//           total: it.total != null ? String(it.total) : "",
//           item: it.product_name || "",
//           remark: it.remark || "",
//         })));
//         setNotification({ message: `Loaded entry ${entryNum}`, type: "success" });

//         setTimeout(() => {
//           const newItem: SalesItem = {
//             id: crypto.randomUUID(),
//             customer: "",
//             box: "",
//             kg: "",
//             price: defaultPrice,
//             total: "",
//             item: defaultItem,
//             remark: "",
//           };
//           setItems(prev => [newItem, ...prev]);
//         }, 100);
//       } else {
//         setCurrentEntryId(null);
//         setItems([{
//           id: crypto.randomUUID(),
//           customer: "",
//           box: "",
//           kg: "",
//           price: "",
//           total: "",
//           item: "",
//           remark: "",
//         }]);
//         console.log("No existing entry found for entry number, cleared items");
//       }
//     } catch (err: any) {
//       console.error("loadEntryData error", err);
//       setCurrentEntryId(null);
//       setItems([{
//         id: crypto.randomUUID(),
//         customer: "",
//         box: "",
//         kg: "",
//         price: "",
//         total: "",
//         item: "",
//         remark: "",
//       }]);
//     }
//   }, [date, party, salesman, manualTotalBox]); // <- IMPORTANT: no defaults here either



//   // Effect to fetch and load last entry when header fields change
//   useEffect(() => {
//     console.log('🔄 Header fields changed:', { date, party, salesman, manualTotalBox });

//     // Only fetch if we have all required fields filled and they are not empty strings
//     if (date && party && salesman && manualTotalBox &&
//       party.trim() !== '' && salesman.trim() !== '' && manualTotalBox.trim() !== '') {
//       console.log('🔄 All fields filled, calling fetchAndLoadLastEntry');
//       fetchAndLoadLastEntry();
//     } else {
//       console.log('🔄 Fields not complete, clearing form');
//       // Clear entry number and items if not all fields are properly filled
//       setEntryNumber('');
//       const newItem: SalesItem = {
//         id: crypto.randomUUID(),
//         customer: '',
//         box: '',
//         kg: '',
//         price: '',
//         total: '',
//         item: '',
//         remark: '',
//       };
//       setItems([newItem]);
//     }
//   }, [fetchAndLoadLastEntry, date, party, salesman, manualTotalBox]);

//   // Effect to load data when entryNumber changes to an existing value
//   useEffect(() => {
//     if (!entryNumber || parseInt(entryNumber) <= 0) return;

//     const timer = setTimeout(() => {
//       loadEntryData(entryNumber);
//     }, 500); // Delay for stability
//     return () => clearTimeout(timer);
//   }, [entryNumber, loadEntryData]);

//   const handlePreview = () => {
//     setShowPreview(true);
//   };

//   const fieldOrder: (keyof SalesItem)[] = [
//     'customer',
//     'box',
//     'kg',
//     'price',
//     'item',
//     'remark',
//   ];

//   const headerFieldOrder = ['date', 'party', 'totalBox', 'salesman', 'entryNumber'];

//   const handleHeaderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       // Find the wrapper div with data-field
//       const wrapper = (e.target as HTMLElement).closest('[data-field]');
//       const currentField = wrapper?.getAttribute('data-field');
//       if (!currentField) return;

//       const currentIndex = headerFieldOrder.indexOf(currentField);
//       if (currentIndex === -1) return;

//       const nextField = headerFieldOrder[currentIndex + 1];

//       if (currentField === 'salesman' || !nextField) {
//         // Skip entryNumber and move to first item row's customer field
//         if (items.length > 0) {
//           // Try searching in wrapper divs first (for SearchableInput)
//           const firstWrapperInput = document.querySelector<HTMLInputElement>(
//             `[data-item-id="${items[0].id}"][data-field="customer"] input`
//           );
//           if (firstWrapperInput) {
//             firstWrapperInput.focus();
//           } else {
//             // Fallback to regular input
//             const firstInput = document.querySelector<HTMLInputElement>(
//               `input[data-item-id="${items[0].id}"][data-field="customer"]`
//             );
//             firstInput?.focus();
//           }
//         }
//         return;
//       }

//       // Try searching in wrapper divs first (for SearchableInput fields like party)
//       let nextInput = document.querySelector<HTMLInputElement>(
//         `[data-field="${nextField}"] input`
//       );
//       if (nextInput) {
//         nextInput.focus();
//       } else {
//         // Fallback to regular input (for fields like date, totalBox)
//         nextInput = document.querySelector<HTMLInputElement>(
//           `input[data-field="${nextField}"]`
//         );
//         nextInput?.focus();
//       }
//     }
//   };

//   const handleEntryNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newEntryNumber = e.target.value;
//     setEntryNumber(newEntryNumber);

//     // Load entry data when user manually changes entry number
//     if (newEntryNumber && date && party && salesman && manualTotalBox) {
//       loadEntryData(newEntryNumber);
//     } else {
//       // Clear items if entry number is cleared or required fields are missing
//       const newItem: SalesItem = {
//         id: crypto.randomUUID(),
//         customer: '',
//         box: '',
//         kg: '',
//         price: '',
//         total: '',
//         item: '',
//         remark: '',
//       };
//       setItems([newItem]);
//     }
//   };

//   const handleKeyDown = (
//     e: React.KeyboardEvent<HTMLInputElement>,
//     itemId: string
//   ) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();

//       // Find the data-field from the input or its wrapper
//       let currentField = (e.target as HTMLInputElement).dataset.field;
//       if (!currentField) {
//         const wrapper = (e.target as HTMLElement).closest('[data-field]');
//         currentField = wrapper?.getAttribute('data-field') || '';
//       }

//       if (!currentField) return;

//       const currentIndex = fieldOrder.indexOf(currentField as keyof SalesItem);
//       if (currentIndex === -1) return;

//       let nextField: keyof SalesItem | undefined;
//       if (currentField === 'box') {
//         // Skip KG after Box, go to price
//         nextField = 'price';
//       } else {
//         nextField = fieldOrder[currentIndex + 1];
//       }

//       if (nextField) {
//         // Move to next field in same row
//         // Try searching in wrapper divs first (for SearchableInput)
//         const nextWrapperInput = document.querySelector<HTMLInputElement>(
//           `[data-item-id="${itemId}"][data-field="${nextField}"] input`
//         );
//         if (nextWrapperInput) {
//           nextWrapperInput.focus();
//         } else {
//           // Fallback to regular input
//           const nextInput = document.querySelector<HTMLInputElement>(
//             `input[data-item-id="${itemId}"][data-field="${nextField}"]`
//           );
//           nextInput?.focus();
//         }
//       } else {
//         // End of row - always create new row when pressing Enter on remark
//         if (!e.shiftKey) {
//           // Add new row and focus on its first field
//           const newId = addItem();
//           setTimeout(() => {
//             // Try searching in wrapper divs first (for SearchableInput)
//             const firstWrapperInput = document.querySelector<HTMLInputElement>(
//               `[data-item-id="${newId}"][data-field="customer"] input`
//             );
//             if (firstWrapperInput) {
//               firstWrapperInput.focus();
//             } else {
//               // Fallback to regular input
//               const firstInput = document.querySelector<HTMLInputElement>(
//                 `input[data-item-id="${newId}"][data-field="customer"]`
//               );
//               firstInput?.focus();
//             }
//           }, 0);
//         }
//       }
//     }
//   };

//   // Autosave function - saves to localStorage
//   const handleAutosave = useCallback(() => {
//     console.log('Starting autosave with data:', {
//       date,
//       party,
//       salesman,
//       entryNumber,
//       totalBoxes: totalBoxesValue,
//       itemsCount: items.length
//     });

//     const salesData = {
//       date,
//       party,
//       totalBox: manualTotalBox,
//       entryNumber,
//       salesman,
//       items,
//       lastAutosave: new Date().toISOString(),
//     };

//     try {
//       localStorage.setItem('salesFormDraft', JSON.stringify(salesData));
//       setAutosaveStatus('saved');
//       setLastAutosave(new Date());
//       console.log('Autosave completed successfully');
//     } catch (err) {
//       console.error('Autosave failed:', err);
//       setAutosaveStatus('error');
//     }
//   }, [party, salesman, entryNumber, items, date, totalBoxesValue, manualTotalBox]);

//   // Autosave effect - save immediately when any field is filled
//   useEffect(() => {
//     const hasAnyFilledField = party?.trim() ||
//       salesman?.trim() ||
//       manualTotalBox?.trim() ||
//       items.some(item => item.customer?.trim() || item.box || item.kg || item.price || item.item?.trim() || item.remark?.trim());

//     console.log('Autosave effect check:', {
//       hasAnyFilledField,
//       date,
//       party: party?.trim(),
//       salesman: salesman?.trim(),
//       manualTotalBox: manualTotalBox?.trim(),
//       itemsWithData: items.filter(item => item.customer?.trim() || item.box || item.kg || item.price || item.item?.trim() || item.remark?.trim()).length
//     });

//     if (!hasAnyFilledField) {
//       console.log('No filled fields, skipping autosave');
//       setAutosaveStatus('idle');
//       return;
//     }

//     console.log('Autosave conditions met, saving immediately');
//     handleAutosave();
//   }, [party, salesman, items, date, manualTotalBox, handleAutosave]);

//   // Load any existing draft from localStorage on component mount
//   useEffect(() => {
//     const loadDraft = () => {
//       try {
//         const draftData = localStorage.getItem('salesFormDraft');
//         if (draftData) {
//           const parsedData = JSON.parse(draftData);
//           console.log('Loading draft from localStorage:', parsedData);

//           // Only load draft if it has meaningful data (not empty post-save state)
//           const hasMeaningfulData = parsedData.party?.trim() ||
//             parsedData.salesman?.trim() ||
//             parsedData.totalBox?.trim() ||
//             (parsedData.items && parsedData.items.some((item: any) =>
//               item.customer?.trim() || item.box || item.kg || item.price || item.item?.trim() || item.remark?.trim()
//             ));

//           if (hasMeaningfulData) {
//             setDate(parsedData.date || getCurrentDate());
//             setParty(parsedData.party || '');
//             setSalesman(parsedData.salesman || '');
//             setManualTotalBox(parsedData.totalBox || '');
//             // Don't restore entry number from localStorage - it should be dynamic based on form data
//             setItems(parsedData.items || items);
//             // Set defaults from first item if available
//             if (parsedData.items && parsedData.items.length > 0) {
//               setDefaultCustomer(parsedData.items[0].customer || '');
//               setDefaultPrice(parsedData.items[0].price || '');
//               setDefaultItem(parsedData.items[0].item || '');
//             }
//             setLastAutosave(new Date(parsedData.lastAutosave));
//             setAutosaveStatus('idle');
//             console.log('Draft loaded with meaningful data');
//           } else {
//             console.log('Draft data appears to be empty post-save state, skipping load');
//             // Clear the empty draft data
//             localStorage.removeItem('salesFormDraft');
//           }
//         }
//       } catch (err) {
//         console.error('Error loading draft from localStorage:', err);
//       }
//     };

//     loadDraft();
//   }, []);

//   const handleSave = async () => {
//     console.log("💾 Save button clicked with data:", {
//       date,
//       party,
//       salesman,
//       manualTotalBox,
//       entryNumber,
//       itemsCount: items.length,
//     });

//     setHasAttemptedSave(true);

//     // Validation (same as before)
//     const fieldErrors: { [key: string]: boolean } = {};
//     if (!party?.trim()) fieldErrors["party"] = true;
//     if (!salesman?.trim()) fieldErrors["salesman"] = true;
//     if (!manualTotalBox?.trim()) fieldErrors["totalBox"] = true;
//     if (!items || items.length === 0) fieldErrors["items"] = true;
//     else {
//       items.forEach((item, index) => {
//         if (!item.customer?.trim()) fieldErrors[`item-${index}-customer`] = true;
//         const hasBox = item.box && item.box.trim() !== "";
//         const hasKg = item.kg && item.kg.trim() !== "";
//         if (!hasBox && !hasKg) fieldErrors[`item-${index}-boxorkg`] = true;
//         if (!item.price || item.price.trim() === "") fieldErrors[`item-${index}-price`] = true;
//       });
//     }

//     setValidationErrors(fieldErrors);

//     if (Object.keys(fieldErrors).length > 0) {
//       setNotification({ message: "Please enter all mandatory fields", type: "error" });
//       return;
//     }

//     // Prepare payload
//     const payload = {
//       date,
//       partyName: party,
//       salesmanName: salesman,
//       totalBox: manualTotalBox != null ? Number(manualTotalBox) : 0,
//       entryNumber: entryNumber ? Number(entryNumber) : 1,
//       totalAmount: calculateTotal(),
//       items: mapItemsForServer(items),
//     };

//     try {
//       console.log("Starting save operation with payload:", payload);

//       if (currentEntryId) {
//         // update existing
//         await updateSale(currentEntryId, payload);
//         setNotification({ message: `Sales entry ${entryNumber} updated successfully!`, type: "success" });
//       } else {
//         // create new
//         const resp = await createSale(payload);
//         // resp should contain id and possibly load number string
//         const newId = resp?.id;
//         setCurrentEntryId(newId || null);
//         // Ensure entryNumber is set (server uses provided entryNumber; your router returns load_number_str only)
//         setEntryNumber(String(payload.entryNumber || 1));
//         setNotification({ message: `Sales entry ${payload.entryNumber} saved successfully!`, type: "success" });
//       }

//       // Clear validation and reset form similar to your previous behaviour
//       setValidationErrors({});
//       setHasAttemptedSave(false);

//       // Reset date to today
//       setDate(getCurrentDate());
//       setParty("");
//       setSalesman("");
//       setManualTotalBox("");
//       setDefaultCustomer("");
//       setDefaultPrice("");
//       setDefaultItem("");

//       const newItem: SalesItem = {
//         id: crypto.randomUUID(),
//         customer: "",
//         box: "",
//         kg: "",
//         price: "",
//         total: "",
//         item: "",
//         remark: "",
//       };
//       setItems([newItem]);

//       // Clear autosave data
//       setCurrentDraftId(null);
//       setCurrentEntryId(null);
//       setAutosaveStatus("idle");
//       setLastAutosave(null);
//       localStorage.removeItem("salesFormDraft");
//       localStorage.removeItem("salesFormHeaderValues");
//     } catch (err: any) {
//       console.error("Save operation failed:", err);

//       // Handle common API errors
//       const status = err?.response?.status;
//       const data = err?.response?.data;
//       if (status === 409) {
//         setNotification({ message: data?.message || "Duplicate entry", type: "error" });
//       } else {
//         const msg = (data && data.message) ? data.message : (err.message || "Failed to save");
//         setNotification({ message: `Error saving sales entry: ${msg}`, type: "error" });
//       }
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
//     <>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
//         <AdminBoard />

//         {/* Notification Toast */}
//         {notification && (
//           <div className="fixed top-4 right-4 z-50">
//             <div className={`px-4 py-3 rounded-lg shadow-lg border ${notification.type === 'success'
//               ? 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
//               : 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
//               }`}>
//               <div className="flex items-center space-x-2">
//                 {notification.type === 'success' ? (
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 ) : (
//                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                   </svg>
//                 )}
//                 <span className="font-medium">{notification.message}</span>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 min-h-[600px] flex flex-col">
//             <div className="flex justify-between items-center mb-6 flex-shrink-0">
//               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Sales</h1>

//               {/* Autosave Status Indicator */}
//               <div className="flex items-center space-x-2 text-sm">
//                 {autosaveStatus === 'saved' && (
//                   <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
//                     <div className="w-2 h-2 bg-green-600 rounded-full"></div>
//                     <span>
//                       Auto-saved {lastAutosave && `at ${lastAutosave.toLocaleTimeString()}`}
//                     </span>
//                   </div>
//                 )}
//                 {autosaveStatus === 'error' && (
//                   <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
//                     <div className="w-2 h-2 bg-red-600 rounded-full"></div>
//                     <span>Save failed</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Fixed Header Fields */}
//             <div className="flex-shrink-0">
//               {/* Header Information */}
//               <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                     Date
//                   </label>
//                   <input
//                     type="date"
//                     value={date}
//                     onChange={(e) => setDate(e.target.value)}
//                     onKeyDown={handleHeaderKeyDown}
//                     data-field="date"
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${hasAttemptedSave && validationErrors['party']
//                       ? 'border-red-500 dark:border-red-400'
//                       : 'border-gray-300 dark:border-gray-600'
//                       }`}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                     Party <span className="text-red-500">*</span>
//                   </label>

//                   <SearchableInput
//                     value={party}
//                     onChange={setParty}
//                     placeholder="Search party..."
//                     searchData={parties}
//                     onSelect={handlePartySelect}
//                     onKeyDown={handleHeaderKeyDown}
//                     createRoute="/create-party"
//                     entityType="party"
//                     data-field="party"
//                     className={hasAttemptedSave && validationErrors['party'] ? 'border-red-500 dark:border-red-400' : ''}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                     Total Box <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     value={manualTotalBox}
//                     onChange={(e) => setManualTotalBox(e.target.value)}
//                     onKeyDown={handleHeaderKeyDown}
//                     data-field="totalBox"
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${hasAttemptedSave && validationErrors['totalBox']
//                       ? 'border-red-500 dark:border-red-400'
//                       : 'border-gray-300 dark:border-gray-600'
//                       }`}
//                     placeholder="0"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                     Salesman <span className="text-red-500">*</span>
//                   </label>
//                   <SearchableInput
//                     value={salesman}
//                     onChange={setSalesman}
//                     placeholder="Search salesman..."
//                     searchData={salesmenList}
//                     onSelect={handleSalesmanSelect}
//                     onKeyDown={handleHeaderKeyDown}
//                     createRoute="/create-salesman"
//                     entityType="salesman"
//                     data-field="salesman"
//                     className={hasAttemptedSave && validationErrors['salesman'] ? 'border-red-500 dark:border-red-400' : ''}
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                     Entry Number
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="number"
//                       min="1"
//                       value={entryNumber}
//                       onChange={handleEntryNumberChange}
//                       onKeyDown={handleHeaderKeyDown}
//                       data-field="entryNumber"
//                       disabled={!date || !party || !salesman || !manualTotalBox}
//                       className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${(!date || !party || !salesman || !manualTotalBox)
//                         ? 'border-gray-200 dark:border-gray-500 bg-gray-50 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
//                         : 'border-gray-300 dark:border-gray-600'
//                         }`}
//                       placeholder="0"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => {
//                         const currentValue = parseInt(entryNumber) || 0;
//                         const newValue = currentValue + 1;
//                         setEntryNumber(newValue.toString());
//                         // Load entry data when user manually changes entry number
//                         if (newValue > 0 && date && party && salesman && manualTotalBox) {
//                           loadEntryData(newValue.toString());
//                         }
//                       }}
//                       disabled={!date || !party || !salesman || !manualTotalBox}
//                       className="absolute right-4 top-1/2 transform -translate-y-1/2 px-1 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed rounded text-sm"
//                       title="Increase entry number"
//                     >
//                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Total Amount Section - Moved between header and table */}
//             <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 border-t border-b border-gray-200 dark:border-gray-600 my-2">
//               <div className="px-4 py-3">
//                 <div className="flex justify-end items-center space-x-4 sm:space-x-8">
//                   <div className="flex items-center">
//                     <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">
//                       Grand Total Box:
//                     </span>
//                     <span className="text-lg font-bold text-gray-900 dark:text-white">
//                       {calculateTotalBoxes()}
//                     </span>
//                   </div>
//                   <div className="flex items-center">
//                     <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">
//                       Total Amount:
//                     </span>
//                     <span className="text-lg font-bold text-gray-900 dark:text-white">
//                       ₹{calculateTotal()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Scrollable Table Area */}
//             <div className="flex-1 overflow-y-auto mt-2">
//               {/* Items Table */}
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
//                   <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
//                     <tr>
//                       <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[150px] sm:min-w-[220px]">
//                         Customer <span className="text-red-500">*</span>
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Box <span className="text-red-500">*</span>
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
//                         KG
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Price <span className="text-red-500">*</span>
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Total
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[150px] sm:min-w-[220px]">
//                         Item
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Remark
//                       </th>
//                       <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
//                         Action
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {items.map((item) => (
//                       <tr key={item.id} className="bg-white dark:bg-gray-800">
//                         <td className="border border-gray-300 dark:border-gray-600 p-2 min-w-[150px] sm:min-w-[220px]">
//                           <SearchableInput
//                             value={item.customer}
//                             onChange={(value) => updateItem(item.id, 'customer', value)}
//                             placeholder="Search customer..."
//                             searchData={customers}
//                             onSelect={(customer) => handleCustomerSelect(item.id, customer)}
//                             onKeyDown={(e) => handleKeyDown(e, item.id)}
//                             createRoute="/create-customer"
//                             entityType="customer"
//                             className={`w-full ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-customer`]
//                               ? 'border-red-500 dark:border-red-400'
//                               : ''
//                               }`}
//                             data-field="customer"
//                             data-item-id={item.id}
//                           />
//                         </td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-2">
//                           <input
//                             type="number"
//                             step="1"
//                             value={item.box}
//                             onChange={(e) =>
//                               updateItem(item.id, 'box', e.target.value)
//                             }
//                             onKeyDown={(e) => handleKeyDown(e, item.id)}
//                             data-item-id={item.id}
//                             data-field="box"
//                             className={`w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-boxorkg`]
//                               ? 'border-red-500 dark:border-red-400 rounded'
//                               : ''
//                               }`}
//                             placeholder="0"
//                           />
//                         </td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-2">
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={item.kg}
//                             onChange={(e) =>
//                               updateItem(item.id, 'kg', e.target.value)
//                             }
//                             onKeyDown={(e) => handleKeyDown(e, item.id)}
//                             data-item-id={item.id}
//                             data-field="kg"
//                             className={`w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-boxorkg`]
//                               ? 'border-red-500 dark:border-red-400 rounded'
//                               : ''
//                               }`}
//                             placeholder="0.00"
//                           />
//                         </td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-2">
//                           <input
//                             type="number"
//                             step="0.01"
//                             value={item.price}
//                             onChange={(e) =>
//                               updateItem(item.id, 'price', e.target.value)
//                             }
//                             onKeyDown={(e) => handleKeyDown(e, item.id)}
//                             data-item-id={item.id}
//                             data-field="price"
//                             className={`w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-price`]
//                               ? 'border-red-500 dark:border-red-400 rounded'
//                               : ''
//                               }`}
//                             placeholder="0.00"
//                           />
//                         </td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-2">
//                           <input
//                             type="text"
//                             value={item.total}
//                             readOnly
//                             className="w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
//                             placeholder="0.00"
//                           />
//                         </td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-2 min-w-[150px] sm:min-w-[220px]">
//                           <SearchableInput
//                             value={item.item}
//                             onChange={(value) => updateItem(item.id, 'item', value)}
//                             placeholder="Search item..."
//                             searchData={products}
//                             onSelect={(product) => handleItemSelect(item.id, product)}
//                             onKeyDown={(e) => handleKeyDown(e, item.id)}
//                             createRoute="/create-item"
//                             entityType="item"
//                             className={`w-full ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-price`]
//                               ? 'border-red-500 dark:border-red-400'
//                               : ''
//                               }`}
//                             data-field="item"
//                             data-item-id={item.id}
//                           />
//                         </td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-2">
//                           <input
//                             type="text"
//                             value={item.remark}
//                             onChange={(e) =>
//                               updateItem(item.id, 'remark', e.target.value)
//                             }
//                             onKeyDown={(e) => handleKeyDown(e, item.id)}
//                             data-item-id={item.id}
//                             data-field="remark"
//                             className="w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                             placeholder="Remark"
//                           />
//                         </td>
//                         <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
//                           <button
//                             onClick={() => removeItem(item.id)}
//                             disabled={items.length === 1}
//                             className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Fixed Bottom Action Buttons */}
//             <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 mt-4 gap-4 sm:gap-0">
//               <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
//                 <button
//                   onClick={addItem}
//                   className="flex items-center justify-center space-x-2 px-6 py-3 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-all shadow-md hover:shadow-lg text-base sm:text-sm"
//                 >
//                   <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
//                   <span>Add Row</span>
//                 </button>

//                 <button
//                   onClick={handlePreview}
//                   className="flex items-center justify-center space-x-2 px-6 py-3 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-500 transition-all shadow-md hover:shadow-lg text-base sm:text-sm"
//                 >
//                   <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
//                   <span>Preview/F2</span>
//                 </button>
//               </div>

//               <button
//                 onClick={handleSave}
//                 className="flex items-center justify-center space-x-2 px-8 py-3 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-md hover:shadow-lg text-base sm:text-sm font-semibold"
//               >
//                 <Save className="w-5 h-5 sm:w-4 sm:h-4" />
//                 <span>Save Entry</span>
//               </button>
//             </div>


//           </div>
//         </div>
//       </div>

//       {/* Preview Modal */}
//       <PreviewModal
//         isOpen={showPreview}
//         onClose={() => setShowPreview(false)}
//         formData={{
//           date,
//           party,
//           totalBox: manualTotalBox,
//           entryNumber,
//           salesman,
//           items,
//           totalAmount: calculateTotal(),
//         }}
//         parties={parties}
//         salesmenList={salesmenList}
//         customers={customers}
//         products={products}
//       />
//     </>
//   );
// };

// export default SalesEntryForm;
















import { Plus, Save, Trash2, Eye } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBoard from '../../components/AdminBoard';
import SearchableInput from '../../components/SearchableInput';
import { listEntities } from '../../lib/entities';
// adjust path if your file is elsewhere
import {
  createSale,
  updateSale,
  getLatestEntry,
  getSaleByEntry,
} from "../../lib/sales";


interface SalesItem {
  id: string;
  customer: string;
  box: string;
  kg: string;
  price: string;
  total: string;
  item: string;
  remark: string;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    date: string;
    party: string;
    totalBox: string;
    entryNumber: string;
    salesman: string;
    items: SalesItem[];
    totalAmount: string;
  };
  parties: { id: string; name: string }[];
  salesmenList: { id: string; name: string }[];
  customers: { id: string; name: string }[];
  products: { id: string; name: string }[];
}


const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  formData,
  parties,
  salesmenList,
  customers,
  products,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    if (isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, formData.items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, formData.items.length, onClose]);

  useEffect(() => {
    if (focusedIndex >= 0) {
      const row = document.getElementById(`preview-row-${focusedIndex}`);
      if (row) {
        row.scrollIntoView({ behavior: 'auto', block: 'nearest' });
      }
    }
  }, [focusedIndex]);

  if (!isOpen) return null;

  const getEntityName = (id: string, entityList: { id: string; name: string }[]) => {
    const entity = entityList.find(item => item.id === id);
    return entity ? entity.name : id;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sales Form Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header Information */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Date
              </label>
              <p className="text-gray-900 dark:text-white">
                {formData.date ? new Date(formData.date).toLocaleDateString('en-GB').replace(/\//g, '-') : '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Party
              </label>
              <p className="text-gray-900 dark:text-white">
                {getEntityName(formData.party, parties)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Total Box
              </label>
              <p className="text-gray-900 dark:text-white">{formData.totalBox || '0'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Entry Number
              </label>
              <p className="text-gray-900 dark:text-white">{formData.entryNumber || '1'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Salesman
              </label>
              <p className="text-gray-900 dark:text-white">
                {getEntityName(formData.salesman, salesmenList)}
              </p>
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
                    Box
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    KG
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Price
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Total
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Item
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr
                    key={item.id}
                    id={`preview-row-${index}`}
                    onClick={() => setFocusedIndex(index)}
                    className={`cursor-pointer transition-colors ${focusedIndex === index
                      ? 'bg-blue-100 dark:bg-blue-900'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      {getEntityName(item.customer, customers)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      {item.box || '0'}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      {item.kg || '0.00'}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      ₹{item.price || '0.00'}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      ₹{item.total || '0.00'}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      {getEntityName(item.item, products)}
                    </td>
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-white">
                      {item.remark || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                  <td
                    colSpan={6}
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-gray-900 dark:text-white"
                  >
                    Total Amount:
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                    ₹{formData.totalAmount}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Try to resolve a value to an entity id (value might already be an id string or a name)
function resolveEntityId(value: string | null | undefined, list: { id: string; name: string }[]): string | null {
  if (!value) return null;
  const asId = String(value).trim();

  // If it exactly matches an id in list, return it
  if (list.some(x => x.id === asId)) return asId;

  // Otherwise try to match by name (case-insensitive)
  const byName = list.find(x => x.name && x.name.toLowerCase() === asId.toLowerCase());
  if (byName) return byName.id;

  // Not found
  return null;
}


const SalesEntryForm: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [parties, setParties] = useState<{ id: string; name: string }[]>([]);
  const [salesmenList, setSalesmenList] = useState<
    { id: string; name: string }[]
  >([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Autosave states
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Validation error states - only show red borders after save attempt
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: boolean }>({});
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);

  // Default values for new rows
  const [defaultCustomer, setDefaultCustomer] = useState('');
  const [defaultPrice, setDefaultPrice] = useState('');
  const [defaultItem, setDefaultItem] = useState('');

  // Initialize with current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  //   const mapItemsForServer = (items: SalesItem[]) => {
  //   return items
  //     .filter(it => it && (it.customer?.trim() || it.box || it.kg || it.price || it.item?.trim() || it.remark?.trim()))
  //     .map(it => ({
  //       customerName: it.customer || null,
  //       productName: it.item || null,
  //       box: it.box !== "" ? it.box : null,
  //       kg: it.kg !== "" ? it.kg : null,
  //       price: it.price !== "" ? it.price : null,
  //       total: it.total !== "" ? it.total : null,
  //       remark: it.remark || null,
  //     }));
  // };
  const mapItemsForServer = (items: SalesItem[]) => {
    return items
      .filter(it => it && (it.customer?.trim() || it.box || it.kg || it.price || it.item?.trim() || it.remark?.trim()))
      .map(it => {
        const customerId = resolveEntityId(it.customer, customers);
        const productId = resolveEntityId(it.item, products);

        return {
          // The backend expects these fields to be IDs (your backend code used customerName/productName as IDs)
          customerName: customerId,      // string id or null
          productName: productId,       // string id or null
          box: it.box !== "" ? it.box : null,
          kg: it.kg !== "" ? it.kg : null,
          price: it.price !== "" ? it.price : null,
          total: it.total !== "" ? it.total : null,
          remark: it.remark || null,
        };
      });
  };


  const [date, setDate] = useState(getCurrentDate());
  const [party, setParty] = useState('');
  const [salesman, setSalesman] = useState('');
  const [manualTotalBox, setManualTotalBox] = useState('');
  const [entryNumber, setEntryNumber] = useState('');
  const [items, setItems] = useState<SalesItem[]>([
    {
      id: '1',
      customer: '',
      box: '',
      kg: '',
      price: '',
      total: '',
      item: '',
      remark: '',
    },
  ]);
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);

  // localStorage key for header values
  const HEADER_STORAGE_KEY = 'salesFormHeaderValues';

  // Save header values to localStorage
  const saveHeaderValues = useCallback(() => {
    const headerData = {
      party,
      salesman,
      manualTotalBox,
      // Don't save entryNumber - it should be dynamic based on form data
      lastSaved: new Date().toISOString(),
    };
    try {
      localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(headerData));
      console.log('Header values saved to localStorage:', headerData);
    } catch (err) {
      console.error('Error saving header values to localStorage:', err);
    }
  }, [party, salesman, manualTotalBox]);

  // Load header values from localStorage
  const loadHeaderValues = useCallback(() => {
    try {
      const savedData = localStorage.getItem(HEADER_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Loading header values from localStorage:', parsedData);
        if (parsedData.party) setParty(parsedData.party);
        if (parsedData.salesman) setSalesman(parsedData.salesman);
        if (parsedData.manualTotalBox) setManualTotalBox(parsedData.manualTotalBox);
        if (parsedData.entryNumber) setEntryNumber(parsedData.entryNumber);
      }
    } catch (err) {
      console.error('Error loading header values from localStorage:', err);
    }
  }, []);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch a reasonably large first page for selects/autocomplete fallback
        const pageSize = 200;

        const [custResp, partyResp, salesResp, prodResp] = await Promise.all([
          listEntities('customers', { page: 1, pageSize }),
          listEntities('parties', { page: 1, pageSize }),
          listEntities('salesmen', { page: 1, pageSize }),
          listEntities('products', { page: 1, pageSize }),
        ]);

        // listEntities returns { data, totalCount, page, pageSize }
        if (custResp && Array.isArray(custResp.data)) {
          setCustomers(custResp.data.map(e => ({ ...e, id: String(e.id) })));
        }
        if (partyResp && Array.isArray(partyResp.data)) {
          setParties(partyResp.data.map(e => ({ ...e, id: String(e.id) })));
        }
        if (salesResp && Array.isArray(salesResp.data)) {
          setSalesmenList(salesResp.data.map(e => ({ ...e, id: String(e.id) })));
        }
        if (prodResp && Array.isArray(prodResp.data)) {
          setProducts(prodResp.data.map(e => ({ ...e, id: String(e.id) })));
        }

      } catch (err) {
        console.error('Error loading entity lists', err);
        // Optional: show notification
        setNotification({ message: 'Failed loading lookup data', type: 'error' });
      }
    };

    fetchData();
  }, []);
  // Load header values on component mount
  useEffect(() => {
    loadHeaderValues();
  }, [loadHeaderValues]);

  // Save header values when they change
  useEffect(() => {
    if (party || salesman || manualTotalBox) {
      saveHeaderValues();
    }
  }, [party, salesman, manualTotalBox, saveHeaderValues]);

  // Add F2 key event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        handlePreview();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset autosave status after 3 seconds of being saved
  useEffect(() => {
    if (autosaveStatus === 'saved') {
      const timeout = setTimeout(() => {
        setAutosaveStatus('idle');
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [autosaveStatus]);

  const addItem = () => {
    const newItem: SalesItem = {
      id: crypto.randomUUID(), // optional temporary UUID for React
      customer: '',
      box: '',
      kg: '',
      price: defaultPrice,
      total: '',
      item: defaultItem,
      remark: '',
    };
    setItems([newItem, ...items]);
    return newItem.id;
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof SalesItem, value: string) => {
    try {
      setItems(
        items.map((item) => {
          if (item.id === id) {
            const updatedItem = { ...item, [field]: value };

            // Update defaults when customer, price or item is changed
            if (field === 'customer') {
              setDefaultCustomer(value);
            }
            if (field === 'price') {
              setDefaultPrice(value);
            }
            if (field === 'item') {
              setDefaultItem(value);
            }

            // Auto-calculate total when box, kg, or price changes
            if (field === 'box' || field === 'kg' || field === 'price') {
              const box =
                parseFloat(field === 'box' ? value : updatedItem.box) || 0;
              const kg = parseFloat(field === 'kg' ? value : updatedItem.kg) || 0;
              const price =
                parseFloat(field === 'price' ? value : updatedItem.price) || 0;

              // Use KG if available, otherwise use Box
              const quantity = kg > 0 ? kg : box;
              updatedItem.total = (price * quantity).toFixed(2);
            }

            return updatedItem;
          }
          return item;
        })
      );
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleCustomerSelect = (itemId: string, customer: { id: string; name: string }) => {
    try {
      updateItem(itemId, 'customer', customer.id);
      // You can add logic here to pre-fill customer-specific data if needed
    } catch (error) {
      console.error('Error selecting customer:', error);
    }
  };

  const handleItemSelect = (itemId: string, product: { id: string; name: string }) => {
    try {
      updateItem(itemId, 'item', product.id);
      // You can add logic here to pre-fill product-specific data if needed
    } catch (error) {
      console.error('Error selecting item:', error);
    }
  };

  const handlePartySelect = (party: { id: string; name: string }) => {
    try {
      setParty(party.id);
      // You can add logic here to pre-fill party-specific data if needed
    } catch (error) {
      console.error('Error selecting party:', error);
    }
  };

  const handleSalesmanSelect = (salesman: { id: string; name: string }) => {
    try {
      setSalesman(salesman.id);
      // You can add logic here to pre-fill salesman-specific data if needed
    } catch (error) {
      console.error('Error selecting salesman:', error);
    }
  };

  const calculateTotal = () => {
    return items
      .reduce((total, item) => {
        return total + (parseFloat(item.total) || 0);
      }, 0)
      .toFixed(2);
  };

  const calculateTotalBoxes = () => {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.box) || 0);
    }, 0);
  };

  // Get the calculated total boxes value
  const totalBoxesValue = calculateTotalBoxes();


  // Replace your current fetchAndLoadLastEntry useCallback with this:
  const fetchAndLoadLastEntry = useCallback(async () => {
    // require header fields
    if (!date || !party || !salesman || !manualTotalBox ||
      party.trim() === "" || salesman.trim() === "" || manualTotalBox.trim() === "") {
      setEntryNumber("");
      const newItem: SalesItem = {
        id: crypto.randomUUID(),
        customer: "",
        box: "",
        kg: "",
        price: "",
        total: "",
        item: "",
        remark: "",
      };
      setItems([newItem]);
      return;
    }

    try {
      const resp = await getLatestEntry({
        date,
        partyName: party,
        salesmanName: salesman,
        totalBox: manualTotalBox,
      });

      console.log(resp);


      if (resp && resp.sale) {
        const lastEntry = resp.sale;
        setEntryNumber(String(lastEntry.entry_number || 1));
        setCurrentEntryId(lastEntry.id || null);

        if (Array.isArray(resp.items) && resp.items.length > 0) {
          setItems(resp.items.map((it: any, idx: number) => ({
            id: it.id ? String(it.id) : `${idx + 1}`,
            customer: it.customer_name || "",
            box: it.box != null ? String(it.box) : "",
            kg: it.kg != null ? String(it.kg) : "",
            price: it.price != null ? String(it.price) : "",
            total: it.total != null ? String(it.total) : "",
            item: it.product_name || "",
            remark: it.remark || "",
          })));
          setNotification({ message: `Loaded entry ${lastEntry.entry_number}`, type: "success" });

          // Add one empty row at top (use defaults but DO NOT include them as deps)
          setTimeout(() => {
            const newItem: SalesItem = {
              id: crypto.randomUUID(),
              customer: "",
              box: "",
              kg: "",
              price: defaultPrice,
              total: "",
              item: defaultItem,
              remark: "",
            };
            setItems(prev => [newItem, ...prev]);
          }, 100);
        } else {
          setItems([{
            id: crypto.randomUUID(),
            customer: "",
            box: "",
            kg: "",
            price: "",
            total: "",
            item: "",
            remark: "",
          }]);
        }
      } else {
        setEntryNumber("1");
        setCurrentEntryId(null);
        setItems([{
          id: crypto.randomUUID(),
          customer: "",
          box: "",
          kg: "",
          price: "",
          total: "",
          item: "",
          remark: "",
        }]);
      }
    } catch (err: any) {
      console.error("fetchAndLoadLastEntry error", err);
      setEntryNumber("1");
      setCurrentEntryId(null);
      setItems([{
        id: crypto.randomUUID(),
        customer: "",
        box: "",
        kg: "",
        price: "",
        total: "",
        item: "",
        remark: "",
      }]);
    }
  }, [date, party, salesman, manualTotalBox]); // <- IMPORTANT: no defaultCustomer/defaultPrice/defaultItem here


  // Replace current loadEntryData useCallback with this:
  const loadEntryData = useCallback(async (entryNum: string) => {
    if (!date || !party || !salesman || !manualTotalBox || !entryNum) {
      setItems([{
        id: crypto.randomUUID(),
        customer: "",
        box: "",
        kg: "",
        price: "",
        total: "",
        item: "",
        remark: "",
      }]);
      return;
    }

    try {
      const resp = await getSaleByEntry({
        date,
        partyName: party,
        salesmanName: salesman,
        totalBox: manualTotalBox,
        entryNumber: entryNum,
      });

      if (resp && resp.sale) {
        setCurrentEntryId(resp.sale.id || null);
        setItems(resp.items.map((it: any, idx: number) => ({
          id: it.id ? String(it.id) : `${idx + 1}`,
          customer: it.customer_name || "",
          box: it.box != null ? String(it.box) : "",
          kg: it.kg != null ? String(it.kg) : "",
          price: it.price != null ? String(it.price) : "",
          total: it.total != null ? String(it.total) : "",
          item: it.product_name || "",
          remark: it.remark || "",
        })));
        setNotification({ message: `Loaded entry ${entryNum}`, type: "success" });

        setTimeout(() => {
          const newItem: SalesItem = {
            id: crypto.randomUUID(),
            customer: "",
            box: "",
            kg: "",
            price: defaultPrice,
            total: "",
            item: defaultItem,
            remark: "",
          };
          setItems(prev => [newItem, ...prev]);
        }, 100);
      } else {
        setCurrentEntryId(null);
        setItems([{
          id: crypto.randomUUID(),
          customer: "",
          box: "",
          kg: "",
          price: "",
          total: "",
          item: "",
          remark: "",
        }]);
        console.log("No existing entry found for entry number, cleared items");
      }
    } catch (err: any) {
      console.error("loadEntryData error", err);
      setCurrentEntryId(null);
      setItems([{
        id: crypto.randomUUID(),
        customer: "",
        box: "",
        kg: "",
        price: "",
        total: "",
        item: "",
        remark: "",
      }]);
    }
  }, [date, party, salesman, manualTotalBox]); // <- IMPORTANT: no defaults here either



  // Effect to fetch and load last entry when header fields change
  useEffect(() => {
    console.log('🔄 Header fields changed:', { date, party, salesman, manualTotalBox });

    // Only fetch if we have all required fields filled and they are not empty strings
    if (date && party && salesman && manualTotalBox &&
      party.trim() !== '' && salesman.trim() !== '' && manualTotalBox.trim() !== '') {
      console.log('🔄 All fields filled, calling fetchAndLoadLastEntry');
      fetchAndLoadLastEntry();
    } else {
      console.log('🔄 Fields not complete, clearing form');
      // Clear entry number and items if not all fields are properly filled
      setEntryNumber('');
      const newItem: SalesItem = {
        id: crypto.randomUUID(),
        customer: '',
        box: '',
        kg: '',
        price: '',
        total: '',
        item: '',
        remark: '',
      };
      setItems([newItem]);
    }
  }, [fetchAndLoadLastEntry, date, party, salesman, manualTotalBox]);

  // Effect to load data when entryNumber changes to an existing value
  useEffect(() => {
    if (!entryNumber || parseInt(entryNumber) <= 0) return;

    const timer = setTimeout(() => {
      loadEntryData(entryNumber);
    }, 500); // Delay for stability
    return () => clearTimeout(timer);
  }, [entryNumber, loadEntryData]);

  const handlePreview = () => {
    setShowPreview(true);
  };

  const fieldOrder: (keyof SalesItem)[] = [
    'customer',
    'box',
    'kg',
    'price',
    'item',
    'remark',
  ];

  const headerFieldOrder = ['date', 'party', 'totalBox', 'salesman', 'entryNumber'];

  const handleHeaderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const currentField = (e.target as HTMLElement).closest('[data-field]')?.getAttribute('data-field');
    const currentIndex = headerFieldOrder.indexOf(currentField || '');

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!currentField) return;

      const nextField = headerFieldOrder[currentIndex + 1];

      if (currentField === 'salesman' || currentField === 'entryNumber' || !nextField) {
        // Move to first item row's customer field
        if (items.length > 0) {
          const firstWrapperInput = document.querySelector<HTMLInputElement>(
            `[data-item-id="${items[0].id}"][data-field="customer"] input`
          );
          firstWrapperInput?.focus();
        }
        return;
      }

      // Try searching in wrapper divs first
      let nextInput = document.querySelector<HTMLInputElement>(`[data-field="${nextField}"] input`);
      if (!nextInput) {
        nextInput = document.querySelector<HTMLInputElement>(`input[data-field="${nextField}"]`);
      }
      nextInput?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextField = headerFieldOrder[currentIndex + 1];
      if (nextField) {
        let nextInput = document.querySelector<HTMLInputElement>(`[data-field="${nextField}"] input`);
        if (!nextInput) nextInput = document.querySelector<HTMLInputElement>(`input[data-field="${nextField}"]`);
        nextInput?.focus();
      } else if (items.length > 0) {
        // Move to first row of table
        const firstWrapperInput = document.querySelector<HTMLInputElement>(
          `[data-item-id="${items[0].id}"][data-field="customer"] input`
        );
        firstWrapperInput?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevField = headerFieldOrder[currentIndex - 1];
      if (prevField) {
        let prevInput = document.querySelector<HTMLInputElement>(`[data-field="${prevField}"] input`);
        if (!prevInput) prevInput = document.querySelector<HTMLInputElement>(`input[data-field="${prevField}"]`);
        prevInput?.focus();
      }
    }
  };

  const handleEntryNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEntryNumber = e.target.value;
    setEntryNumber(newEntryNumber);

    // Load entry data when user manually changes entry number
    if (newEntryNumber && date && party && salesman && manualTotalBox) {
      loadEntryData(newEntryNumber);
    } else {
      // Clear items if entry number is cleared or required fields are missing
      const newItem: SalesItem = {
        id: crypto.randomUUID(),
        customer: '',
        box: '',
        kg: '',
        price: '',
        total: '',
        item: '',
        remark: '',
      };
      setItems([newItem]);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    itemId: string
  ) => {
    // Find the data-field from the input or its wrapper
    let currentField = (e.target as HTMLInputElement).dataset.field;
    if (!currentField) {
      const wrapper = (e.target as HTMLElement).closest('[data-field]');
      currentField = wrapper?.getAttribute('data-field') || '';
    }

    if (!currentField) return;

    // Handle Vertical Navigation (ArrowUp / ArrowDown)
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const currentItemIndex = items.findIndex((item) => item.id === itemId);
      if (currentItemIndex === -1) return;

      if (e.key === 'ArrowUp' && currentItemIndex === 0) {
        e.preventDefault();
        // Move back to salesman header field
        const salesmanInput = document.querySelector<HTMLInputElement>(`[data-field="salesman"] input`);
        salesmanInput?.focus();
        return;
      }

      let targetItemId: string | null = null;
      if (e.key === 'ArrowDown') {
        if (currentItemIndex < items.length - 1) {
          e.preventDefault();
          targetItemId = items[currentItemIndex + 1].id;
        }
      } else if (e.key === 'ArrowUp') {
        if (currentItemIndex > 0) {
          e.preventDefault();
          targetItemId = items[currentItemIndex - 1].id;
        }
      }

      if (targetItemId) {
        // Find input with same data-field in target row
        const nextWrapperInput = document.querySelector<HTMLInputElement>(
          `[data-item-id="${targetItemId}"][data-field="${currentField}"] input`
        );
        if (nextWrapperInput) {
          nextWrapperInput.focus();
        } else {
          const nextInput = document.querySelector<HTMLInputElement>(
            `input[data-item-id="${targetItemId}"][data-field="${currentField}"]`
          );
          nextInput?.focus();
        }
      }
      return;
    }

    // Handle Enter Key Navigation
    if (e.key === 'Enter') {
      e.preventDefault();

      const currentIndex = fieldOrder.indexOf(currentField as keyof SalesItem);
      if (currentIndex === -1) return;

      let nextField: keyof SalesItem | undefined;
      if (currentField === 'box') {
        // Skip KG after Box, go to price
        nextField = 'price';
      } else {
        nextField = fieldOrder[currentIndex + 1];
      }

      if (nextField) {
        // Move to next field in same row
        // Try searching in wrapper divs first (for SearchableInput)
        const nextWrapperInput = document.querySelector<HTMLInputElement>(
          `[data-item-id="${itemId}"][data-field="${nextField}"] input`
        );
        if (nextWrapperInput) {
          nextWrapperInput.focus();
        } else {
          // Fallback to regular input
          const nextInput = document.querySelector<HTMLInputElement>(
            `input[data-item-id="${itemId}"][data-field="${nextField}"]`
          );
          nextInput?.focus();
        }
      } else {
        // End of row - always create new row when pressing Enter on remark
        if (!e.shiftKey) {
          // Add new row and focus on its first field
          const newId = addItem();
          setTimeout(() => {
            // Try searching in wrapper divs first (for SearchableInput)
            const firstWrapperInput = document.querySelector<HTMLInputElement>(
              `[data-item-id="${newId}"][data-field="customer"] input`
            );
            if (firstWrapperInput) {
              firstWrapperInput.focus();
            } else {
              // Fallback to regular input
              const firstInput = document.querySelector<HTMLInputElement>(
                `input[data-item-id="${newId}"][data-field="customer"]`
              );
              firstInput?.focus();
            }
          }, 0);
        }
      }
    }
  };

  // Autosave function - saves to localStorage
  const handleAutosave = useCallback(() => {
    console.log('Starting autosave with data:', {
      date,
      party,
      salesman,
      entryNumber,
      totalBoxes: totalBoxesValue,
      itemsCount: items.length
    });

    const salesData = {
      date,
      party,
      totalBox: manualTotalBox,
      entryNumber,
      salesman,
      items,
      lastAutosave: new Date().toISOString(),
    };

    try {
      localStorage.setItem('salesFormDraft', JSON.stringify(salesData));
      setAutosaveStatus('saved');
      setLastAutosave(new Date());
      console.log('Autosave completed successfully');
    } catch (err) {
      console.error('Autosave failed:', err);
      setAutosaveStatus('error');
    }
  }, [party, salesman, entryNumber, items, date, totalBoxesValue, manualTotalBox]);

  // Autosave effect - save immediately when any field is filled
  useEffect(() => {
    const hasAnyFilledField = party?.trim() ||
      salesman?.trim() ||
      manualTotalBox?.trim() ||
      items.some(item => item.customer?.trim() || item.box || item.kg || item.price || item.item?.trim() || item.remark?.trim());

    console.log('Autosave effect check:', {
      hasAnyFilledField,
      date,
      party: party?.trim(),
      salesman: salesman?.trim(),
      manualTotalBox: manualTotalBox?.trim(),
      itemsWithData: items.filter(item => item.customer?.trim() || item.box || item.kg || item.price || item.item?.trim() || item.remark?.trim()).length
    });

    if (!hasAnyFilledField) {
      console.log('No filled fields, skipping autosave');
      setAutosaveStatus('idle');
      return;
    }

    console.log('Autosave conditions met, saving immediately');
    handleAutosave();
  }, [party, salesman, items, date, manualTotalBox, handleAutosave]);

  // Load any existing draft from localStorage on component mount
  useEffect(() => {
    const loadDraft = () => {
      try {
        const draftData = localStorage.getItem('salesFormDraft');
        if (draftData) {
          const parsedData = JSON.parse(draftData);
          console.log('Loading draft from localStorage:', parsedData);

          // Only load draft if it has meaningful data (not empty post-save state)
          const hasMeaningfulData = parsedData.party?.trim() ||
            parsedData.salesman?.trim() ||
            parsedData.totalBox?.trim() ||
            (parsedData.items && parsedData.items.some((item: any) =>
              item.customer?.trim() || item.box || item.kg || item.price || item.item?.trim() || item.remark?.trim()
            ));

          if (hasMeaningfulData) {
            setDate(parsedData.date || getCurrentDate());
            setParty(parsedData.party || '');
            setSalesman(parsedData.salesman || '');
            setManualTotalBox(parsedData.totalBox || '');
            // Don't restore entry number from localStorage - it should be dynamic based on form data
            setItems(parsedData.items || items);
            // Set defaults from first item if available
            if (parsedData.items && parsedData.items.length > 0) {
              setDefaultCustomer(parsedData.items[0].customer || '');
              setDefaultPrice(parsedData.items[0].price || '');
              setDefaultItem(parsedData.items[0].item || '');
            }
            setLastAutosave(new Date(parsedData.lastAutosave));
            setAutosaveStatus('idle');
            console.log('Draft loaded with meaningful data');
          } else {
            console.log('Draft data appears to be empty post-save state, skipping load');
            // Clear the empty draft data
            localStorage.removeItem('salesFormDraft');
          }
        }
      } catch (err) {
        console.error('Error loading draft from localStorage:', err);
      }
    };

    loadDraft();
  }, []);

  const handleSave = async () => {
    console.log("💾 Save button clicked with data:", {
      date,
      party,
      salesman,
      manualTotalBox,
      entryNumber,
      itemsCount: items.length,
    });

    setHasAttemptedSave(true);

    // Validation (same as before)
    const fieldErrors: { [key: string]: boolean } = {};
    if (!party?.trim()) fieldErrors["party"] = true;
    if (!salesman?.trim()) fieldErrors["salesman"] = true;
    if (!manualTotalBox?.trim()) fieldErrors["totalBox"] = true;
    if (!items || items.length === 0) fieldErrors["items"] = true;
    else {
      items.forEach((item, index) => {
        if (!item.customer?.trim()) fieldErrors[`item-${index}-customer`] = true;
        const hasBox = item.box && item.box.trim() !== "";
        const hasKg = item.kg && item.kg.trim() !== "";
        if (!hasBox && !hasKg) fieldErrors[`item-${index}-boxorkg`] = true;
        if (!item.price || item.price.trim() === "") fieldErrors[`item-${index}-price`] = true;
      });
    }

    setValidationErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      setNotification({ message: "Please enter all mandatory fields", type: "error" });
      return;
    }

    // Prepare payload
    const payload = {
      date,
      partyName: party,
      salesmanName: salesman,
      totalBox: manualTotalBox != null ? Number(manualTotalBox) : 0,
      entryNumber: entryNumber ? Number(entryNumber) : 1,
      totalAmount: calculateTotal(),
      items: mapItemsForServer(items),
    };

    try {
      console.log("Starting save operation with payload:", payload);

      if (currentEntryId) {
        // update existing
        await updateSale(currentEntryId, payload);
        setNotification({ message: `Sales entry ${entryNumber} updated successfully!`, type: "success" });
      } else {
        // create new
        const resp = await createSale(payload);
        // resp should contain id and possibly load number string
        const newId = resp?.id;
        setCurrentEntryId(newId || null);
        // Ensure entryNumber is set (server uses provided entryNumber; your router returns load_number_str only)
        setEntryNumber(String(payload.entryNumber || 1));
        setNotification({ message: `Sales entry ${payload.entryNumber} saved successfully!`, type: "success" });
      }

      // Clear validation and reset form similar to your previous behaviour
      setValidationErrors({});
      setHasAttemptedSave(false);

      // Reset date to today
      setDate(getCurrentDate());
      setParty("");
      setSalesman("");
      setManualTotalBox("");
      setDefaultCustomer("");
      setDefaultPrice("");
      setDefaultItem("");

      const newItem: SalesItem = {
        id: crypto.randomUUID(),
        customer: "",
        box: "",
        kg: "",
        price: "",
        total: "",
        item: "",
        remark: "",
      };
      setItems([newItem]);

      // Clear autosave data
      setCurrentDraftId(null);
      setCurrentEntryId(null);
      setAutosaveStatus("idle");
      setLastAutosave(null);
      localStorage.removeItem("salesFormDraft");
      localStorage.removeItem("salesFormHeaderValues");
    } catch (err: any) {
      console.error("Save operation failed:", err);

      // Handle common API errors
      const status = err?.response?.status;
      const data = err?.response?.data;
      if (status === 409) {
        setNotification({ message: data?.message || "Duplicate entry", type: "error" });
      } else {
        const msg = (data && data.message) ? data.message : (err.message || "Failed to save");
        setNotification({ message: `Error saving sales entry: ${msg}`, type: "error" });
      }
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
    <>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6 min-h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Sales</h1>

              {/* Autosave Status Indicator */}
              <div className="flex items-center space-x-2 text-sm">
                {autosaveStatus === 'saved' && (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span>
                      Auto-saved {lastAutosave && `at ${lastAutosave.toLocaleTimeString()}`}
                    </span>
                  </div>
                )}
                {autosaveStatus === 'error' && (
                  <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span>Save failed</span>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Header Fields */}
            <div className="flex-shrink-0">
              {/* Header Information */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    onKeyDown={handleHeaderKeyDown}
                    data-field="date"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${hasAttemptedSave && validationErrors['party']
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Party <span className="text-red-500">*</span>
                  </label>

                  <SearchableInput
                    value={party}
                    onChange={setParty}
                    placeholder="Search party..."
                    searchData={parties}
                    onSelect={handlePartySelect}
                    onKeyDown={handleHeaderKeyDown}
                    createRoute="/create-party"
                    entityType="party"
                    data-field="party"
                    className={hasAttemptedSave && validationErrors['party'] ? 'border-red-500 dark:border-red-400' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Total Box <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={manualTotalBox}
                    onChange={(e) => setManualTotalBox(e.target.value)}
                    onKeyDown={handleHeaderKeyDown}
                    data-field="totalBox"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${hasAttemptedSave && validationErrors['totalBox']
                      ? 'border-red-500 dark:border-red-400'
                      : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Salesman <span className="text-red-500">*</span>
                  </label>
                  <SearchableInput
                    value={salesman}
                    onChange={setSalesman}
                    placeholder="Search salesman..."
                    searchData={salesmenList}
                    onSelect={handleSalesmanSelect}
                    onKeyDown={handleHeaderKeyDown}
                    createRoute="/create-salesman"
                    entityType="salesman"
                    data-field="salesman"
                    className={hasAttemptedSave && validationErrors['salesman'] ? 'border-red-500 dark:border-red-400' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Entry Number
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={entryNumber}
                      onChange={handleEntryNumberChange}
                      onKeyDown={handleHeaderKeyDown}
                      data-field="entryNumber"
                      disabled={!date || !party || !salesman || !manualTotalBox}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${(!date || !party || !salesman || !manualTotalBox)
                        ? 'border-gray-200 dark:border-gray-500 bg-gray-50 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                        : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentValue = parseInt(entryNumber) || 0;
                        const newValue = currentValue + 1;
                        setEntryNumber(newValue.toString());
                        // Load entry data when user manually changes entry number
                        if (newValue > 0 && date && party && salesman && manualTotalBox) {
                          loadEntryData(newValue.toString());
                        }
                      }}
                      disabled={!date || !party || !salesman || !manualTotalBox}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 px-1 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500 disabled:bg-gray-50 dark:disabled:bg-gray-600 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed rounded text-sm"
                      title="Increase entry number"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Amount Section - Moved between header and table */}
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 border-t border-b border-gray-200 dark:border-gray-600 my-2">
              <div className="px-4 py-3">
                <div className="flex justify-end items-center space-x-4 sm:space-x-8">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">
                      Grand Total Box:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {calculateTotalBoxes()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">
                      Total Amount:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      ₹{calculateTotal()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Table Area */}
            <div className="flex-1 overflow-y-auto mt-2 outline-none focus:ring-1 focus:ring-blue-500/30 rounded-lg" tabIndex={0}>
              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 min-w-[1000px]">
                  <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                    <tr>
                      <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[150px] sm:min-w-[220px]">
                        Customer <span className="text-red-500">*</span>
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                        Box <span className="text-red-500">*</span>
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                        KG
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                        Price <span className="text-red-500">*</span>
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                        Total
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 min-w-[150px] sm:min-w-[220px]">
                        Item
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200">
                        Remark
                      </th>
                      <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        onFocus={() => setFocusedRowId(item.id)}
                        className={`transition-colors ${focusedRowId === item.id
                          ? 'bg-blue-100 dark:bg-blue-900/20'
                          : 'bg-white dark:bg-gray-800'
                          }`}
                      >
                        <td className="border border-gray-300 dark:border-gray-600 p-2 min-w-[150px] sm:min-w-[220px]">
                          <SearchableInput
                            value={item.customer}
                            onChange={(value) => updateItem(item.id, 'customer', value)}
                            placeholder="Search customer..."
                            searchData={customers}
                            onSelect={(customer) => handleCustomerSelect(item.id, customer)}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            createRoute="/create-customer"
                            entityType="customer"
                            className={`w-full ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-customer`]
                              ? 'border-red-500 dark:border-red-400'
                              : ''
                              }`}
                            data-field="customer"
                            data-item-id={item.id}
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="number"
                            step="1"
                            value={item.box}
                            onChange={(e) =>
                              updateItem(item.id, 'box', e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            data-item-id={item.id}
                            data-field="box"
                            className={`w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-boxorkg`]
                              ? 'border-red-500 dark:border-red-400 rounded'
                              : ''
                              }`}
                            placeholder="0"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.kg}
                            onChange={(e) =>
                              updateItem(item.id, 'kg', e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            data-item-id={item.id}
                            data-field="kg"
                            className={`w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-boxorkg`]
                              ? 'border-red-500 dark:border-red-400 rounded'
                              : ''
                              }`}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(item.id, 'price', e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            data-item-id={item.id}
                            data-field="price"
                            className={`w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-price`]
                              ? 'border-red-500 dark:border-red-400 rounded'
                              : ''
                              }`}
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="text"
                            value={item.total}
                            readOnly
                            className="w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-2 min-w-[150px] sm:min-w-[220px]">
                          <SearchableInput
                            value={item.item}
                            onChange={(value) => updateItem(item.id, 'item', value)}
                            placeholder="Search item..."
                            searchData={products}
                            onSelect={(product) => handleItemSelect(item.id, product)}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            createRoute="/create-item"
                            entityType="item"
                            className={`w-full ${hasAttemptedSave && validationErrors[`item-${items.indexOf(item)}-price`]
                              ? 'border-red-500 dark:border-red-400'
                              : ''
                              }`}
                            data-field="item"
                            data-item-id={item.id}
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-2">
                          <input
                            type="text"
                            value={item.remark}
                            onChange={(e) =>
                              updateItem(item.id, 'remark', e.target.value)
                            }
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                            data-item-id={item.id}
                            data-field="remark"
                            className="w-full px-2 py-1 border-none focus:ring-2 focus:ring-blue-500 focus:outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Remark"
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={items.length === 1}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fixed Bottom Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center pt-6 border-t border-gray-200 dark:border-gray-600 flex-shrink-0 mt-4 gap-4 sm:gap-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={addItem}
                  className="flex items-center justify-center space-x-2 px-6 py-3 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-all shadow-md hover:shadow-lg text-base sm:text-sm"
                >
                  <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span>Add Row</span>
                </button>

                <button
                  onClick={handlePreview}
                  className="flex items-center justify-center space-x-2 px-6 py-3 sm:px-4 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-500 transition-all shadow-md hover:shadow-lg text-base sm:text-sm"
                >
                  <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span>Preview/F2</span>
                </button>
              </div>

              <button
                onClick={handleSave}
                className="flex items-center justify-center space-x-2 px-8 py-3 sm:px-6 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-all shadow-md hover:shadow-lg text-base sm:text-sm font-semibold"
              >
                <Save className="w-5 h-5 sm:w-4 sm:h-4" />
                <span>Save Entry</span>
              </button>
            </div>


          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        formData={{
          date,
          party,
          totalBox: manualTotalBox,
          entryNumber,
          salesman,
          items,
          totalAmount: calculateTotal(),
        }}
        parties={parties}
        salesmenList={salesmenList}
        customers={customers}
        products={products}
      />
    </>
  );
};

export default SalesEntryForm;