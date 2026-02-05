// import { BarChart3, Menu, Package, PlusCircle, TruckIcon } from 'lucide-react';
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// import Brand from './Brand';
// import UserMenu from './UserMenu';
// import DropdownMenu from './DropdownMenu';
// import NavButton from './NavButton';

// const AdminBoard: React.FC = () => {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [loadDropdown, setLoadDropdown] = useState(false);
//   const [boxDropdown, setBoxDropdown] = useState(false);
//   const [createDropdown, setCreateDropdown] = useState(false);
//   const [reportDropdown, setReportDropdown] = useState(false);
//   const [transactionDropdown, setTransactionDropdown] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest('[data-dropdown-button]') &&
//         (loadDropdown || boxDropdown || createDropdown || reportDropdown || transactionDropdown)) {
//         setLoadDropdown(false);
//         setBoxDropdown(false);
//         setCreateDropdown(false);
//         setReportDropdown(false);
//         setTransactionDropdown(false);
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, [loadDropdown, boxDropdown, createDropdown, reportDropdown, transactionDropdown]);

//   const handleLogout = () => {
//     localStorage.removeItem('isAuthenticated');
//     localStorage.removeItem('username');
//     navigate('/login');
//   };

//   const username = localStorage.getItem('username') || 'Admin';
//   const role = (localStorage.getItem('role') || 'admin') as string;
//   const isAdmin = role === 'admin';
//   const isSale = role === 'sale';
//   const isBox = role === 'box';

//   // Build menu items according to role
//   const loadItems = isAdmin
//     ? [
//       { label: 'Cash Sales', path: '/sales-entry' },
//       { label: 'Sales Summary', path: '/load-wise-list' },
//     ]
//     : isSale
//       ? [{ label: 'Cash Sales', path: '/sales-entry' },
//         // { label: 'Sales Summary', path: '/load-wise-list' }
//       ]
//       : [
//         { label: 'Cash Sales', path: '/sales-entry' },
//         // { label: 'Sales Summary', path: '/load-wise-list' },
//       ];

//   const boxItems = isAdmin || isBox
//     ? [
//       { label: 'Box Sale', path: '/fish-box-sent' },
//       { label: 'Box Receive', path: '/fish-box-received' },
//       { label: 'Multiple Box Receive', path: '/multiple-box-update' },
//       { label: 'Box Sales List', path: '/box-sales-list' },
//     ]
//     : [];

//   const createItems = isAdmin ? [
//     { label: 'Customer', path: '/create-customer' },
//     { label: 'Party', path: '/create-party' },
//     { label: 'Salesman', path: '/create-salesman' },
//     { label: 'Item', path: '/create-item' },
//   ] : [
//     { label: 'Customer', path: '/create-customer' },
//     { label: 'Party', path: '/create-party' },
//     { label: 'Salesman', path: '/create-salesman' },
//     { label: 'Item', path: '/create-item' },
//   ];

//   const transactionItems = isAdmin
//     ? [
//       { label: 'Cash Transactions', path: '/cash-transactions' },
//       { label: 'Box Transactions', path: '/box-transactions' },
//     ]
//     : isSale
//       ? [{ label: 'Cash Transactions', path: '/cash-transactions' }]
//       : isBox
//         ? [{ label: 'Box Transactions', path: '/box-transactions' }]
//         : [];

//   const reportItems = isAdmin
//     ? [
//       { label: 'Daily Collection Sheet', path: '/reports/daily-collection' },
//       { label: 'Sales Register', path: '/reports/sales-register' },
//       { label: 'Daily Summary', path: '/reports/daily-summary' },
//       { label: 'Box Receive Report', path: '/reports/box-receive' },
//       { label: 'Daily Summary (Box)', path: '/reports/daily-summary-box' },
//       { label: 'Total Box Balance', path: '/reports/total-box-balance' },
//       { label: 'Cash Statement', path: '/reports/cash-statement' },
//       { label: 'Box Statement', path: '/reports/box-statement' },
//       { label: 'Daily Box Return Report', path: '/reports/daily-box-return' }
//     ]
//     : isSale
//       ? [
//         { label: 'Daily Collection Sheet', path: '/reports/daily-collection' },
//         { label: 'Sales Register', path: '/reports/sales-register' },
//         { label: 'Daily Summary', path: '/reports/daily-summary' },
//         { label: 'Cash Statement', path: '/reports/cash-statement' },
//       ]
//       : isBox
//         ? [
//           { label: 'Box Receive Report', path: '/reports/box-receive' },
//           { label: 'Daily Summary (Box)', path: '/reports/daily-summary-box' },
//           { label: 'Total Box Balance', path: '/reports/total-box-balance' },
//           { label: 'Box Statement', path: '/reports/box-statement' },
//           { label: 'Daily Box Return Report', path: '/reports/daily-box-return' }
//         ]
//         : [];

