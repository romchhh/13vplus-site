"use client";

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-white text-black border-t border-black/10">
      {/* Main footer content */}
      <div className="max-w-[1920px] mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="inline-block">
              <Image
                src="/images/13VPLUS BLACK PNG 2.png"
                alt="13VPLUS Logo"
                width={180}
                height={60}
                className="h-10 lg:h-12 w-auto"
              />
            </Link>
            <p className="text-sm lg:text-base text-black/70 leading-relaxed max-w-xs">
              Український бренд жіночого одягу. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі.
            </p>
            <div className="flex flex-col gap-2 text-sm text-black/80">
              <p className="font-medium">Індивідуальний пошив</p>
              <p className="text-black/70">
                Ми відшиваємо під замовлення будь-який наш виріб у вашому розмірі. Ідеальна посадка гарантована.
              </p>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="flex flex-col gap-5">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Навігація</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/catalog"
                className="text-sm lg:text-base text-black/70 hover:text-black transition-colors duration-300"
              >
                Каталог
              </Link>
              <Link
                href="/#about"
                className="text-sm lg:text-base text-black/70 hover:text-black transition-colors duration-300"
              >
                Про нас
              </Link>
              <Link
                href="/#payment-and-delivery"
                className="text-sm lg:text-base text-black/70 hover:text-black transition-colors duration-300"
              >
                Доставка та оплата
              </Link>
              <Link
                href="/#reviews"
                className="text-sm lg:text-base text-black/70 hover:text-black transition-colors duration-300"
              >
                Відгуки
              </Link>
            </nav>
          </div>

          {/* Information Column */}
          <div className="flex flex-col gap-5">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Інформація</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/privacy-policy"
                className="text-sm lg:text-base text-black/70 hover:text-black transition-colors duration-300"
              >
                Політика конфіденційності
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm lg:text-base text-black/70 hover:text-black transition-colors duration-300"
              >
                Договір оферти
              </Link>
              <Link
                href="/#contacts"
                className="text-sm lg:text-base text-black/70 hover:text-black transition-colors duration-300"
              >
                Контакти
              </Link>
            </nav>
          </div>

          {/* Social & Contact Column */}
          <div className="flex flex-col gap-5">
            <h3 className="text-base lg:text-lg font-semibold uppercase tracking-wider">Зв&apos;язок</h3>
            <div className="flex flex-col gap-3">
              <Link
                href="https://www.instagram.com/13vplus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm lg:text-base text-black/70 hover:text-black transition-colors duration-300 group"
              >
                <Image
                  src="/images/instagram-icon.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span>Instagram</span>
              </Link>
            </div>
            <div className="pt-4 border-t border-black/10">
              <p className="text-xs text-black/50">
                Більше відгуків дивіться у нашому Instagram профілі
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section - All in one block */}
      <div className="border-t border-black/10">
        <div className="max-w-[1920px] mx-auto px-6 py-5">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs lg:text-sm text-black/50">
              <span>© {new Date().getFullYear()} 13VPLUS. Всі права захищені.</span>
            </div>
            <div>
              <Link
                href="https://telebots.site/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm sm:text-base font-semibold font-['Montserrat'] text-black/60 hover:text-black/80 transition-colors tracking-wide"
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
