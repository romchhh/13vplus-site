"use client";

import Image from "next/image";

const FEATURES = [
  {
    icon: "/images/choice-features/original-product.png",
    text: "Оригінальна продукція Choice",
  },
  {
    icon: "/images/choice-features/health-care-home.png",
    text: "Продукти для здоров'я, догляду і дому",
  },
  {
    icon: "/images/choice-features/plant-formulas.png",
    text: "Рослинні формули",
  },
  {
    icon: "/images/choice-features/official-badge.png",
    text: "Офіційний представник бренду",
  },
  {
    icon: "/images/choice-features/consultation.png",
    text: "Консультація з підбору продуктів",
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full bg-white border-y border-[#fce4ec]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-10 lg:py-14">
        <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-8">
          {FEATURES.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 flex-1 min-w-[200px] max-w-[280px]"
            >
              <div className="relative w-8 h-8 lg:w-9 lg:h-9 flex-shrink-0">
                <Image
                  src={item.icon}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="36px"
                />
              </div>
              <p className="text-[#3D1A00] font-['Montserrat'] font-normal text-xs lg:text-sm leading-tight uppercase text-left">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