//   return (
//     <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-600 transition-colors duration-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Brand */}
//           <Brand />

//           {/* Hamburger Button for Mobile */}
//           <button
//             className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
//             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//           >
//             <Menu className="w-6 h-6" />
//           </button>

//           {/* Desktop Navigation Menu */}
//           <div className="hidden md:flex items-center space-x-8">
//             <NavButton label="Home" onClick={() => navigate('/dashboard')} />

//             {loadItems.length > 0 && (
//               <DropdownMenu
//                 icon={<TruckIcon className="w-5 h-5" />}
//                 label="Load"
//                 isOpen={loadDropdown}
//                 setIsOpen={(open) => {
//                   setLoadDropdown(open);
//                   setBoxDropdown(false);
//                   setCreateDropdown(false);
//                   setTransactionDropdown(false);
//                   setReportDropdown(false);
//                 }}
//                 onNavigate={navigate}
//                 items={loadItems}
//               />
//             )}

//             {boxItems.length > 0 && (
//               <DropdownMenu
//                 icon={<Package className="w-5 h-5" />}
//                 label="Box"
//                 isOpen={boxDropdown}
//                 setIsOpen={(open) => {
//                   setBoxDropdown(open);
//                   setLoadDropdown(false);
//                   setCreateDropdown(false);
//                   setTransactionDropdown(false);
//                   setReportDropdown(false);
//                 }}
//                 onNavigate={navigate}
//                 items={boxItems}
//               />
//             )}


//             {createItems.length > 0 && (
//               <DropdownMenu
//                 icon={<PlusCircle className="w-5 h-5" />}
//                 label="Create"
//                 isOpen={createDropdown}
//                 setIsOpen={(open) => {
//                   setCreateDropdown(open);
//                   setLoadDropdown(false);
//                   setBoxDropdown(false);
//                   setTransactionDropdown(false);
//                   setReportDropdown(false);
//                 }}
//                 onNavigate={navigate}
//                 items={createItems}
//               />
//             )}

//             {transactionItems.length > 0 && (
//               <DropdownMenu
//                 icon={<TruckIcon className="w-5 h-5" />}
//                 label="Transaction"
//                 isOpen={transactionDropdown}
//                 setIsOpen={(open) => {
//                   setTransactionDropdown(open);
//                   setLoadDropdown(false);
//                   setBoxDropdown(false);
//                   setCreateDropdown(false);
//                   setReportDropdown(false);
//                 }}
//                 onNavigate={navigate}
//                 items={transactionItems}
//               />
//             )}

//             {reportItems.length > 0 && (
//               <DropdownMenu
//                 icon={<BarChart3 className="w-5 h-5" />}
//                 label="Report"
//                 isOpen={reportDropdown}
//                 setIsOpen={(open) => {
//                   setReportDropdown(open);
//                   setLoadDropdown(false);
//                   setBoxDropdown(false);
//                   setCreateDropdown(false);
//                   setTransactionDropdown(false);
//                 }}
//                 onNavigate={navigate}
//                 items={reportItems}
//               />
//             )}
//           </div>

//           {/* User Menu - Desktop */}
//           <div className="hidden md:flex items-center">
//             <UserMenu username={username} onLogout={handleLogout} />
//           </div>

//           {/* Mobile Menu */}
//           {isMobileMenuOpen && (
//             <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 shadow-lg z-50">
//               <div className="px-4 py-4 space-y-4">
//                 <NavButton
//                   label="Home"
//                   onClick={() => {
//                     navigate('/dashboard');
//                     setIsMobileMenuOpen(false);
//                   }}
//                 />

