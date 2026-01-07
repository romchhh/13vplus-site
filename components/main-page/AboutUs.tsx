"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutUs() {
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  return (
    <section
      id="about"
      className="scroll-mt-20 max-w-[1920px] mx-auto w-full px-6 py-12 lg:py-16 relative overflow-hidden bg-white"
    >
      <div className="flex flex-col items-center gap-6 lg:gap-8">
        {/* Title */}
        <div className="text-black text-center text-3xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider">
          Про нас
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-4 lg:space-y-6">
          <p className="text-lg lg:text-2xl font-normal font-['Montserrat'] text-black/80 leading-relaxed">
            13vplus — це бренд жіночого одягу про індивідуальність, свободу бути собою та любов у кожній деталі. Ми створюємо одяг не &laquo;під стандарти&raquo;, а під жінку. Під її настрій. Фігуру. Ритм життя. Сьогодні вона ніжна, завтра зухвала. І це нормально. Ми віримо: жінка має право бути різною. Наші колекції — це продумані образи, які легко поєднуються між собою. Ми не прив&apos;язані до однієї кольорової гами, або сілуєту, але завжди думаємо про гармонію, щоб речі з гардероба працювали разом, а не лежали &laquo;на потім&raquo;.
          </p>

          <div className="py-4 lg:py-6 border-t border-black/20">
            <p className="text-xl lg:text-3xl font-medium font-['Montserrat'] text-black leading-relaxed mb-4 lg:mb-6">
              Що для нас важливо
            </p>
            <div className="text-left space-y-3 lg:space-y-4 max-w-2xl mx-auto">
              <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
                • комфорт без компромісів
              </p>
              <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
                • якість, яку не лише видно з першого погляду, а й відчуваєш на дотик.
              </p>
              <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
                • силуети, що підкреслюють переваги та делікатно приховують зайве
              </p>
              <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
                • одяг, який не маскує, а розкриває особистість
              </p>
              <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
                • жіночність і тонка сексуальність — без виклику, але з характером
              </p>
              <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
                • наші речі це коли дорого виглядаєш без надмірності
              </p>
            </div>
          </div>

          {/* Individual Tailoring Section */}
          <div className="mt-6 lg:mt-8 space-y-4 lg:space-y-6">
            <div className="pt-4 lg:pt-6 pb-2 lg:pb-3 border-t border-black/20">
              <p className="text-xl lg:text-3xl font-medium font-['Montserrat'] text-black leading-relaxed mb-4 lg:mb-6">
                Наші переваги
              </p>
              <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed mb-3 lg:mb-4">
                З будь-якого обраного одягу в нашому магазині ми пошиємо річ індивідуально під вашу фігуру та зріст.
              </p>
              <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed mb-3 lg:mb-4">
                Ми шиємо для будь-якої фігури, адже краса не має розміру. Кожна річ — це про впевненість, жіночність і відчуття: «я собі подобаюсь».
              </p>
              <p className="text-xl lg:text-3xl font-medium font-['Montserrat'] text-black leading-relaxed mt-6 lg:mt-8">
                13vplus — це не просто одяг.
              </p>
              <p className="text-xl lg:text-3xl font-medium font-['Montserrat'] text-black leading-relaxed">
                Це стан. Це вибір. Це любов у кожній нитці.
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="w-full mt-4 lg:mt-6 max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-6 lg:mb-8">
            <h3 className="text-2xl lg:text-4xl font-bold font-['Montserrat'] uppercase tracking-wider text-black mb-2 lg:mb-3">
              Ми ближче,
              <br />
              ніж здається!
            </h3>
            <p className="text-base lg:text-lg font-normal font-['Montserrat'] text-black/80 leading-relaxed">
              Лімітована колекція — для тих кому важлива унікальність.
            </p>
          </div>

          {/* Screens with Buttons */}
          <div className="flex flex-row gap-2 sm:gap-3 lg:gap-4 justify-center items-start px-2 sm:px-0 flex-wrap sm:flex-nowrap">
            {/* TikTok Screen */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <Link
                href="https://www.tiktok.com/@13vplus?_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-black text-white hover:bg-black/90 transition-colors duration-300 font-['Montserrat'] font-medium uppercase tracking-wider text-sm sm:text-sm lg:text-base"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                МИ В TIKTOK
              </Link>
              <Link
                href="https://www.tiktok.com/@13vplus?_r=1"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setEnlargedImage("/images/Group 1000007075.png");
                }}
                className="hidden sm:block relative w-[200px] lg:w-[300px] h-[400px] lg:h-[500px] bg-transparent cursor-pointer group"
              >
                <Image
                  src="/images/Group 1000007075.png"
                  alt="13VPLUS TikTok"
                  fill
                  className="object-contain group-hover:opacity-90 transition-opacity duration-300"
                  sizes="(max-width: 1024px) 200px, 300px"
                />
              </Link>
            </div>

            {/* Instagram Screen */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <Link
                href="https://www.instagram.com/13vplus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-black text-white hover:bg-black/90 transition-colors duration-300 font-['Montserrat'] font-medium uppercase tracking-wider text-sm sm:text-sm lg:text-base"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.22 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                МИ В ІНСТАГРАМ
              </Link>
              <Link
                href="https://www.instagram.com/13vplus"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setEnlargedImage("/images/Group 1000007076.png");
                }}
                className="hidden sm:block relative w-[200px] lg:w-[300px] h-[400px] lg:h-[500px] bg-transparent cursor-pointer group"
              >
                <Image
                  src="/images/Group 1000007076.png"
                  alt="13VPLUS Instagram"
                  fill
                  className="object-contain group-hover:opacity-90 transition-opacity duration-300"
                  sizes="(max-width: 1024px) 200px, 300px"
                />
              </Link>
            </div>

            {/* Telegram Screen */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <Link
                href="https://t.me/b_13vplus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 px-4 py-3 sm:px-4 sm:py-3 lg:px-6 lg:py-4 bg-black text-white hover:bg-black/90 transition-colors duration-300 font-['Montserrat'] font-medium uppercase tracking-wider text-sm sm:text-sm lg:text-base"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Telegram"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                </svg>
                МИ В TELEGRAM
              </Link>
              <Link
                href="https://t.me/b_13vplus"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setEnlargedImage("/Group 1000007085.png");
                }}
                className="hidden sm:block relative w-[200px] lg:w-[300px] h-[400px] lg:h-[500px] bg-transparent cursor-pointer group"
              >
                <Image
                  src="/Group 1000007085.png"
                  alt="13VPLUS Telegram"
                  fill
                  className="object-contain group-hover:opacity-90 transition-opacity duration-300"
                  sizes="(max-width: 1024px) 200px, 300px"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <Image
              src={enlargedImage}
              alt="Enlarged 13VPLUS Collection"
              fill
              className="object-contain"
              sizes="90vw"
            />
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors z-10"
              aria-label="Close"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            {/* Social Media Link Button */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
              <Link
                href={
                  enlargedImage === "/images/Group 1000007075.png"
                    ? "https://www.tiktok.com/@13vplus?_r=1"
                    : "https://www.instagram.com/13vplus"
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-black hover:bg-white/90 transition-colors duration-300 font-['Montserrat'] font-medium uppercase tracking-wider text-sm lg:text-base"
              >
                {enlargedImage === "/images/Group 1000007075.png" ? (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                    МИ В TIKTOK
                  </>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.22 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    МИ В ІНСТАГРАМ
                  </>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
