'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service (Sentry, LogRocket, etc.)
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-black">
            Щось пішло не так
          </h2>
          <p className="text-gray-600">
            Вибачте за незручності. Спробуйте перезавантажити сторінку.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-black text-white hover:bg-black/90 transition-colors font-medium"
          >
            Спробувати знову
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 border border-black text-black hover:bg-black hover:text-white transition-colors font-medium text-center"
          >
            На головну
          </Link>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Технічні деталі (dev only)
            </summary>
            <pre className="mt-4 p-4 bg-gray-100 text-xs overflow-auto rounded">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
