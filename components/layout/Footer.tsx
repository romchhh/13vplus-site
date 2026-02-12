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
      // Якщо вже на головній сторінці, просто прокручуємо до якоря
      const element = document.getElementById(anchor.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Якщо на іншій сторінці, переходимо на головну з якорем
      router.push(`/${anchor}`);
      // Після переходу прокручуємо до якоря
      setTimeout(() => {
        const element = document.getElementById(anchor.replace("#", ""));
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };
  return (
    <footer className="w-full bg-black text-white border-t border-white/10">
      {/* Main footer content */}
      <div className="max-w-[1920px] mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 items-center md:items-start text-center md:text-left">
          {/* Brand Column */}
          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <Link href="/" className="inline-block">
              <Image
                src="/images/tg_image_3614117882.png"
                alt="13VPLUS Logo"
                width={180}
                height={60}
                className="h-10 lg:h-12 w-auto"
              />
            </Link>
            <p className="text-sm lg:text-base text-white/70 leading-relaxed w-full text-left tracking-normal">
              Український бренд жіночого одягу. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/80">
              <p className="font-medium text-left tracking-normal">Індивідуальний пошив</p>
              <p className="text-white/70 text-left tracking-normal">
                Ми відшиваємо під замовлення будь-який наш виріб у вашому розмірі. Ідеальна посадка гарантована.
              </p>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Навігація</h3>
            <nav className="flex flex-row md:flex-col gap-3 flex-nowrap md:flex-wrap justify-center md:justify-start w-full">
              <Link
                href="/catalog"
                className="text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Каталог
              </Link>
              <Link
                href="/#about"
                onClick={(e) => handleAnchorClick(e, "#about")}
                className="text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Про нас
              </Link>
              <Link
                href="/info"
                className="text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Доставка та оплата
              </Link>
              <Link
                href="/#reviews"
                className="text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 whitespace-nowrap tracking-normal"
              >
                Відгуки
              </Link>
            </nav>
          </div>

          {/* Information Column */}
          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Інформація</h3>
            <nav className="flex flex-row md:flex-col gap-3 flex-wrap justify-center md:justify-start">
              <Link
                href="/privacy-policy"
                className="text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 tracking-normal"
              >
                Політика конфіденційності
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 tracking-normal"
              >
                Договір оферти
              </Link>
              <Link
                href="/#contacts"
                onClick={(e) => handleAnchorClick(e, "#contacts")}
                className="text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 tracking-normal"
              >
                Контакти
              </Link>
              <Link
                href="https://share.google/M30THNhEWfigvRjzs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 tracking-normal"
              >
                Документи
              </Link>
            </nav>
          </div>

          {/* Social & Contact Column */}
          <div className="flex flex-col gap-5 items-center md:items-start max-w-md mx-auto md:mx-0">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Зв&apos;язок</h3>
            <div className="flex flex-row md:flex-col gap-3 flex-wrap justify-center md:justify-start">
              <Link
                href="https://www.instagram.com/13vplus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 group tracking-normal"
              >
                <Image
                  src="/images/instagram-icon.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity brightness-0 invert"
                />
                <span>Instagram</span>
              </Link>
              <Link
                href="https://www.tiktok.com/@13vplus?_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 group tracking-normal"
              >
                <svg
                  className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="TikTok"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span>TikTok</span>
              </Link>
              <Link
                href="https://t.me/b_13vplus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm lg:text-base text-white/70 hover:text-white transition-colors duration-300 group tracking-normal"
              >
                <svg
                  className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Telegram"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                </svg>
                <span>Telegram</span>
              </Link>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-white/50 text-justify sm:text-left tracking-normal">
                Більше відгуків дивіться у нашому Instagram профілі
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - All in one block */}
      <div className="border-t border-white/10">
        <div className="max-w-[1920px] mx-auto px-6 py-5">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs lg:text-sm text-white/50">
              <span className="tracking-normal">© {new Date().getFullYear()} 13VPLUS. Всі права захищені.</span>
            </div>
            <div>
              <Link
                href="https://new.telebots.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-semibold font-['Montserrat'] text-white hover:text-white/80 transition-colors tracking-wide"
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
