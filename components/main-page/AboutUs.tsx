"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function AboutUs() {
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  return (
    <section
      id="about"
      className="scroll-mt-20 max-w-[1920px] mx-auto w-full px-6 py-16 lg:py-24 relative overflow-hidden bg-black"
    >
      <div className="flex flex-col items-center gap-12 lg:gap-16">
        {/* Title */}
        <div className="text-white text-center text-3xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider">
          Про нас
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-6 lg:space-y-10">
          <p className="text-lg lg:text-2xl font-normal font-['Montserrat'] text-white/80 leading-relaxed">
            Ласкаво просимо у світ 13vplus — простір стриманої естетики, продуманих силуетів і сучасного мінімалізму.
            Ми створюємо речі, які доповнюють ритм великого міста та підкреслюють індивідуальність кожного, хто обирає наш бренд.
          </p>

          <div className="py-8 lg:py-12 border-t border-b border-white/20">
            <p className="text-xl lg:text-3xl font-medium font-['Montserrat'] text-white leading-relaxed">
              У 13vplus ми віримо, що стиль починається з деталей. Саме тому працюємо з якісними матеріалами, чистими лініями та комфортними формами, які легко інтегруються у щоденні та особливі образи.
            </p>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-white/70 leading-relaxed">
              Наш підхід — це відповідальне виробництво та свідоме споживання. Ми обираємо тканини й фурнітуру, які відповідають сучасним екостандартам, забезпечують довговічність і створюють відчуття преміальної простоти.
            </p>
            <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-white/70 leading-relaxed">
              13vplus — про одяг, який живе разом з вами: універсальний, впевнений, актуальний.
            </p>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="w-full mt-16 lg:mt-20 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            {/* Images */}
            <div className="flex flex-row gap-4 lg:gap-6 w-full lg:w-auto">
              <Link
                href="https://www.tiktok.com/@13vplus?_r=1"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setEnlargedImage("/images/Group 1000007075.png");
                }}
                className="relative w-full sm:w-1/2 lg:w-[300px] min-h-[400px] lg:min-h-[500px] bg-transparent cursor-pointer group"
              >
                <Image
                  src="/images/Group 1000007075.png"
                  alt="13VPLUS Collection"
                  fill
                  className="object-contain group-hover:opacity-90 transition-opacity duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                />
              </Link>
              <Link
                href="https://www.instagram.com/13vplus"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  setEnlargedImage("/images/Group 1000007076.png");
                }}
                className="relative w-full sm:w-1/2 lg:w-[300px] min-h-[400px] lg:min-h-[500px] bg-transparent cursor-pointer group"
              >
                <Image
                  src="/images/Group 1000007076.png"
                  alt="13VPLUS Collection"
                  fill
                  className="object-contain group-hover:opacity-90 transition-opacity duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                />
              </Link>
            </div>

            {/* Text and Buttons */}
            <div className="flex flex-col items-center lg:items-start gap-8 lg:gap-10 text-center lg:text-left w-full lg:w-auto">
              <div className="space-y-4">
                <h3 className="text-2xl lg:text-4xl font-bold font-['Montserrat'] uppercase tracking-wider text-white">
                  Ми ближче,
                  <br />
                  ніж здається!
                </h3>
                <p className="text-base lg:text-lg font-normal font-['Montserrat'] text-white/80 leading-relaxed">
                  Лімітована колекція — для тих кому важлива унікальність.
                </p>
              </div>

              {/* Social Media Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link
                  href="https://www.tiktok.com/@13vplus?_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-black hover:bg-white/90 transition-colors duration-300 font-['Montserrat'] font-medium uppercase tracking-wider text-sm lg:text-base"
                >
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
                </Link>
                <Link
                  href="https://www.instagram.com/13vplus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-black hover:bg-white/90 transition-colors duration-300 font-['Montserrat'] font-medium uppercase tracking-wider text-sm lg:text-base"
                >
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
                </Link>
              </div>
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
