import { Fish } from 'lucide-react';

const Brand: React.FC = () => (
  <div className="flex items-center space-x-3">
    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg">
      <Fish className="w-6 h-6 text-blue-700 dark:text-blue-300" />
    </div>
    <div>
      <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Fishow</h1>
      <p className="text-xs text-gray-600 dark:text-gray-300">Popular Fish ERP</p>
    </div>
  </div>
);

export default Brand;
