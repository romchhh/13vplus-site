"use client";

import { useState } from "react";
import Link from "next/link";

interface Location {
  title: string;
  address: string;
  addressLink: string;
  workingHours: string;
  phones: string[];
  messengers: {
    name: string;
    link: string;
  }[];
}

export default function ContactsPage() {
  const [isContactsExpanded, setIsContactsExpanded] = useState(true);

  const locations: Location[] = [
    {
      title: "КИЇВ",
      address: "м. Київ, вулиця Данила Щербаківського, 45A",
      addressLink: "https://www.google.com/maps/search/?api=1&query=вулиця+Данила+Щербаківського+45A+Київ",
      workingHours: "з понеділка по неділю з 09:00 до 19:00",
      phones: ["+38 (093) 309-95-03"],
      messengers: [
        { name: "Telegram", link: "https://t.me/13vplusukraineanbrand" },
        { name: "Viber", link: "viber://chat?number=380933099503" },
        { name: "WhatsApp", link: "https://wa.me/380933099503" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1920px] mx-auto px-6 py-16 lg:py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-black mb-4">
            ЦЕНТР ПІДТРИМКИ
          </h1>
          <div className="w-full max-w-4xl mx-auto h-px bg-black/20"></div>
        </div>

        {/* Contacts Section */}
        <div className="max-w-4xl mx-auto">
          {/* Contacts Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold font-['Montserrat'] uppercase tracking-wider text-black">
              КОНТАКТИ
            </h2>
            <button
              onClick={() => setIsContactsExpanded(!isContactsExpanded)}
              className="text-black/60 hover:text-black transition-colors"
              aria-label={isContactsExpanded ? "Згорнути" : "Розгорнути"}
            >
              <svg
                className={`w-5 h-5 transition-transform duration-300 ${
                  isContactsExpanded ? "" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>

          {/* Contacts Content */}
          {isContactsExpanded && (
            <div className="space-y-10 lg:space-y-12 mb-12">
              {/* General Support Info */}
              <div className="bg-black/5 p-6 lg:p-8 rounded-lg space-y-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-black/60 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-base lg:text-lg font-['Montserrat'] text-black/80 leading-relaxed">
                    Наша служба підтримки працює з понеділка по неділю — з 10:30 до 23:30
                  </p>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-black/10">
                  <a
                    href="tel:+380680785937"
                    className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                  >
                    <svg className="w-5 h-5 text-black/60 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-base lg:text-lg font-['Montserrat'] text-black font-medium">
                      +38 (068) 078-59-37
                    </span>
                  </a>
                  <a
                    href="mailto:support@13vplus.com.ua"
                    className="flex items-center gap-3 group hover:opacity-80 transition-opacity"
                  >
                    <svg className="w-5 h-5 text-black/60 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-base lg:text-lg font-['Montserrat'] text-black font-medium">
                      support@13vplus.com.ua
                    </span>
                  </a>
                </div>
              </div>

              {/* Locations */}
              {locations.map((location, index) => (
                <div key={index} className="bg-black/5 p-6 lg:p-8 rounded-lg space-y-6">
                  <h3 className="text-xl lg:text-2xl font-bold font-['Montserrat'] uppercase tracking-wide text-black pb-2 border-b border-black/10">
                    {location.title}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-black/60 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-['Montserrat'] text-black/60 uppercase tracking-wider mb-1">Адреса</p>
                        <a
                          href={location.addressLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base lg:text-lg font-['Montserrat'] text-black hover:opacity-70 transition-opacity"
                        >
                          {location.address}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-black/60 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-['Montserrat'] text-black/60 uppercase tracking-wider mb-1">Години роботи</p>
                        <p className="text-base lg:text-lg font-['Montserrat'] text-black">
                          {location.workingHours}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-black/60 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div className="space-y-2">
                        <p className="text-sm font-['Montserrat'] text-black/60 uppercase tracking-wider">Телефон</p>
                        {location.phones.map((phone, phoneIndex) => (
                          <a
                            key={phoneIndex}
                            href={`tel:${phone.replace(/\s/g, "").replace(/[()]/g, "")}`}
                            className="block text-base lg:text-lg font-['Montserrat'] text-black font-medium hover:opacity-70 transition-opacity"
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/10">
                      <p className="text-sm font-['Montserrat'] text-black/60 uppercase tracking-wider mb-3">Месенджери</p>
                      <div className="flex flex-wrap gap-3">
                        {location.messengers.map((messenger, msgIndex) => (
                          <a
                            key={msgIndex}
                            href={messenger.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-white border border-black/20 text-black hover:bg-black hover:text-white transition-all duration-300 font-['Montserrat'] font-medium uppercase tracking-wider text-sm"
                          >
                            {messenger.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

