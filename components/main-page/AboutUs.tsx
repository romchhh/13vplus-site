"use client";

import { useEffect } from "react";

export default function AboutUs() {
  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://www.instagram.com/embed.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  const instagramPost = "https://www.instagram.com/p/DRFLN3ZDMRc/";

  return (
    <section
      id="about"
      className="scroll-mt-20 max-w-[1920px] mx-auto w-full px-6 py-16 lg:py-24 relative overflow-hidden bg-[#1a1a1a]"
    >
      <div className="flex flex-col items-center gap-12 lg:gap-16">
        {/* Title */}
        <div className="text-white text-center text-3xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider">
          Про нас
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center space-y-6 lg:space-y-10">
          <p className="text-lg lg:text-2xl font-normal font-['Montserrat'] text-white/80 leading-relaxed">
            13VPLUS — український бренд жіночого одягу, заснований у серпні 2023 року в Києві. Ми створюємо одяг, який поєднує сучасні тренди з класичною елегантністю, дбаючи про якість кожної деталі.
          </p>

          <div className="py-8 lg:py-12 border-t border-b border-white/20">
            <p className="text-xl lg:text-3xl font-medium font-['Montserrat'] text-white leading-relaxed">
              Шиємо те, що самі хочемо носити — без компромісів.
            </p>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-white/70 leading-relaxed">
              Індивідуальний пошив під ваші параметри — акуратно, якісно і точно по фігурі. Кожна модель створюється з урахуванням особливостей вашої фігури, щоб підкреслити переваги та створити ідеальний силует.
            </p>
            <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-white/70 leading-relaxed">
              Ми працюємо з якісними тканинами та дотримуємося високих стандартів виробництва. Наша мета — не просто одяг, а справжні інвестиції в ваш стиль та впевненість у собі.
            </p>
          </div>
        </div>

        {/* Instagram Reels Section - Single, Minimalist */}
        <div className="w-full mt-16 lg:mt-20 max-w-4xl mx-auto">
          <div className="w-full" style={{ height: "100vh", minHeight: "800px" }}>
            <iframe
              src={`https://www.instagram.com/p/${instagramPost.split("/p/")[1]?.split("/")[0]}/embed/`}
              className="w-full h-full border-0"
              style={{ height: "100%", overflow: "hidden" }}
              allow="encrypted-media"
              scrolling="no"
              title="Instagram reels"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
