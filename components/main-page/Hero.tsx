"use client";

import SidebarMenu from "@/components/layout/SidebarMenu";
import { useAppContext } from "@/lib/GeneralProvider";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Hero() {
  const { isSidebarOpen, setIsSidebarOpen } = useAppContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ensure video plays on component mount with mobile optimization
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set all required attributes for mobile autoplay
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      
      // Try multiple approaches for mobile compatibility
      const playVideo = async () => {
        try {
          // First try: direct play
          await video.play();
          setShowPlayButton(false);
        } catch (error) {
          console.log("Video autoplay failed, trying again:", error);
          
          // Second try: after a small delay (sometimes helps on mobile)
          setTimeout(async () => {
            try {
              await video.play();
              setShowPlayButton(false);
            } catch (error2) {
              console.log("Video autoplay failed again:", error2);
              
              // Third try: user interaction simulation (sometimes mobile needs this)
              // But we'll show play button only if all attempts fail
              if (isMobile) {
                // On mobile, wait a bit more and try once more
                setTimeout(async () => {
                  try {
                    await video.play();
                    setShowPlayButton(false);
                  } catch (error3) {
                    console.log("Final autoplay attempt failed:", error3);
                    setShowPlayButton(true);
                  }
                }, 500);
              } else {
                setShowPlayButton(true);
              }
            }
          }, 100);
        }
      };
      
      // Wait for video to be ready
      if (video.readyState >= 2) {
        // Video is already loaded
        playVideo();
      } else {
        // Wait for video to load
        video.addEventListener('loadeddata', playVideo, { once: true });
        video.addEventListener('canplay', playVideo, { once: true });
        
        // Also try when video starts loading
        video.load();
      }
    }
  }, [isMobile]);

  return (
    <section>
      <div className="max-w-[1920px] mx-auto w-full h-screen sm:h-[720px] md:h-[900px] lg:h-[1080px] relative overflow-hidden">
        {/* Show image on mobile, video on desktop */}
        
          <>
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover object-center bg-black"
              src="/images/hero-video.webm"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              style={{ zIndex: 1 }}
              onLoadedData={() => {
                const video = videoRef.current;
                if (video) {
                  video.play().catch((error) => {
                    console.log("Play on loadeddata failed:", error);
                    // Don't show play button immediately, let useEffect handle it
                  });
                  video.style.backgroundColor = "transparent";
                }
              }}
              onCanPlay={() => {
                const video = videoRef.current;
                if (video) {
                  video.play().catch((error) => {
                    console.log("Play on canplay failed:", error);
                  });
                }
              }}
              onLoadStart={() => {
                // Hide black background once video starts loading
                if (videoRef.current) {
                  videoRef.current.style.backgroundColor = "transparent";
                }
              }}
            />
            
            {/* Play button for desktop if autoplay fails */}
            {showPlayButton && (
              <button
                onClick={async () => {
                  try {
                    await videoRef.current?.play();
                    setShowPlayButton(false);
                  } catch (error) {
                    console.log("Manual play failed:", error);
                  }
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 z-10"
                style={{ zIndex: 10 }}
              >
                <div className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
                  <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M8 5v14l11-7z"
                      fill="currentColor"
                      className="text-black"
                    />
                  </svg>
                </div>
              </button>
            )}
          </>
        
        <div className="relative z-10 flex flex-col justify-end md:justify-center p-10 md:p-20 gap-8 md:gap-12 h-full" style={{ zIndex: 2 }}>
          {/* Luxury text overlay */}
          <div className="flex flex-col items-center justify-center gap-5 md:gap-7 mb-24 md:mb-20">
            <h1 className="text-white text-4xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl font-bold font-['Montserrat'] uppercase text-center leading-tight" style={{ letterSpacing: '0.15em' }}>
              Urban Stillness
            </h1>
            <p className="text-white text-lg sm:text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-bold font-['Montserrat'] uppercase text-center opacity-90" style={{ letterSpacing: '0.2em' }}>
              Winter Collection
            </p>
          </div>

          {/* Catalog button */}
          <Link
            href="/catalog"
            className="cursor-pointer mx-auto w-48 sm:w-56 md:w-64 lg:w-72 h-14 sm:h-16 md:h-18 lg:h-20 p-2 bg-transparent border-2 border-white text-white inline-flex justify-center items-center gap-2 hover:bg-white hover:text-black transition-all duration-300 font-['Montserrat'] group"
          >
            <div className="text-center justify-center text-base sm:text-lg md:text-xl lg:text-2xl font-normal uppercase tracking-wider leading-none">
              Переглянути
            </div>
          </Link>
        </div>
      </div>

      <SidebarMenu
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
    </section>
  );
}
