import React, { FC } from "react";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  defaultValue?: string | number;
  value?: string | number; // <-- Added value prop
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string; // Optional hint text
  list?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  defaultValue,
  value, // <-- Added value prop
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  list,
}) => {
  // Determine input styles based on state (disabled, success, error)
  let inputClasses = `h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 ${className}`;

  // Add styles for the different states
  if (disabled) {
    inputClasses += ` bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed`;
  } else if (error) {
    inputClasses += ` bg-white text-gray-900 border-red-500 focus:ring-red-500/20 focus:border-red-500`;
  } else if (success) {
    inputClasses += ` bg-white text-gray-900 border-green-500 focus:ring-green-500/20 focus:border-green-500`;
  } else {
    inputClasses += ` bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20`;
  }

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
        list={list}
      />

      {/* Optional Hint Text */}
      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
