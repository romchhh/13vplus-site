import { SITE_STORE_LOCATION } from "@/lib/siteContacts";

interface LocationMapProps {
  className?: string;
  title?: string;
}

export default function LocationMap({
  className = "",
  title = "Карта — 13VPLUS, Київ",
}: LocationMapProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-black/10 bg-black/5 ${className}`}>
      <iframe
        title={title}
        src={SITE_STORE_LOCATION.mapsEmbedUrl}
        className="w-full h-[280px] sm:h-[320px] lg:h-[360px] border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
