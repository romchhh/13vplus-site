"use client";

import Link from "next/link";

export default function AboutUs() {
  return (
    <section
      id="about"
      className="scroll-mt-20 max-w-[1920px] mx-auto w-full px-6 py-12 lg:py-16 relative overflow-hidden bg-[var(--background-warm-yellow)]"
    >
      <div className="flex flex-col items-center gap-6 lg:gap-8">
        <div className="text-black text-center text-3xl lg:text-5xl font-bold font-['Montserrat'] tracking-wider">
          Про бренд Choice
        </div>

        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-lg lg:text-xl font-normal font-['Montserrat'] text-black/85 leading-relaxed tracking-normal">
            Choice — міжнародний eco-wellness бренд, який створює рослинні продукти для підтримки організму, натурального догляду та безпечного простору вдома.
          </p>

          <p className="text-base lg:text-lg font-['Montserrat'] text-black/80 leading-relaxed tracking-normal text-left">
            Асортимент включає:
          </p>
          <ul className="text-base lg:text-lg font-['Montserrat'] text-black/80 leading-relaxed tracking-normal text-left list-disc list-inside space-y-2 max-w-xl mx-auto">
            <li>wellness-комплекси</li>
            <li>продукти для підтримки імунітету і балансу організму</li>
            <li>натуральний догляд за тілом</li>
            <li>eco-засоби для дому та прибирання</li>
          </ul>

          <p className="text-lg font-['Montserrat'] text-black/90 leading-relaxed pt-4">
            Цей сайт належить офіційному представнику Choice і створений для консультації та замовлення оригінальної продукції.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
          <Link
            href="https://www.instagram.com/my_choice_mari"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-black hover:opacity-70 transition-opacity font-['Montserrat'] font-medium"
          >
            Instagram
          </Link>
          <Link
            href="https://t.me/my_choice_mari"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-black hover:opacity-70 transition-opacity font-['Montserrat'] font-medium"
          >
            Telegram
          </Link>
        </div>
      </div>
    </section>
  );
}
