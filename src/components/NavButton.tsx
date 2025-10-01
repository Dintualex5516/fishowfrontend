interface NavButtonProps {
  label: string;
  onClick: () => void;
}
const NavButton: React.FC<NavButtonProps> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all font-medium"
  >
    {label}
  </button>
);

export default NavButton;
