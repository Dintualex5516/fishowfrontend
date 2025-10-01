import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import Login from './features/auth/Login';
import BoxSalesList from './features/BoxSales/BoxSalesList';
import FishBoxReceivedForm from './features/BoxSales/FishBoxReceivedForm';
import FishBoxSentForm from './features/BoxSales/FishBoxSentForm';
import MultipleBoxReceiveUpdate from './features/BoxSales/MultipleBoxReceiveUpdate';
import CustomerPage from './features/customers/CustomerPage';
import Dashboard from './features/dashboard/Dashboard';
import SalesEntryForm from './features/sales/SalesEntryForm';
import LoadWiseList from './features/sales/SalesSummary';

import ItemPage from './features/items/ItemPage';
import PartyPage from './features/parties/PartyPage';
import Reports from './features/reports/Reports';
import SalesmanPage from './features/salesmen/SalesmanPage';
import SignUp from './features/auth/SignUp';


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales-entry" element={<SalesEntryForm />} />
          <Route path="/load-wise-list" element={<LoadWiseList />} />
          <Route path="/fish-box-sent" element={<FishBoxSentForm />} />
          <Route path="/fish-box-received" element={<FishBoxReceivedForm />} />
          <Route
            path="/multiple-box-update"
            element={<MultipleBoxReceiveUpdate />}
          />
          <Route path="/box-sales-list" element={<BoxSalesList />} />
          <Route path="/create-customer" element={<CustomerPage />} />
          <Route path="/create-party" element={<PartyPage />} />
          <Route path="/create-salesman" element={<SalesmanPage />} />
          <Route path="/create-item" element={<ItemPage />} />
          <Route path="/reports/:reportType" element={<Reports />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
