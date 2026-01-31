import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-black">404</h1>
          <h2 className="text-2xl font-semibold text-black">
            Сторінку не знайдено
          </h2>
          <p className="text-gray-600">
            Схоже, ця сторінка більше не існує або була переміщена.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-black text-white hover:bg-black/90 transition-colors font-medium inline-block"
          >
            На головну
          </Link>
          
          <Link
            href="/catalog"
            className="px-6 py-3 border border-black text-black hover:bg-black hover:text-white transition-colors font-medium inline-block"
          >
            До каталогу
          </Link>
        </div>
      </div>
    </div>
  );
}
