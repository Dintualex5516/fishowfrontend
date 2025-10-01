// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Fish,
//   ChevronDown,
//   Package,
//   TruckIcon,
//   LogOut,
//   User,
//   CreditCardIcon,
//   PlusCircle,
// } from 'lucide-react';

// const AdminBoard: React.FC = () => {
//   const [loadDropdown, setLoadDropdown] = useState(false);
//   const [boxDropdown, setBoxDropdown] = useState(false);
//   const [paymentsDropdown, setPaymentsDropdown] = useState(false);
//   const [createDropdown, setCreateDropdown] = useState(false);
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('isAuthenticated');
//     localStorage.removeItem('username');
//     navigate('/login');
//   };

//   const username = localStorage.getItem('username') || 'Admin';

//   return (
//     <nav className="bg-white shadow-sm border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo and Brand */}
//           <div className="flex items-center">
//             <div className="flex items-center space-x-3">
//               <div className="bg-blue-100 p-2 rounded-lg">
//                 <Fish className="w-6 h-6 text-blue-600" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-gray-900">Fishow</h1>
//                 <p className="text-xs text-gray-500">Popular Fish ERP</p>
//               </div>
//             </div>
//           </div>

//           {/* Navigation Menu */}
//           <div className="flex items-center space-x-8">
//             {/* Home Button */}
//             <button
//               onClick={() => navigate('/dashboard')}
//               className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
//             >
//               Home
//             </button>

//             {/* Load Menu */}
//             <div className="relative">
//               <button
//                 onClick={() => {
//                   setLoadDropdown(!loadDropdown);
//                   setBoxDropdown(false);
//                   setPaymentsDropdown(false);
//                   setCreateDropdown(false);
//                 }}
//                 className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//               >
//                 <TruckIcon className="w-5 h-5" />
//                 <span className="font-medium">Load</span>
//                 <ChevronDown className="w-4 h-4" />
//               </button>

//               {loadDropdown && (
//                 <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
//                   <button
//                     onClick={() => {
//                       navigate('/sales-entry');
//                       setLoadDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Cash Sales
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate('/load-wise-list');
//                       setLoadDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Sales Summary
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Box Menu */}
//             <div className="relative">
//               <button
//                 onClick={() => {
//                   setBoxDropdown(!boxDropdown);
//                   setLoadDropdown(false);
//                   setPaymentsDropdown(false);
//                   setCreateDropdown(false);
//                 }}
//                 className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//               >
//                 <Package className="w-5 h-5" />
//                 <span className="font-medium">Box</span>
//                 <ChevronDown className="w-4 h-4" />
//               </button>

//               {boxDropdown && (
//                 <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
//                   <button
//                     onClick={() => {
//                       navigate('/fish-box-sent');
//                       setBoxDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Box Sale
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate('/fish-box-received');
//                       setBoxDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Box Receive
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate('/multiple-box-update');
//                       setBoxDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Multiple Box Receive
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate('/box-sales-list');
//                       setBoxDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Box Sales List
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Payments Menu */}
//             <div className="relative">
//               <button
//                 onClick={() => {
//                   setPaymentsDropdown(!paymentsDropdown);
//                   setLoadDropdown(false);
//                   setBoxDropdown(false);
//                   setCreateDropdown(false);
//                 }}
//                 className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//               >
//                 <CreditCardIcon className="w-5 h-5" />{' '}
//                 {/* You can use any icon */}
//                 <span className="font-medium">Payments</span>
//                 <ChevronDown className="w-4 h-4" />
//               </button>

//               {paymentsDropdown && (
//                 <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
//                   <button
//                     onClick={() => {
//                       navigate('/collect-payments');
//                       setPaymentsDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Collect Payments
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate('/payments-list');
//                       setPaymentsDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Payment List
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* Create Menu */}
//             <div className="relative">
//               <button
//                 onClick={() => {
//                   setCreateDropdown(!createDropdown);
//                   setPaymentsDropdown(false);
//                   setLoadDropdown(false);
//                   setBoxDropdown(false);
//                 }}
//                 className="flex items-center space-x-1 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
//               >
//                 <PlusCircle className="w-5 h-5" /> {/* Any icon works */}
//                 <span className="font-medium">Create</span>
//                 <ChevronDown className="w-4 h-4" />
//               </button>

