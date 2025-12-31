"use client";

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

export default function ContactsSection() {

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
    <section
      id="contacts"
      className="scroll-mt-20 max-w-[1920px] w-full mx-auto bg-white py-16 lg:py-24 px-6"
    >
      <div className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-16">
        {/* Left side - Title */}
        <div className="lg:w-96">
          <h2 className="text-4xl lg:text-6xl font-bold font-['Montserrat'] uppercase tracking-wider text-black leading-tight mb-6">
            <span className="inline-block">
              ЦЕНТР
            </span>
            <br />
            <span className="inline-block">
              ПІДТРИМКИ
            </span>
          </h2>
          <p className="text-lg lg:text-xl font-normal font-['Montserrat'] text-black/70 leading-relaxed">
            Зв&apos;яжіться з нами зручним для вас способом
          </p>
        </div>

        {/* Right side - Contacts Content */}
        <div className="flex-1 max-w-4xl space-y-8 lg:space-y-10">
            {/* General Support Info */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-black/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base lg:text-lg font-['Montserrat'] text-black/90 leading-relaxed font-medium">
                    Наша служба підтримки працює з понеділка по неділю — з 10:30 до 23:30
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 pt-6">
                <a
                  href="tel:+380680785937"
                  className="flex items-center gap-4 group hover:opacity-80 transition-all duration-200 p-3 -m-3 rounded-lg hover:bg-black/5"
                >
                  <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/20 transition-colors">
                    <svg className="w-5 h-5 text-black/70 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <span className="text-base lg:text-lg font-['Montserrat'] text-black font-semibold">
                    +38 (068) 078-59-37
                  </span>
                </a>
                <a
                  href="mailto:support@13vplus.com.ua"
                  className="flex items-center gap-4 group hover:opacity-80 transition-all duration-200 p-3 -m-3 rounded-lg hover:bg-black/5"
                >
                  <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 group-hover:bg-black/20 transition-colors">
                    <svg className="w-5 h-5 text-black/70 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-base lg:text-lg font-['Montserrat'] text-black font-semibold">
                    support@13vplus.com.ua
                  </span>
                </a>
              </div>
            </div>

            {/* Locations */}
            {locations.map((location, index) => (
              <div key={index} className="space-y-6">
                <h3 className="text-xl lg:text-2xl font-bold font-['Montserrat'] uppercase tracking-wide text-black pb-3">
                  {location.title}
                </h3>
                
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-black/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-['Montserrat'] text-black/50 uppercase tracking-widest mb-2 font-semibold">Адреса</p>
                      <a
                        href={location.addressLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-base lg:text-lg font-['Montserrat'] text-black font-medium hover:opacity-70 transition-opacity inline-block"
                      >
                        {location.address}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-black/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-['Montserrat'] text-black/50 uppercase tracking-widest mb-2 font-semibold">Години роботи</p>
                      <p className="text-base lg:text-lg font-['Montserrat'] text-black font-medium">
                        {location.workingHours}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-black/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-xs font-['Montserrat'] text-black/50 uppercase tracking-widest font-semibold">Телефон</p>
                      {location.phones.map((phone, phoneIndex) => (
                        <a
                          key={phoneIndex}
                          href={`tel:${phone.replace(/\s/g, "").replace(/[()]/g, "")}`}
                          className="block text-base lg:text-lg font-['Montserrat'] text-black font-semibold hover:opacity-70 transition-opacity"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5">
                    <p className="text-xs font-['Montserrat'] text-black/50 uppercase tracking-widest mb-4 font-semibold">Месенджери</p>
                    <div className="flex flex-wrap gap-3">
                      {location.messengers.map((messenger, msgIndex) => (
                        <a
                          key={msgIndex}
                          href={messenger.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-white border-2 border-black/20 text-black hover:bg-black hover:text-white hover:border-black transition-all duration-300 font-['Montserrat'] font-semibold uppercase tracking-wider text-sm rounded-lg"
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
      </div>
    </section>
  );
}

