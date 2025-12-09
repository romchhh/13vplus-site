"use client";

import Link from "next/link";

interface SidebarSeasonProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SidebarSeason({
  isOpen,
  setIsOpen,
}: SidebarSeasonProps) {
  const season_data = [
    {
      name: "Осінь",
      image: "https://placehold.co/458x185",
    },
    {
      name: "Зима",
      image: "https://placehold.co/458x185",
    },
    {
      name: "Весна",
      image: "https://placehold.co/458x185",
    },
    {
      name: "Літо",
      image: "https://placehold.co/458x185",
    },
  ];

  return (
    <div className="relative z-50">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-4/5 sm:max-w-md bg-stone-100 shadow-md z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto`}
      >
        <div className="flex justify-between items-center p-4 text-xl sm:text-2xl md:text-3xl">
          <h2 className="font-bold">Сезони</h2>
          <button
            className="text-2xl sm:text-3xl cursor-pointer hover:text-[#8C7461]"
            onClick={() => setIsOpen(false)}
          >
            ×
          </button>
        </div>

        <div className="flex flex-col px-4 pb-6 space-y-4">
          {season_data.map((item, i) => (
            <Link
              key={i}
              href={`/catalog?season=${item.name}`}
              onClick={() => setIsOpen(false)}
              className="block h-[120px] rounded overflow-hidden relative text-white text-xl sm:text-2xl font-bold text-center flex items-center justify-center"
              style={{
                backgroundImage: `url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Dark overlay on image */}
              <div className="absolute inset-0 bg-black/40" />
              <span className="relative z-10">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
