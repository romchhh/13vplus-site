"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  PRODUCT_GENDERS,
  PRODUCT_GENDER_SHORT_LABELS,
  buildCatalogUrl,
  parseProductGender,
  type ProductGender,
} from "@/lib/productGender";

interface CatalogGenderTabsProps {
  className?: string;
}

export default function CatalogGenderTabs({ className = "" }: CatalogGenderTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeGender = parseProductGender(searchParams.get("gender"));

  if (!activeGender || pathname !== "/catalog") {
    return null;
  }

  const category = searchParams.get("category");
  const subcategory = searchParams.get("subcategory");
  const season = searchParams.get("season");

  return (
    <div className={`flex gap-2 ${className}`}>
      {PRODUCT_GENDERS.map((gender) => {
        const isActive = activeGender === gender;
        return (
          <Link
            key={gender}
            href={buildCatalogUrl({ gender, category, subcategory, season })}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold font-['Montserrat'] uppercase tracking-wider transition-all duration-200 ${
              isActive
                ? "bg-black text-white"
                : "bg-gray-100 text-black/70 hover:bg-gray-200 hover:text-black"
            }`}
          >
            {PRODUCT_GENDER_SHORT_LABELS[gender]}
          </Link>
        );
      })}
    </div>
  );
}

export function CatalogGenderSidebarToggle({
  gender,
  onChange,
}: {
  gender: ProductGender;
  onChange: (gender: ProductGender) => void;
}) {
  return (
    <div className="px-4 py-4 border-b border-black/10 bg-neutral-50">
      <p className="text-xs font-semibold uppercase tracking-wider text-black/50 mb-3">
        Колекція
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PRODUCT_GENDERS.map((value) => {
          const isActive = gender === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`px-3 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? "bg-black text-white"
                  : "bg-white text-black border border-black/10 hover:border-black/30"
              }`}
            >
              {PRODUCT_GENDER_SHORT_LABELS[value]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
