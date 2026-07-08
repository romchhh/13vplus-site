"use client";

import {
  PRODUCT_GENDERS,
  PRODUCT_GENDER_LABELS,
  DEFAULT_PRODUCT_GENDER,
  parseProductGender,
  type ProductGender,
} from "@/lib/productGender";

interface ProductGenderFieldProps {
  value: ProductGender;
  onChange: (value: ProductGender) => void;
}

export default function ProductGenderField({ value, onChange }: ProductGenderFieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Для кого</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRODUCT_GENDERS.map((gender) => {
          const selected = value === gender;
          return (
            <button
              key={gender}
              type="button"
              onClick={() => onChange(gender)}
              className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                selected
                  ? "border-black bg-black text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-900 hover:border-gray-400"
              }`}
            >
              <span className="block text-sm font-semibold">{PRODUCT_GENDER_LABELS[gender]}</span>
              <span className={`block text-xs mt-1 ${selected ? "text-white/70" : "text-gray-500"}`}>
                {gender === DEFAULT_PRODUCT_GENDER ? "За замовчуванням" : "Чоловіча колекція"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function parseProductGenderField(value: unknown): ProductGender {
  return parseProductGender(typeof value === "string" ? value : null) ?? DEFAULT_PRODUCT_GENDER;
}