//               {createDropdown && (
//                 <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
//                   <button
//                     onClick={() => {
//                       navigate('/create-customer');
//                       setCreateDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Customer
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate('/create-party');
//                       setCreateDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Party
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate('/create-salesman');
//                       setCreateDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Salesman
//                   </button>
//                   <button
//                     onClick={() => {
//                       navigate('/create-item');
//                       setCreateDropdown(false);
//                     }}
//                     className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all"
//                   >
//                     Item
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* User Menu */}
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center space-x-2">
//               <User className="w-5 h-5 text-gray-500" />
//               <span className="text-sm text-gray-700">{username}</span>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
//             >
//               <LogOut className="w-4 h-4" />
//               <span className="text-sm">Logout</span>
//             </button>
//           </div>
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
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown-button]') &&
          (loadDropdown || boxDropdown || createDropdown || reportDropdown)) {
        setLoadDropdown(false);
        setBoxDropdown(false);
        setCreateDropdown(false);
        setReportDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [loadDropdown, boxDropdown, createDropdown, reportDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const username = localStorage.getItem('username') || 'Admin';

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

            <DropdownMenu
              icon={<TruckIcon className="w-5 h-5" />}
              label="Load"
              isOpen={loadDropdown}
              setIsOpen={(open) => {
                setLoadDropdown(open);
                setBoxDropdown(false);
                setCreateDropdown(false);
              }}
              onNavigate={navigate}
              items={[
                { label: 'Cash Sales', path: '/sales-entry' },
                { label: 'Sales Summary', path: '/load-wise-list' },
              ]}
            />

            <DropdownMenu
              icon={<Package className="w-5 h-5" />}
              label="Box"
              isOpen={boxDropdown}
              setIsOpen={(open) => {
                setBoxDropdown(open);
                setLoadDropdown(false);
                setCreateDropdown(false);
              }}
              onNavigate={navigate}
              items={[
                { label: 'Box Sale', path: '/fish-box-sent' },
                { label: 'Box Receive', path: '/fish-box-received' },
                { label: 'Multiple Box Receive', path: '/multiple-box-update' },
                { label: 'Box Sales List', path: '/box-sales-list' },
              ]}
            />


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
              onNavigate={navigate}
              items={[
                { label: 'Customer', path: '/create-customer' },
                { label: 'Party', path: '/create-party' },
                { label: 'Salesman', path: '/create-salesman' },
                { label: 'Item', path: '/create-item' },
              ]}
            />

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
              onNavigate={navigate}
              items={[
                { label: 'Daily Collection Sheet', path: '/reports/daily-collection' },
                { label: 'Sales Register', path: '/reports/sales-register' },
                { label: 'Daily Summary', path: '/reports/daily-summary' },
                { label: 'Statement Report', path: '/reports/statement' },
                { label: 'Box Receive Report', path: '/reports/box-receive' },
                { label: 'Daily Summary (Box)', path: '/reports/daily-summary-box' },
                { label: 'Total Box Balance', path: '/reports/total-box-balance' },
              ]}
            />
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
                  items={[
                    { label: 'Cash Sales', path: '/sales-entry' },
                    { label: 'Sales Summary', path: '/load-wise-list' },
                  ]}
                />

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
                  items={[
                    { label: 'Box Sale', path: '/fish-box-sent' },
                    { label: 'Box Receive', path: '/fish-box-received' },
                    { label: 'Multiple Box Receive', path: '/multiple-box-update' },
                    { label: 'Box Sales List', path: '/box-sales-list' },
                  ]}
                />


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
                  items={[
                    { label: 'Customer', path: '/create-customer' },
                    { label: 'Party', path: '/create-party' },
                    { label: 'Salesman', path: '/create-salesman' },
                    { label: 'Item', path: '/create-item' },
                  ]}
                />

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
                  items={[
                    { label: 'Daily Collection Sheet', path: '/reports/daily-collection' },
                    { label: 'Sales Register', path: '/reports/sales-register' },
                    { label: 'Daily Summary', path: '/reports/daily-summary' },
                    { label: 'Statement Report', path: '/reports/statement' },
                    { label: 'Box Receive Report', path: '/reports/box-receive' },
                    { label: 'Daily Summary (Box)', path: '/reports/daily-summary-box' },
                    { label: 'Total Box Balance', path: '/reports/total-box-balance' },
                  ]}
                />

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
