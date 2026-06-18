"use client";

import {
  SITE_EMAIL,
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
  SITE_STORE_LOCATION,
} from "@/lib/siteContacts";
import StoreLocationBlock from "@/components/shared/StoreLocationBlock";

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-6 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
          <div className="lg:w-96">
            <h1 className="text-4xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-black leading-tight mb-6">
              <span className="inline-block">ЦЕНТР</span>
              <br />
              <span className="inline-block">ПІДТРИМКИ</span>
            </h1>
            <p className="text-lg lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
              Зв&apos;яжіться з 13VPLUS (13 v plus, 13вплюс) зручним для вас способом
            </p>
          </div>

          <div className="flex-1 max-w-4xl space-y-8 lg:space-y-10 mb-12">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-black/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base lg:text-lg font-['Montserrat'] text-black/90 leading-relaxed font-medium">
                    Наша служба підтримки працює {SITE_STORE_LOCATION.supportHours}
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-6">
                <a
                  href={SITE_PHONE_TEL}
                  className="flex items-center gap-4 group hover:opacity-80 transition-all duration-200 p-3 -m-3 rounded-lg hover:bg-black/5"
                >
                  <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/20 transition-colors">
                    <svg className="w-5 h-5 text-black/70 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-base lg:text-lg font-['Montserrat'] text-black font-semibold">
                    {SITE_PHONE_DISPLAY}
                  </span>
                </a>
                <a
                  href={`mailto:${SITE_EMAIL}`}
                  className="flex items-center gap-4 group hover:opacity-80 transition-all duration-200 p-3 -m-3 rounded-lg hover:bg-black/5"
                >
                  <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/20 transition-colors">
                    <svg className="w-5 h-5 text-black/70 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-base lg:text-lg font-['Montserrat'] text-black font-semibold">
                    {SITE_EMAIL}
                  </span>
                </a>
              </div>
            </div>

            <StoreLocationBlock variant="page" />
          </div>
        </div>
      </div>
    </div>
  );
}
