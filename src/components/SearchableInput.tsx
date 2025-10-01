import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';

interface SearchableInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchData: Array<{ id: string; name: string; [key: string]: any }>;
  onSelect: (item: any) => void;
  createRoute: string;
  entityType: string;
  className?: string;
  disabled?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
  'data-field'?: string;
  'data-item-id'?: string;
}

const SearchableInput: React.FC<SearchableInputProps> = ({
  value,
  onChange,
  placeholder,
  searchData,
  onSelect,
  createRoute,
  entityType,
  className = '',
  disabled = false,
  onKeyDown,
  onEnter,
  'data-field': dataField,
  'data-item-id': dataItemId,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<Array<{ id: string; name: string; [key: string]: any }>>([]);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string; [key: string]: any } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set selected item when value changes externally
    if (value && searchData && Array.isArray(searchData)) {
      const item = searchData.find(item => item && item.id === value);
      if (item) {
        setSelectedItem(item);
        setSearchTerm(item.name || '');
      } else {
        // If value is not an ID (e.g., manually typed name), set searchTerm to value
        setSelectedItem(null);
        setSearchTerm(value);
      }
    } else {
      // If value is empty or searchData is not available, clear everything
      setSelectedItem(null);
      setSearchTerm('');
    }
  }, [value, searchData]);

  useEffect(() => {
    if (!searchData || !Array.isArray(searchData)) {
      setFilteredData([]);
      return;
    }

    if (searchTerm.trim() === '') {
      // Show all options when search term is empty
      setFilteredData(searchData);
      return;
    }

    const filtered = searchData.filter(item =>
      item && item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, searchData]);

  // Reset highlighted index when dropdown opens/closes or filtered data changes
  useEffect(() => {
    if (isOpen && filteredData.length > 0) {
      setHighlightedIndex(0); // Start with first item highlighted
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen, filteredData.length]);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && dropdownRef.current && filteredData.length > 0) {
      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        const highlightedElement = dropdownRef.current?.querySelector(`[data-item-index="${highlightedIndex}"]`) as HTMLElement;
        if (highlightedElement && dropdownRef.current) {
          // Check if element is already visible
          const container = dropdownRef.current;
          const elementTop = highlightedElement.offsetTop;
          const elementBottom = elementTop + highlightedElement.offsetHeight;
          const containerTop = container.scrollTop;
          const containerBottom = containerTop + container.clientHeight;

          // Only scroll if element is not fully visible
          if (elementTop < containerTop || elementBottom > containerBottom) {
            highlightedElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest'
            });
          }
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [highlightedIndex, isOpen, filteredData.length]);

  // Handle edge case: scroll first item into view when dropdown opens
  useEffect(() => {
    if (isOpen && filteredData.length > 0 && highlightedIndex === 0 && dropdownRef.current) {
      const firstElement = dropdownRef.current.querySelector(`[data-item-index="0"]`) as HTMLElement;
      if (firstElement) {
        // Ensure first item is visible when dropdown opens
        firstElement.scrollIntoView({
          behavior: 'auto',
          block: 'nearest'
        });
      }
    }
  }, [isOpen, filteredData.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle window resize and scroll to reposition dropdown
  useEffect(() => {
    const handleReposition = () => {
      if (isOpen && wrapperRef.current) {
        // Force re-render to update position
        setIsOpen(true);
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleReposition, true);
      window.addEventListener('resize', handleReposition);
    }

    return () => {
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen]);

  // Calculate dropdown position to prevent overflow
  const getDropdownPosition = () => {
    if (!wrapperRef.current) return { top: 0, left: 0, width: 200 };

    const rect = wrapperRef.current.getBoundingClientRect();
    const dropdownHeight = 240; // max-h-60 = 240px
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let top = rect.bottom + window.scrollY + 4;
    let left = rect.left + window.scrollX;

    // Adjust if dropdown would go off bottom of screen
    if (top + dropdownHeight > windowHeight + window.scrollY) {
      top = rect.top + window.scrollY - dropdownHeight - 4;
    }

    // Adjust if dropdown would go off right edge of screen
    const width = rect.width;
    if (left + width > windowWidth + window.scrollX) {
      left = windowWidth + window.scrollX - width - 10;
    }

    return { top, left, width };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newValue = e.target.value;
      setSearchTerm(newValue);

      // Always show dropdown when typing (even for empty string to show all options)
      setIsOpen(true);

      // Call onChange for every keystroke to support filtering
      if (onChange) {
        onChange(newValue);
      }

      if (newValue === '') {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Error in SearchableInput handleInputChange:', error);
    }
  };

  const handleSelect = (item: { id: string; name: string; [key: string]: any }) => {
    try {
      setSelectedItem(item);
      setSearchTerm(item.name || '');
      setIsOpen(false);
      if (onChange) {
        onChange(item.id);
      }
      if (onSelect) {
        onSelect(item);
      }
    } catch (error) {
      console.error('Error in SearchableInput handleSelect:', error);
    }
  };

  const handleCreateNew = () => {
    navigate(createRoute);
  };

  const handleClear = () => {
    try {
      setSelectedItem(null);
      setSearchTerm('');
      if (onChange) {
        onChange('');
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error in SearchableInput handleClear:', error);
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    try {
      if (isOpen) {
        // Handle dropdown navigation
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setHighlightedIndex(prev => {
            const next = prev < filteredData.length - 1 ? prev + 1 : prev;
            return next;
          });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setHighlightedIndex(prev => {
            const next = prev > 0 ? prev - 1 : prev;
            return next;
          });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredData.length) {
            // Select the highlighted item
            handleSelect(filteredData[highlightedIndex]);
          } else if (filteredData.length > 0) {
            // If no item is highlighted but there are items, select the first one
            handleSelect(filteredData[0]);
          } else {
            // No items available, call onEnter if provided, otherwise close dropdown
            if (onEnter) {
              onEnter();
            } else {
              setIsOpen(false);
            }
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
        }
      } else {
        // For Enter key when dropdown is closed, call onEnter if provided
        if (e.key === 'Enter' && onEnter) {
          onEnter();
        } else if (onKeyDown) {
          // For all other cases, call parent's onKeyDown
          onKeyDown(e);
        }
      }
    } catch (error) {
      console.error('Error in SearchableInput handleKeyDown:', error);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`} data-field={dataField} data-item-id={dataItemId}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {selectedItem ? (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (() => {
        const position = getDropdownPosition();
        return (
          <div
            ref={dropdownRef}
            className="fixed z-[1000] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
            style={{
              width: `${position.width}px`,
              top: `${position.top}px`,
              left: `${position.left}px`
            }}
          >
            {filteredData.length > 0 ? (
              <>
                {filteredData.map((item, index) => (
                  <div
                    key={item.id}
                    data-item-index={index}
                    onClick={() => handleSelect(item)}
                    className={`px-3 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                      index === highlightedIndex
                        ? 'bg-blue-100 dark:bg-blue-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className={`font-medium ${
                      index === highlightedIndex
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {item.name}
                    </div>
                    {item.id && (
                      <div className={`text-sm ${
                        index === highlightedIndex
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        ID: {item.id}
                      </div>
                    )}
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-600">
                  <button
                    onClick={handleCreateNew}
                    className="w-full px-3 py-2 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-2"
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create new {entityType}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="px-3 py-4 text-center">
                <div className="text-gray-500 dark:text-gray-400 mb-2">
                  {searchTerm.trim() !== '' ? `No ${entityType} found` : `No ${entityType} available`}
                </div>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center space-x-2 mx-auto"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create new {entityType}</span>
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default SearchableInput;
