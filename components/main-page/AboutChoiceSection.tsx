"use client";

export default function AboutChoiceSection() {
  return (
    <section className="w-full bg-[#FFF9F0]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-stretch">
          {/* Ліва колонка — текст */}
          <div className="flex flex-col gap-6 text-left">
            <p className="text-[#3D1A00] font-['Montserrat'] font-normal text-[18px] leading-[1.55] lg:text-[32px] lg:leading-[2.3] uppercase" style={{ letterSpacing: "-0.02em" }}>
              CHOICE — міжнародний eco-wellness бренд, який створює рослинні продукти для підтримки організму, натурального догляду та безпечного простору вдома.
            </p>
            <p className="text-[#3D1A00] font-['Montserrat'] font-normal text-[20px] leading-[2.3] text-left" style={{ letterSpacing: "-0.02em" }}>
              Асортимент включає:
            </p>
            <ul className="list-disc list-inside text-[#3D1A00] font-['Montserrat'] font-normal text-[20px] leading-[2.3] space-y-2 text-left" style={{ letterSpacing: "-0.02em" }}>
              <li>wellness-комплекси</li>
              <li>продукти для підтримки імунітету і балансу організму</li>
              <li>натуральний догляд за тілом</li>
              <li>eco-засоби для дому та прибирання</li>
            </ul>
            <p className="text-[#3D1A00] font-['Montserrat'] font-normal text-[20px] leading-[2.3] text-left" style={{ letterSpacing: "-0.02em" }}>
              Цей сайт належить офіційному представнику Choice і створений для консультації та замовлення оригінальної продукції.
            </p>
          </div>

          {/* Права колонка — висота як у текстового блоку */}
          <div
            className="w-full h-full min-h-[280px] lg:min-h-0 bg-gray-200 rounded-lg"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
