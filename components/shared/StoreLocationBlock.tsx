import Link from "next/link";
import {
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
  SITE_STORE_LOCATION,
  SITE_SUPPORT_MESSENGERS,
} from "@/lib/siteContacts";
import LocationMap from "@/components/shared/LocationMap";
import MessengerIcon from "@/components/shared/MessengerIcon";

interface StoreLocationBlockProps {
  variant?: "home" | "page";
}

export default function StoreLocationBlock({
  variant = "home",
}: StoreLocationBlockProps) {
  const isPage = variant === "page";
  const iconWrap = isPage
    ? "w-9 h-9 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 mt-0.5"
    : "flex items-center justify-center flex-shrink-0 mt-0.5";
  const iconClass = isPage ? "w-5 h-5 text-black/70" : "w-5 h-5 text-black";

  return (
    <div className="space-y-6">
      <h3 className="text-xl lg:text-2xl font-bold font-['Montserrat'] uppercase tracking-wide text-black pb-3">
        {SITE_STORE_LOCATION.title}
      </h3>

      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className={iconWrap}>
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div className="flex-1 space-y-3">
            <p className="text-xs font-['Montserrat'] text-black/50 uppercase tracking-widest font-semibold">
              Адреса
            </p>
            <a
              href={SITE_STORE_LOCATION.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-base lg:text-lg font-['Montserrat'] text-black font-medium hover:opacity-70 transition-opacity"
            >
              {SITE_STORE_LOCATION.address}
            </a>
            <div className="flex flex-wrap gap-3">
              <a
                href={SITE_STORE_LOCATION.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-['Montserrat'] font-semibold uppercase tracking-wider border-2 border-black text-black hover:bg-black hover:text-white transition-colors rounded-lg"
              >
                Відкрити в Google Maps
              </a>
              <a
                href={SITE_STORE_LOCATION.mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-['Montserrat'] font-semibold uppercase tracking-wider border-2 border-black/20 text-black hover:border-black transition-colors rounded-lg"
              >
                Прокласти маршрут
              </a>
            </div>
          </div>
        </div>

        <LocationMap />

        <div className="flex items-start gap-4">
          <div className={iconWrap}>
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-['Montserrat'] text-black/50 uppercase tracking-widest mb-2 font-semibold">
              Години роботи
            </p>
            <p className="text-base lg:text-lg font-['Montserrat'] text-black font-medium">
              {SITE_STORE_LOCATION.workingHours}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className={iconWrap}>
            <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-xs font-['Montserrat'] text-black/50 uppercase tracking-widest font-semibold">
              Телефон
            </p>
            <Link
              href={SITE_PHONE_TEL}
              className="block text-base lg:text-lg font-['Montserrat'] text-black font-semibold hover:opacity-70 transition-opacity"
            >
              {SITE_PHONE_DISPLAY}
            </Link>
          </div>
        </div>

        <div className="pt-5">
          <p className="text-xs font-['Montserrat'] text-black/50 uppercase tracking-widest mb-4 font-semibold">
            Месенджери
          </p>
          <div className="flex flex-wrap gap-3">
            {SITE_SUPPORT_MESSENGERS.map((messenger) => (
              <a
                key={messenger.name}
                href={messenger.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white border-2 border-black/20 text-black hover:bg-black hover:text-white hover:border-black transition-all duration-300 font-['Montserrat'] font-semibold uppercase tracking-wider text-sm rounded-lg"
              >
                <MessengerIcon name={messenger.name} className="w-5 h-5 shrink-0" />
                {messenger.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
