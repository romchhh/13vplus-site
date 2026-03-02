import Link from "next/link";

export const metadata = {
  title: "Доступ обмежено | Choice",
  description: "У вас немає доступу до цієї сторінки.",
};

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center">
        <p
          className="text-[clamp(4rem,14vw,8rem)] font-light font-['Montserrat'] text-[#3D1A00]/12 leading-none tracking-tighter select-none"
          aria-hidden
        >
          403
        </p>

        <div className="relative -mt-12 md:-mt-20 space-y-4">
          <h1 className="text-2xl md:text-3xl font-medium font-['Montserrat'] text-[#3D1A00] tracking-tight">
            Тут не можна бути
          </h1>
          <p className="text-base md:text-lg font-['Montserrat'] text-[#3D1A00]/75 leading-relaxed max-w-sm mx-auto">
            Ця сторінка доступна лише для певних користувачів. Якщо ви вважаєте, що це помилка — напишіть нам або поверніться туди, де вам раді.
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
            href="/contacts"
            className="px-6 py-3 border-2 border-[#3D1A00] text-[#3D1A00] font-['Montserrat'] font-medium text-sm uppercase tracking-wider hover:bg-[#3D1A00] hover:text-[#FFF9F0] transition-colors rounded-full"
          >
            Зв&apos;язатися
          </Link>
        </div>

        <p className="mt-12 text-xs font-['Montserrat'] text-[#3D1A00]/50">
          Choice — eco та wellness для вас
        </p>
      </div>
    </div>
  );
}
