import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./critical.css";
import "./globals.css";
import "./mobile-optimizations.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";
import { WishlistProvider } from "@/lib/WishlistProvider";
import { CategoriesProvider } from "@/lib/CategoriesProvider";
import { registerServiceWorker } from "@/lib/registerSW";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { WebVitals } from "@/components/shared/WebVitals";
import MainContent from "@/components/shared/MainContent";
import { OrganizationStructuredData } from "@/components/shared/StructuredData";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
  variable: "--font-montserrat",
  adjustFontFallback: true,
  // Optimize: only load weights that are actually used
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "13VPLUS — Жіночий Одяг | Повсякденний, Домашній Одяг та Купальники",
  description:
    "13VPLUS — український бренд жіночого одягу. Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі. Індивідуальний пошив під ваші параметри. Для жінок від 22 до 50 років.",
  keywords:
    "13VPLUS, жіночий одяг, одяг для жінок, повсякденний одяг, домашній одяг, купальники, український бренд одягу, мінімалізм, лакшері стиль, індивідуальний пошив, одяг на замовлення, українська мода, стильний одяг для жінок",
  icons: {
    icon: "/images/browser-open.png",
    shortcut: "/images/browser-open.png",
    apple: "/images/browser-open.png",
  },
  openGraph: {
    title: "13VPLUS — Жіночий Одяг | Повсякденний, Домашній Одяг та Купальники",
    description:
      "Повсякденний одяг, домашній одяг та купальники в мінімалістичному лакшері стилі. Індивідуальний пошив під ваші параметри.",
    type: "website",
    locale: "uk_UA",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.PUBLIC_URL;

  return (
    <html lang="uk" className={montserrat.className}>
      <head>
        <OrganizationStructuredData url={baseUrl} baseUrl={baseUrl} />
        {/* Mobile viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/png" href="/images/browser-open.png" />
        <link rel="shortcut icon" type="image/png" href="/images/browser-open.png" />
        <link rel="apple-touch-icon" href="/images/browser-open.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/browser-open.png" as="image" />
        {/* Conditional preload: fallback image for mobile/slow connections, video for desktop */}
        <link rel="preload" href="/images/hero-fallback.png" as="image" media="(max-width: 767px)" />
        <link rel="preload" href="/images/hero-video.webm" as="video" type="video/webm" media="(min-width: 768px)" />
        <link rel="preload" href="/api/products/top-sale" as="fetch" crossOrigin="anonymous" />
        
        {/* Conditional preload for mobile vs desktop */}
        <link rel="preload" href="/images/IMG_0043.JPG" as="image" media="(min-width: 768px)" />
        <link rel="preload" href="/images/IMAGE-2025-10-17_21-48-37.jpg" as="image" media="(min-width: 768px)" />
        
        {/* Mobile-specific prefetch */}
        <link rel="prefetch" href="/catalog" />
        <link rel="prefetch" href="/api/products?limit=12" />
        
        {/* DNS prefetch and preconnect */}
        <link rel="dns-prefetch" href="//placehold.co" />
        <link rel="preconnect" href="https://placehold.co" crossOrigin="anonymous" />
        
        {/* Resource hints for better performance */}
        <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
        <link rel="modulepreload" href="/_next/static/chunks/framework.js" />
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        
        {/* Mobile-specific optimizations */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/images/browser-open.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {/* Meta Pixel - loaded asynchronously after page interactive */}
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1148656287371559');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1148656287371559&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        
        <a href="#main-content" className="skip-link">
          Перейти до основного контенту
        </a>
        <ErrorBoundary>
          <AppProvider>
            <BasketProvider>
              <WishlistProvider>
                <CategoriesProvider>
                  <Header />
                  <MainContent id="main-content">{children}</MainContent>
                  <Footer />
                </CategoriesProvider>
              </WishlistProvider>
            </BasketProvider>
          </AppProvider>
        </ErrorBoundary>
        
        {/* Service Worker registration - loaded after interactive */}
        <Script
          id="service-worker"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(${registerServiceWorker.toString()})();`
          }}
        />
        
        <WebVitals />
      </body>
    </html>
  );
}
