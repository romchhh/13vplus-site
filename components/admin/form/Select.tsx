import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  value?: string; // ✅ Use controlled value instead of defaultValue
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    onChange(selected);
  };

  return (
    <select
      className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${value ? "text-gray-900" : "text-gray-500"} ${className}`}
      value={value || ""} // fallback to empty string
      onChange={handleChange}
    >
      {/* Placeholder */}
      <option
        value=""
        disabled
        className="text-gray-500 bg-white"
      >
        {placeholder}
      </option>

      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="text-gray-900 bg-white"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
