"use client";

import Link from "next/link";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 border border-black dark:border-white rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-black dark:border-white rounded-full"></div>
        <div className="absolute bottom-32 left-40 w-20 h-20 border border-black dark:border-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-black dark:border-white rounded-full"></div>
      </div>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        {/* Large 404 with 13VPLUS style */}
        <div className="mb-12">
          <div className={`${montserrat.className} text-[200px] md:text-[300px] font-bold leading-none tracking-widest opacity-10 dark:opacity-20`}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-8xl md:text-9xl font-bold mb-4 tracking-tight">
              404
            </div>
          </div>
        </div>

        {/* Main message */}
        <div className="space-y-6 mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Сторінку не знайдено
          </h1>
          <p className="text-xl md:text-2xl opacity-70 max-w-2xl mx-auto leading-relaxed">
            Схоже, що сторінка, яку ви шукаєте, загубилася у просторах інтернету. 
            Але не хвилюйтеся — у нас є багато інших цікавих речей!
          </p>
        </div>

        {/* Decorative line */}
        <div className="w-32 h-1 bg-black dark:bg-white mx-auto mb-12"></div>

        {/* Action buttons with 13VPLUS style */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <Link
            href="/"
            className="group px-10 py-5 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
          >
            <span className="relative z-10">На головну</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link
            href="/catalog"
            className="group px-10 py-5 border-2 border-black dark:border-white rounded-full font-semibold text-lg hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 relative overflow-hidden"
          >
            <span className="relative z-10">Каталог товарів</span>
            <div className="absolute inset-0 bg-black dark:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>

        {/* Creative illustration */}
        <div className="mt-20 opacity-30">
          <div className="relative w-80 h-80 mx-auto">
            {/* Floating elements */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black dark:bg-white rounded-full animate-bounce"></div>
            <div className="absolute top-20 left-10 w-3 h-3 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute top-20 right-10 w-3 h-3 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-40 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "1.5s" }}></div>
            
            {/* Central circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-black dark:border-white rounded-full opacity-50"></div>
            
            {/* Connecting lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
              <path
                d="M 160 20 L 80 100 L 160 180 L 240 100 Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
                className="animate-pulse"
              />
              <path
                d="M 160 60 L 100 120 L 160 180 L 220 120 Z"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                opacity="0.2"
                className="animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </svg>
            
            {/* Bottom elements */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "2s" }}></div>
            <div className="absolute bottom-10 left-20 w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "2.5s" }}></div>
            <div className="absolute bottom-10 right-20 w-2 h-2 bg-black dark:bg-white rounded-full animate-bounce" style={{ animationDelay: "3s" }}></div>
          </div>
        </div>

        {/* Footer message */}
        <div className="mt-16 pt-8 border-t border-black/10 dark:border-white/10">
          <p className="text-sm opacity-50">
            Якщо ви вважаєте, що це помилка, будь ласка, зв&apos;яжіться з нами
          </p>
          <Link 
            href="mailto:13vplusukraineanbrand@gmail.com"
            className="text-sm opacity-50 hover:opacity-100 transition-opacity duration-300 mt-2 inline-block"
          >
            13vplusukraineanbrand@gmail.com
          </Link>
        </div>
      </div>
    </div>
  );
}

