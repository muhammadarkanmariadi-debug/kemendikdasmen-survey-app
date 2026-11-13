'use client';

import { useState, useEffect, useRef } from 'react';

type Option = {
  value: string;
  label: string;
};

type SearchableSelectProps = {
  options: Option[];
  value: string | null; // selected value
  onChange: (selectedValue: string) => void;
};

export default function SearchableSelect({ options, value, onChange }: SearchableSelectProps) {
  const [dropdownQuery, setDropdownQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || null;

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.label.toLowerCase().includes(dropdownQuery.toLowerCase())
      )
    );
  }, [dropdownQuery, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setDropdownQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (option: Option) => {
    onChange(option.value); // Notify parent
    setIsOpen(false);
    setDropdownQuery('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Main display (shows selected label) */}
      <div
        className="w-full border p-2 cursor-pointer rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOption ? selectedOption.label : 'Select...'}
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full bg-white border mt-1 shadow max-h-60 overflow-auto">
          {/* Dropdown Search Input */}
          <input
            type="text"
            className="w-full border-b p-2"
            placeholder="Search..."
            value={dropdownQuery}
            onChange={(e) => setDropdownQuery(e.target.value)}
            autoFocus
          />

          {/* Filtered Options */}
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option: { value: string; label: string; }) => (
              <div
                key={option.value}
                className="p-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No results found.</div>
          )}
        </div>
      )}
    </div>
  );
}
