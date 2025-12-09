"use client";

import Link from "next/link";

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="scroll-mt-5 max-w-[1920px] w-full mx-auto relative bg-white px-6 py-16 lg:py-24"
    >
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 lg:gap-16">
        <div>
          <h2 className="text-4xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-black leading-tight mb-6">
            Враження
            <br />
            наших клієнтів
          </h2>
        </div>

        <div className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
          Більше відгуків дивіться у нашому{" "}
          <Link
            href="https://www.instagram.com/13vplus"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-black transition-colors"
          >
            Instagram
          </Link>{" "}
          профілі
        </div>
      </div>
    </section>
  );
}
