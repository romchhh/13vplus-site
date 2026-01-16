"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";

export default function MediaGallery() {
  const videoRef1 = useRef<HTMLVideoElement>(null);
  const videoRef2 = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Video autoplay setup is handled in the playVideo function
  }, []);

  useEffect(() => {
    const playVideo = async (video: HTMLVideoElement | null) => {
      if (!video) return;
      
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      
      try {
        await video.play();
      } catch (error) {
        console.log("Video autoplay failed:", error);
      }
    };

    if (videoRef1.current) {
      if (videoRef1.current.readyState >= 2) {
        playVideo(videoRef1.current);
      } else {
        videoRef1.current.addEventListener('loadeddata', () => playVideo(videoRef1.current), { once: true });
        videoRef1.current.load();
      }
    }

    if (videoRef2.current) {
      if (videoRef2.current.readyState >= 2) {
        playVideo(videoRef2.current);
      } else {
        videoRef2.current.addEventListener('loadeddata', () => playVideo(videoRef2.current), { once: true });
        videoRef2.current.load();
      }
    }
  }, []);

  return (
    <section className="max-w-[1920px] w-full mx-auto relative px-6 py-16 lg:py-24 bg-white">
      <div className="flex flex-col gap-12 lg:gap-16">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-0 border-b border-black/10 pb-8 lg:pb-12">
          <h2 className="text-3xl lg:text-5xl font-bold font-['Montserrat'] uppercase tracking-wider text-black">
            Колекція 13VPLUS
          </h2>
          <p className="text-base lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed max-w-2xl">
            Ексклюзивні образи та унікальні рішення для вашого стилю.
          </p>
        </div>

        {/* Mobile layout: Vertical stack */}
        <div className="sm:hidden space-y-4">
          <div className="relative w-full aspect-[16/9] bg-black/5 overflow-hidden">
            <Image
              src="/images/IMG_1112.jpg"
              alt="13VPLUS Collection"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-base font-medium font-['Montserrat'] uppercase tracking-wider">
                Ексклюзивні колекції
              </p>
              <p className="text-white/90 text-sm font-normal font-['Montserrat'] mt-1">
                Унікальні рішення для вашого стилю
              </p>
            </div>
          </div>
          
          <div className="relative w-full aspect-[9/16] bg-black/5 overflow-hidden">
            <video
              ref={videoRef1}
              className="absolute inset-0 w-full h-full object-cover"
              src="/images/IMG_1844.webm"
              loop
              muted
              playsInline
              autoPlay
              preload="auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-base font-medium font-['Montserrat'] uppercase tracking-wider">
                Живі моменти
              </p>
              <p className="text-white/90 text-sm font-normal font-['Montserrat'] mt-1">
                Динаміка та елегантність в кожному кадрі
              </p>
            </div>
          </div>
          
          <div className="relative w-full aspect-[9/16] bg-black/5 overflow-hidden">
            <video
              ref={videoRef2}
              className="absolute inset-0 w-full h-full object-cover"
              src="/images/IMG_1845.webm"
              loop
              muted
              playsInline
              autoPlay
              preload="auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-base font-medium font-['Montserrat'] uppercase tracking-wider">
                Стиль та якість
              </p>
              <p className="text-white/90 text-sm font-normal font-['Montserrat'] mt-1">
                Відчуйте різницю в кожній деталі
              </p>
            </div>
          </div>
          
          <div className="relative w-full aspect-[16/9] bg-black/5 overflow-hidden">
            <Image
              src="/images/IMG_1115.JPG"
              alt="13VPLUS Collection"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-white text-base font-medium font-['Montserrat'] uppercase tracking-wider">
                Індивідуальність
              </p>
              <p className="text-white/90 text-sm font-normal font-['Montserrat'] mt-1">
                Створюємо образи, які підкреслюють вашу унікальність
              </p>
            </div>
          </div>
        </div>

        {/* Desktop layout: Two rows with equal height */}
        <div className="hidden sm:block space-y-6 lg:space-y-8">
          {/* First row: Photo (wider), Video */}
          <div className="grid grid-cols-10 gap-4 lg:gap-6" style={{ height: '600px' }}>
            <div className="col-span-7 relative bg-black/5 overflow-hidden group">
              <Image
                src="/images/IMG_1112.jpg"
                alt="13VPLUS Collection"
                fill
                className="object-cover group-hover:opacity-90 transition-opacity duration-300"
                sizes="70vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-lg lg:text-xl font-medium font-['Montserrat'] uppercase tracking-wider">
                  Ексклюзивні колекції
                </p>
                <p className="text-white/90 text-sm lg:text-base font-normal font-['Montserrat'] mt-2">
                  Унікальні рішення для вашого стилю
                </p>
              </div>
            </div>
            
            <div className="col-span-3 relative bg-black/5 overflow-hidden group">
              <video
                ref={videoRef1}
                className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                src="/images/IMG_1844.webm"
                loop
                muted
                playsInline
                autoPlay
                preload="auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-lg lg:text-xl font-medium font-['Montserrat'] uppercase tracking-wider">
                  Живі моменти
                </p>
                <p className="text-white/90 text-sm lg:text-base font-normal font-['Montserrat'] mt-2">
                  Динаміка та елегантність в кожному кадрі
                </p>
              </div>
            </div>
          </div>

          {/* Second row: Video, Photo (wider) */}
          <div className="grid grid-cols-10 gap-4 lg:gap-6" style={{ height: '600px' }}>
            <div className="col-span-3 relative bg-black/5 overflow-hidden group">
              <video
                ref={videoRef2}
                className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                src="/images/IMG_1845.webm"
                loop
                muted
                playsInline
                autoPlay
                preload="auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-lg lg:text-xl font-medium font-['Montserrat'] uppercase tracking-wider">
                  Стиль та якість
                </p>
                <p className="text-white/90 text-sm lg:text-base font-normal font-['Montserrat'] mt-2">
                  Відчуйте різницю в кожній деталі
                </p>
              </div>
            </div>
            
            <div className="col-span-7 relative bg-black/5 overflow-hidden group">
              <Image
                src="/images/IMG_1115.JPG"
                alt="13VPLUS Collection"
                fill
                className="object-cover group-hover:opacity-90 transition-opacity duration-300"
                sizes="70vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 right-6 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <p className="text-white text-lg lg:text-xl font-medium font-['Montserrat'] uppercase tracking-wider">
                  Індивідуальність
                </p>
                <p className="text-white/90 text-sm lg:text-base font-normal font-['Montserrat'] mt-2">
                  Створюємо образи, які підкреслюють вашу унікальність
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

