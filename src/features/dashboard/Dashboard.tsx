import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminBoard from '../../components/AdminBoard';
import { TruckIcon, Package, BarChart3, Users } from 'lucide-react';
import { getDashboardMetrics } from "../../lib/dashboardApi";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

   const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    activeCustomers: 0,
    boxesTotal: 0,
    boxesItems: 0,
    boxesBoxSale: 0,
    activeParties: 0,
  });

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const m = await getDashboardMetrics();
        setMetrics({
          totalSales: m.totalSales,
          activeCustomers: m.activeCustomers,
          boxesTotal: m.boxes.totalBoxes,
          boxesItems: m.boxes.itemsBoxes,
          boxesBoxSale: m.boxes.boxSaleBoxes,
          activeParties: m.activeParties,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const nf = new Intl.NumberFormat();
  const stats = [
    {
      name: 'Total Sales',
      value: nf.format(metrics.totalSales),
      icon: BarChart3,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Customers',
       value: nf.format(metrics.activeCustomers),
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Boxes Sent',
      value: nf.format(metrics.boxesTotal),
      icon: Package,
      color: 'bg-purple-500',
    },
    {
      name: 'Active Parties',
      value: nf.format(metrics.activeParties),
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-700 dark:text-gray-200 mt-2">Welcome to Fishow ERP System</p>
        </div>

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div> */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-600"
              title={(stat as any).tooltip || ""}
            >
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/sales-entry')}
              className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">New Sales Entry</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Create a new sales entry form
              </p>
            </button>
            <button
              onClick={() => navigate('/load-wise-list')}
              className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">View Load List</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Check load wise sales data
              </p>
            </button>
            <button
              onClick={() => navigate('/fish-box-sent')}
              className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
            >
              <h3 className="font-medium text-gray-900 dark:text-white">Send Fish Boxes</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                Record fish box shipments
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