//                 {loadItems.length > 0 && (
//                   <DropdownMenu
//                     icon={<TruckIcon className="w-5 h-5" />}
//                     label="Load"
//                     isOpen={loadDropdown}
//                     setIsOpen={(open) => {
//                       setLoadDropdown(open);
//                       setBoxDropdown(false);
//                       setCreateDropdown(false);
//                     }}
//                     onNavigate={(path) => {
//                       navigate(path);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     items={loadItems}
//                   />
//                 )}

//                 {boxItems.length > 0 && (
//                   <DropdownMenu
//                     icon={<Package className="w-5 h-5" />}
//                     label="Box"
//                     isOpen={boxDropdown}
//                     setIsOpen={(open) => {
//                       setBoxDropdown(open);
//                       setLoadDropdown(false);
//                       setCreateDropdown(false);
//                     }}
//                     onNavigate={(path) => {
//                       navigate(path);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     items={boxItems}
//                   />
//                 )}

//                 {createItems.length > 0 && (
//                   <DropdownMenu
//                     icon={<PlusCircle className="w-5 h-5" />}
//                     label="Create"
//                     isOpen={createDropdown}
//                     setIsOpen={(open) => {
//                       setCreateDropdown(open);
//                       setLoadDropdown(false);
//                       setBoxDropdown(false);
//                       setReportDropdown(false);
//                     }}
//                     onNavigate={(path) => {
//                       navigate(path);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     items={createItems}
//                   />
//                 )}

//                 {transactionItems.length > 0 && (
//                   <DropdownMenu
//                     icon={<TruckIcon className="w-5 h-5" />}
//                     label="Transaction"
//                     isOpen={transactionDropdown}
//                     setIsOpen={(open) => {
//                       setTransactionDropdown(open);
//                       setLoadDropdown(false);
//                       setBoxDropdown(false);
//                       setCreateDropdown(false);
//                       setReportDropdown(false);
//                     }}
//                     onNavigate={(path) => {
//                       navigate(path);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     items={transactionItems}
//                   />
//                 )}

//                 {reportItems.length > 0 && (
//                   <DropdownMenu
//                     icon={<BarChart3 className="w-5 h-5" />}
//                     label="Report"
//                     isOpen={reportDropdown}
//                     setIsOpen={(open) => {
//                       setReportDropdown(open);
//                       setLoadDropdown(false);
//                       setBoxDropdown(false);
//                       setCreateDropdown(false);
//                     }}
//                     onNavigate={(path) => {
//                       navigate(path);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     items={reportItems}
//                   />
//                 )}

//                 {/* Mobile User Menu */}
//                 <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
//                   <UserMenu
//                     username={username}
//                     onLogout={() => {
//                       handleLogout();
//                       setIsMobileMenuOpen(false);
//                     }}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default AdminBoard;













