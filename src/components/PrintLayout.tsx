import React from 'react';

interface PrintLayoutProps {
  children: React.ReactNode;
  title: string;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ children, title }) => {
  return (
    <>
      {/* Screen view - hidden in print */}
      <div className="print:hidden">
        {children}
      </div>

      {/* Print view - hidden on screen */}
      <div className="hidden print:block print:p-4 print:text-black print:bg-white print:overflow-visible print:max-w-full print:m-0 print:shadow-none print:border print:border-black print:rounded-none">
        <div className="print-header text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Fishow</h1>
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="border-b-2 border-black mt-4"></div>
        </div>
        <div className="print-content overflow-visible max-w-full m-0 shadow-none border border-black rounded-none">
          {children}
        </div>
        <div className="print-footer text-center mt-6 text-sm">
          <div className="border-t-2 border-black pt-2">
            Thank you for your business!
          </div>
        </div>
      </div>
    </>
  );
};

export default PrintLayout;
