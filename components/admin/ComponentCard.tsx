import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  return (
    <div
      className={`rounded-xl sm:rounded-2xl border border-gray-300 bg-white shadow-sm ${className}`}
    >
      {/* Card Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-4 md:p-6 bg-white">
        <div className="space-y-4 sm:space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
