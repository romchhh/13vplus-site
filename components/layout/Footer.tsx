"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();
    if (pathname === "/") {
      const element = document.getElementById(anchor.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      router.push(`/${anchor}`);
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  return (
    <footer className="w-full bg-[#FFF9F0] text-black border-t border-[#3D1A00]/10">
      <div className="max-w-[1920px] mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 items-center md:items-start text-center md:text-left">
          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <Link href="/" className="inline-block">
              <span className="text-2xl lg:text-3xl font-bold font-['Montserrat'] tracking-wide text-black">Choice</span>
            </Link>
            <p className="text-sm lg:text-base text-gray-600 leading-relaxed w-full text-left tracking-normal">
              Офіційний представник бренду Choice в Україні. Wellness-комплекси, натуральний догляд та eco-засоби для здоров&apos;я і дому.
            </p>
            <p className="text-xs text-gray-500 text-left tracking-normal">
              Сайт належить офіційному представнику бренду Choice. Всі продукти є оригінальною продукцією Choice.
            </p>
          </div>

          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Навігація</h3>
            <nav className="flex flex-col gap-3 justify-center md:justify-start w-full">
              <Link
                href="/catalog"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Каталог
              </Link>
              <Link
                href="/info#about"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Про бренд
              </Link>
              <Link
                href="/info#partnership"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Партнерство
              </Link>
              <Link
                href="/info#delivery"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Доставка та оплата
              </Link>
              <Link
                href="/info#faq"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                FAQ
              </Link>
              <Link
                href="/contacts"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Контакти
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Інформація</h3>
            <nav className="flex flex-row md:flex-col gap-3 flex-wrap justify-center md:justify-start">
              <Link
                href="/privacy-policy"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 tracking-normal"
              >
                Політика конфіденційності
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 tracking-normal"
              >
                Договір оферти
              </Link>
            </nav>
          </div>

          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Зв&apos;язок</h3>
            <Link
              href="/contacts"
              className="text-[#3D1A00] hover:opacity-80 transition-opacity font-['Montserrat']"
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(24px, 4vw, 36px)",
                lineHeight: "120%",
                letterSpacing: "0%",
              }}
            >
              ЗВ&apos;ЯЗАТИСЯ З CHOICE
            </Link>
            <div className="flex flex-row md:flex-col gap-3 flex-wrap justify-center md:justify-start">
              <Link
                href="https://www.instagram.com/my_choice_mari"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 group tracking-normal"
              >
                <Image
                  src="/images/instagram-icon.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span>Instagram — @my_choice_mari</span>
              </Link>
              <Link
                href="https://t.me/my_choice_mari"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm lg:text-base text-gray-600 hover:text-black transition-colors duration-300 group tracking-normal"
              >
                <svg
                  className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity text-gray-600 group-hover:text-black"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Telegram"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                </svg>
                <span>Telegram</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#3D1A00]/10">
        <div className="max-w-[1920px] mx-auto px-6 py-5">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs lg:text-sm text-gray-500">
              <span className="tracking-normal">Сайт належить офіційному представнику бренду Choice. Всі продукти є оригінальною продукцією Choice.</span>
            </div>
            <div>
              <Link
                href="https://new.telebots.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-semibold font-['Montserrat'] text-black hover:text-gray-700 transition-colors tracking-wide"
              >
                Telebots | Розробка сайтів
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
