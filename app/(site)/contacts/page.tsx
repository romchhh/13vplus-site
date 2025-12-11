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
            <div className="space-y-8 mb-12">
              {/* General Support Info */}
              <div className="space-y-4">
                <p className="text-base lg:text-lg font-['Montserrat'] text-black/80 leading-relaxed">
                  Наша служба підтримки працює з понеділка по неділю — з 10:30 до 23:30
                </p>
                <div className="space-y-2">
                  <p className="text-base lg:text-lg font-['Montserrat'] text-black/80">
                    Телефон:{" "}
                    <a
                      href="tel:+380680785937"
                      className="text-blue-600 underline hover:text-blue-800 transition-colors"
                    >
                      +38 (068) 078-59-37
                    </a>
                  </p>
                  <p className="text-base lg:text-lg font-['Montserrat'] text-black/80">
                    E-mail:{" "}
                    <a
                      href="mailto:support@13vplus.com.ua"
                      className="text-blue-600 underline hover:text-blue-800 transition-colors"
                    >
                      support@13vplus.com.ua
                    </a>
                  </p>
                </div>
              </div>

              {/* Locations */}
              {locations.map((location, index) => (
                <div key={index} className="space-y-3">
                  <h3 className="text-xl lg:text-2xl font-bold font-['Montserrat'] uppercase tracking-wide text-black">
                    {location.title}
                  </h3>
                  <div className="space-y-2 text-base lg:text-lg font-['Montserrat'] text-black/80">
                    <p>
                      • Адреса:{" "}
                      <a
                        href={location.addressLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800 transition-colors"
                      >
                        {location.address}
                      </a>
                    </p>
                    <p>• Працюємо: {location.workingHours}</p>
                    <div className="space-y-1">
                      {location.phones.map((phone, phoneIndex) => (
                        <p key={phoneIndex}>
                          • Телефон:{" "}
                          <a
                            href={`tel:${phone.replace(/\s/g, "").replace(/[()]/g, "")}`}
                            className="text-blue-600 underline hover:text-blue-800 transition-colors"
                          >
                            {phone}
                          </a>
                        </p>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                      {location.messengers.map((messenger, msgIndex) => (
                        <a
                          key={msgIndex}
                          href={messenger.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800 transition-colors"
                        >
                          {messenger.name}
                        </a>
                      ))}
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

