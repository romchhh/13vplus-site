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
