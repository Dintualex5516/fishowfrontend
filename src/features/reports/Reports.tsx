import React, { useState, useEffect } from 'react';
import { supabase } from '../../database/supabase';
import { useNavigate, useParams } from 'react-router-dom';

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};
import AdminBoard from '../../components/AdminBoard';
import DailyCollectionSheet from './DailyCollectionSheet';
import SalesRegister from './SalesRegister';
import DailySummary from './DailySummary';
import { getDailySummary } from '../../lib/ledgerApi';
// import StatementReport from './StatementReport';
import BoxReceiveReport from './BoxReceiveReport';
import DailySummaryBox from './DailySummaryBox';
import TotalBoxBalance from './TotalBoxBalance';


const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { reportType } = useParams<{ reportType: string }>();
  const currentReportType = reportType || 'daily-collection';

  const [dateRange, setDateRange] = useState(() => {
    const today = getCurrentDate();
    const isSingleDateReport = currentReportType === 'total-box-balance' || currentReportType === 'daily-summary-box' || currentReportType === 'daily-summary' || currentReportType === 'sales-register';
    return isSingleDateReport ? { startDate: '', endDate: '' } : { startDate: today, endDate: today };
  });
  const [singleDate, setSingleDate] = useState(() =>
    currentReportType === 'total-box-balance' ||
    currentReportType === 'daily-summary-box' ||
    currentReportType === 'daily-summary' ||
    currentReportType === 'daily-collection' ||
    currentReportType === 'sales-register'
      ? getCurrentDate()
      : ''
  );
  const [dailySummaryTotal, setDailySummaryTotal] = useState<number>(0);

  const reportComponents: { [key: string]: React.ComponentType<any> } = {
    'daily-collection': DailyCollectionSheet,
    'sales-register': SalesRegister,
    'daily-summary': DailySummary,
    // 'statement': StatementReport,
    'box-receive': BoxReceiveReport,
    'daily-summary-box': DailySummaryBox,
    'total-box-balance': TotalBoxBalance,
  };

  const reportTitles: { [key: string]: string } = {
    'daily-collection': 'Daily Collection Sheet',
    'sales-register': 'Sales Register',
    'daily-summary': 'Daily Summary',
    // 'statement': 'Statement Report',
    'box-receive': 'Box Receive Report',
    'daily-summary-box': 'Daily Summary (Box)',
    'total-box-balance': 'Total Box Balance',
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };



  const ReportComponent = reportComponents[currentReportType];

  // Set current date when switching to single-date reports if not already set
  useEffect(() => {
    const isSingleDateReport =
      currentReportType === 'total-box-balance' ||
      currentReportType === 'daily-summary-box' ||
      currentReportType === 'daily-summary' ||
      currentReportType === 'daily-collection' ||
      currentReportType === 'sales-register';
    if (isSingleDateReport && !singleDate) {
      setSingleDate(getCurrentDate());
    }
  }, [currentReportType, singleDate]);

  // Initialize date range to today when switching to a date-range report if empty
  useEffect(() => {
    const isDateRangeReport = currentReportType !== 'total-box-balance' && currentReportType !== 'daily-summary-box' && currentReportType !== 'daily-summary' && currentReportType !== 'sales-register';
    if (isDateRangeReport && (!dateRange.startDate || !dateRange.endDate)) {
      const today = getCurrentDate();
      setDateRange({ startDate: today, endDate: today });
    }
  }, [currentReportType, dateRange.startDate, dateRange.endDate]);

  // Fetch total sale for Daily Summary when date changes
  // useEffect(() => {
  //   const fetchDailySummaryTotal = async () => {
  //     if (currentReportType !== 'daily-summary' || !singleDate) {
  //       setDailySummaryTotal(0);
  //       return;
  //     }
  //     const { data, error } = await supabase
  //       .from('sales')
  //       .select('total_amount')
  //       .eq('date', singleDate);
  //     if (error) {
  //       setDailySummaryTotal(0);
  //       return;
  //     }
  //     const total = (data || []).reduce((sum: number, row: any) => sum + (Number(row.total_amount) || 0), 0);
  //     setDailySummaryTotal(total);
  //   };
  //   fetchDailySummaryTotal();
  // }, [currentReportType, singleDate]);

  useEffect(() => {
  const fetchDailySummaryTotal = async () => {
    if (currentReportType !== 'daily-summary' || !singleDate) {
      setDailySummaryTotal(0);
      return;
    }
    try {
      const res = await getDailySummary(singleDate);
      setDailySummaryTotal(Number(res.totals.grandTotal) || 0);
    } catch (e) {
      console.error(e);
      setDailySummaryTotal(0);
    }
  };
  fetchDailySummaryTotal();
}, [currentReportType, singleDate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <AdminBoard />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {reportTitles[currentReportType] || 'Reports'}
              </h1>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Date Filter - Only show for reports that need it */}
        {currentReportType !== 'total-box-balance' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4 mb-4">
            {currentReportType === 'daily-summary-box' || currentReportType === 'daily-summary' || currentReportType === 'daily-collection' || currentReportType === 'sales-register' ? (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Select Date:
                </label>
                <input
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                {(currentReportType === 'daily-summary') && (
                  <div className="ml-auto text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total Sale: <span className="text-gray-900 dark:text-white">₹{dailySummaryTotal.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Date Range:
                </label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange(e.target.value, dateRange.endDate)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <span className="text-gray-500 dark:text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange(dateRange.startDate, e.target.value)}
                  className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
            )}
          </div>
        )}


        {/* Report Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-4">
          {ReportComponent ? (
            currentReportType === 'total-box-balance' ? (
              <ReportComponent />
            ) : currentReportType === 'daily-summary-box' ? (
              <ReportComponent date={singleDate} />
            ) : currentReportType === 'daily-summary' ? (
              <ReportComponent date={singleDate} />
            ) : currentReportType === 'daily-collection' ? (
              <ReportComponent date={singleDate} />
            ) : currentReportType === 'sales-register' ? (
              <ReportComponent date={singleDate} />
            ) : (
              <ReportComponent dateRange={dateRange} />
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Report not found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;