import { BarChart3, Menu, Package, PlusCircle, TruckIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Brand from './Brand';
import UserMenu from './UserMenu';
import DropdownMenu from './DropdownMenu';
import NavButton from './NavButton';

const AdminBoard: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadDropdown, setLoadDropdown] = useState(false);
  const [boxDropdown, setBoxDropdown] = useState(false);
  const [createDropdown, setCreateDropdown] = useState(false);
  const [reportDropdown, setReportDropdown] = useState(false);
  const [transactionDropdown, setTransactionDropdown] = useState(false);
  const navigate = useNavigate();

  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobile = /android|iphone|ipad|ipod/i.test(userAgent);
      setIsMobileDevice(isMobile);
    };

    checkMobile();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-button]') &&
        (loadDropdown || boxDropdown || createDropdown || reportDropdown || transactionDropdown)) {
        setLoadDropdown(false);
        setBoxDropdown(false);
        setCreateDropdown(false);
        setReportDropdown(false);
        setTransactionDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [loadDropdown, boxDropdown, createDropdown, reportDropdown, transactionDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const username = localStorage.getItem('username') || 'Admin';
  const role = (localStorage.getItem('role') || 'admin') as string;
  const isAdmin = role === 'admin';
  const isSale = role === 'sale';
  const isBox = role === 'box';

  // Build menu items according to role
  const loadItems = isAdmin
    ? [
      { label: 'Cash Sales', path: '/sales-entry' },
      { label: 'Sales Summary', path: '/load-wise-list' },
    ]
    : isSale
      ? [{ label: 'Cash Sales', path: '/sales-entry' },
        // { label: 'Sales Summary', path: '/load-wise-list' }
      ]
      : [
        { label: 'Cash Sales', path: '/sales-entry' },
        // { label: 'Sales Summary', path: '/load-wise-list' },
      ];

  const boxItems = isAdmin || isBox
    ? [
      { label: 'Box Sale', path: '/fish-box-sent' },
      { label: 'Box Receive', path: '/fish-box-received' },
      { label: 'Multiple Box Receive', path: '/multiple-box-update' },
      { label: 'Box Sales List', path: '/box-sales-list' },
    ]
    : [];

  const createItems = isAdmin ? [
    { label: 'Customer', path: '/create-customer' },
    { label: 'Party', path: '/create-party' },
    { label: 'Salesman', path: '/create-salesman' },
    { label: 'Item', path: '/create-item' },
  ] : [
    { label: 'Customer', path: '/create-customer' },
    { label: 'Party', path: '/create-party' },
    { label: 'Salesman', path: '/create-salesman' },
    { label: 'Item', path: '/create-item' },
  ];

  const transactionItems = isAdmin
    ? [
      { label: 'Cash Transactions', path: '/cash-transactions' },
      { label: 'Box Transactions', path: '/box-transactions' },
    ]
    : isSale
      ? [{ label: 'Cash Transactions', path: '/cash-transactions' }]
      : isBox
        ? [{ label: 'Box Transactions', path: '/box-transactions' }]
        : [];

  const reportItems = isAdmin
    ? [
      { label: 'Daily Collection Sheet', path: '/reports/daily-collection' },
      { label: 'Sales Register', path: '/reports/sales-register' },
      { label: 'Daily Summary', path: '/reports/daily-summary' },
      { label: 'Box Receive Report', path: '/reports/box-receive' },
      { label: 'Daily Summary (Box)', path: '/reports/daily-summary-box' },
      { label: 'Total Box Balance', path: '/reports/total-box-balance' },
      { label: 'Cash Statement', path: '/reports/cash-statement' },
      { label: 'Box Statement', path: '/reports/box-statement' },
      { label: 'Daily Box Return Report', path: '/reports/daily-box-return' }
    ]
    : isSale
      ? [
        { label: 'Daily Collection Sheet', path: '/reports/daily-collection' },
        { label: 'Sales Register', path: '/reports/sales-register' },
        { label: 'Daily Summary', path: '/reports/daily-summary' },
        { label: 'Cash Statement', path: '/reports/cash-statement' },
      ]
      : isBox
        ? [
          { label: 'Box Receive Report', path: '/reports/box-receive' },
          { label: 'Daily Summary (Box)', path: '/reports/daily-summary-box' },
          { label: 'Total Box Balance', path: '/reports/total-box-balance' },
          { label: 'Box Statement', path: '/reports/box-statement' },
          { label: 'Daily Box Return Report', path: '/reports/daily-box-return' }
        ]
        : [];

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-600 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Brand />

          {/* Hamburger Button for Mobile */}
          <button
            className="md:hidden p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavButton label="Home" onClick={() => navigate('/dashboard')} />

            {isMobileDevice && (
              <a
                href="/fishowapp.apk"
                download
                className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium"
              >
                Download App
              </a>
            )}



            {loadItems.length > 0 && (
              <DropdownMenu
                icon={<TruckIcon className="w-5 h-5" />}
                label="Load"
                isOpen={loadDropdown}
                setIsOpen={(open) => {
                  setLoadDropdown(open);
                  setBoxDropdown(false);
                  setCreateDropdown(false);
                  setTransactionDropdown(false);
                  setReportDropdown(false);
                }}
                onNavigate={navigate}
                items={loadItems}
              />
            )}

            {boxItems.length > 0 && (
              <DropdownMenu
                icon={<Package className="w-5 h-5" />}
                label="Box"
                isOpen={boxDropdown}
                setIsOpen={(open) => {
                  setBoxDropdown(open);
                  setLoadDropdown(false);
                  setCreateDropdown(false);
                  setTransactionDropdown(false);
                  setReportDropdown(false);
                }}
                onNavigate={navigate}
                items={boxItems}
              />
            )}


            {createItems.length > 0 && (
              <DropdownMenu
                icon={<PlusCircle className="w-5 h-5" />}
                label="Create"
                isOpen={createDropdown}
                setIsOpen={(open) => {
                  setCreateDropdown(open);
                  setLoadDropdown(false);
                  setBoxDropdown(false);
                  setTransactionDropdown(false);
                  setReportDropdown(false);
                }}
                onNavigate={navigate}
                items={createItems}
              />
            )}

            {transactionItems.length > 0 && (
              <DropdownMenu
                icon={<TruckIcon className="w-5 h-5" />}
                label="Transaction"
                isOpen={transactionDropdown}
                setIsOpen={(open) => {
                  setTransactionDropdown(open);
                  setLoadDropdown(false);
                  setBoxDropdown(false);
                  setCreateDropdown(false);
                  setReportDropdown(false);
                }}
                onNavigate={navigate}
                items={transactionItems}
              />
            )}

            {reportItems.length > 0 && (
              <DropdownMenu
                icon={<BarChart3 className="w-5 h-5" />}
                label="Report"
                isOpen={reportDropdown}
                setIsOpen={(open) => {
                  setReportDropdown(open);
                  setLoadDropdown(false);
                  setBoxDropdown(false);
                  setCreateDropdown(false);
                  setTransactionDropdown(false);
                }}
                onNavigate={navigate}
                items={reportItems}
              />
            )}
          </div>

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center">
            <UserMenu username={username} onLogout={handleLogout} />
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 shadow-lg z-50">
              <div className="px-4 py-4 space-y-4">
                <NavButton
                  label="Home"
                  onClick={() => {
                    navigate('/dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                />

                {loadItems.length > 0 && (
                  <DropdownMenu
                    icon={<TruckIcon className="w-5 h-5" />}
                    label="Load"
                    isOpen={loadDropdown}
                    setIsOpen={(open) => {
                      setLoadDropdown(open);
                      setBoxDropdown(false);
                      setCreateDropdown(false);
                    }}
                    onNavigate={(path) => {
                      navigate(path);
                      setIsMobileMenuOpen(false);
                    }}
                    items={loadItems}
                  />
                )}

                {boxItems.length > 0 && (
                  <DropdownMenu
                    icon={<Package className="w-5 h-5" />}
                    label="Box"
                    isOpen={boxDropdown}
                    setIsOpen={(open) => {
                      setBoxDropdown(open);
                      setLoadDropdown(false);
                      setCreateDropdown(false);
                    }}
                    onNavigate={(path) => {
                      navigate(path);
                      setIsMobileMenuOpen(false);
                    }}
                    items={boxItems}
                  />
                )}

                {createItems.length > 0 && (
                  <DropdownMenu
                    icon={<PlusCircle className="w-5 h-5" />}
                    label="Create"
                    isOpen={createDropdown}
                    setIsOpen={(open) => {
                      setCreateDropdown(open);
                      setLoadDropdown(false);
                      setBoxDropdown(false);
                      setReportDropdown(false);
                    }}
                    onNavigate={(path) => {
                      navigate(path);
                      setIsMobileMenuOpen(false);
                    }}
                    items={createItems}
                  />
                )}

                {transactionItems.length > 0 && (
                  <DropdownMenu
                    icon={<TruckIcon className="w-5 h-5" />}
                    label="Transaction"
                    isOpen={transactionDropdown}
                    setIsOpen={(open) => {
                      setTransactionDropdown(open);
                      setLoadDropdown(false);
                      setBoxDropdown(false);
                      setCreateDropdown(false);
                      setReportDropdown(false);
                    }}
                    onNavigate={(path) => {
                      navigate(path);
                      setIsMobileMenuOpen(false);
                    }}
                    items={transactionItems}
                  />
                )}

                {reportItems.length > 0 && (
                  <DropdownMenu
                    icon={<BarChart3 className="w-5 h-5" />}
                    label="Report"
                    isOpen={reportDropdown}
                    setIsOpen={(open) => {
                      setReportDropdown(open);
                      setLoadDropdown(false);
                      setBoxDropdown(false);
                      setCreateDropdown(false);
                    }}
                    onNavigate={(path) => {
                      navigate(path);
                      setIsMobileMenuOpen(false);
                    }}
                    items={reportItems}
                  />
                )}

                {/* Mobile User Menu */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <UserMenu
                    username={username}
                    onLogout={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminBoard;