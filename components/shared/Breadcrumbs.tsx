"use client";

import Link from "next/link";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm font-['Montserrat']">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.url} className="flex items-center">
              {!isLast ? (
                <>
                  <Link
                    href={item.url}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                    aria-current={undefined}
                  >
                    {item.name}
                  </Link>
                  <span className="mx-2 text-gray-400" aria-hidden="true">
                    /
                  </span>
                </>
              ) : (
                <span className="text-gray-900 font-medium" aria-current="page">
                  {item.name}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

