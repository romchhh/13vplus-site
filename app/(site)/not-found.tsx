import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Decorative number */}
        <p
          className="text-[clamp(6rem,20vw,12rem)] font-light font-['Montserrat'] text-[#3D1A00]/12 leading-none tracking-tighter select-none"
          aria-hidden
        >
          404
        </p>

        <div className="relative -mt-16 md:-mt-24 space-y-4">
          <h1 className="text-2xl md:text-3xl font-medium font-['Montserrat'] text-[#3D1A00] tracking-tight">
            Ой, цієї сторінки вже немає
          </h1>
          <p className="text-base md:text-lg font-['Montserrat'] text-[#3D1A00]/75 leading-relaxed max-w-sm mx-auto">
            Можливо, вона переїхала або ми її прибрали. Поверніться до каталогу або на головну — там завжди щось корисне.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link
            href="/"
            className="px-6 py-3 bg-[#3D1A00] text-[#FFF9F0] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#2d1200] transition-colors rounded-full"
          >
            На головну
          </Link>
          <Link
            href="/catalog"
            className="px-6 py-3 border-2 border-[#3D1A00] text-[#3D1A00] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#3D1A00] hover:text-[#FFF9F0] transition-colors rounded-full"
          >
            Каталог
          </Link>
        </div>

        <p className="mt-12 text-xs font-['Montserrat'] text-[#3D1A00]/50">
          Choice — eco та wellness для вас
        </p>
      </div>
    </div>
  );
}
