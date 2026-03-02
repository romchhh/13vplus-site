import type { Metadata } from "next";
import { Suspense } from "react";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./critical.css";
import "./globals.css";
import "./mobile-optimizations.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AppProvider } from "@/lib/GeneralProvider";
import { BasketProvider } from "@/lib/BasketProvider";
import { CategoriesProvider } from "@/lib/CategoriesProvider";
import { registerServiceWorker } from "@/lib/registerSW";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { WebVitals } from "@/components/shared/WebVitals";
import MainContent from "@/components/shared/MainContent";
import { OrganizationStructuredData, WebSiteStructuredData } from "@/components/shared/StructuredData";

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

const baseUrlForMeta = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrlForMeta),
  title: "Choice — Офіційний представник в Україні | Eco та wellness для здоров'я і дому",
  description:
    "Офіційний представник бренду Choice в Україні. Wellness-комплекси, натуральний догляд та eco-засоби для щоденного життя. Консультація та замовлення оригінальної продукції.",
  keywords:
    "Choice, Choice Україна, wellness, eco, фітокомплекси, вітаміни, корекція ваги, догляд за тілом, eco-засоби для дому, офіційний представник Choice",
  icons: {
    icon: "/images/choice-features/open-browser.png",
    shortcut: "/images/choice-features/open-browser.png",
    apple: "/images/choice-features/open-browser.png",
  },
  openGraph: {
    title: "Choice — Офіційний представник в Україні | Eco та wellness",
    description:
      "Оригінальна продукція Choice: wellness-комплекси, натуральний догляд та eco-засоби для здоров'я і дому.",
    type: "website",
    locale: "uk_UA",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: baseUrlForMeta,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";

  return (
    <html lang="uk" className={montserrat.className}>
      <head>
        <OrganizationStructuredData url={baseUrl} baseUrl={baseUrl} />
        <WebSiteStructuredData baseUrl={baseUrl} />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="alternate" type="text/plain" href="/ai.txt" title="AI context (ai.txt)" />
        {/* Mobile viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/png" href="/images/choice-features/open-browser.png" />
        <link rel="shortcut icon" type="image/png" href="/images/choice-features/open-browser.png" />
        <link rel="apple-touch-icon" href="/images/choice-features/open-browser.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/browser-open.png" as="image" />
        {/* Hero image preload */}
        <link rel="preload" href="/images/hf_20260222_063745_3c9c7bbc-82d2-4f3f-8c11-4216792e4995.jpeg" as="image" />
        <link rel="preload" href="/api/products/top-sale" as="fetch" crossOrigin="anonymous" />
        
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
        <link rel="apple-touch-icon" href="/images/choice-features/open-browser.png" />
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
              <CategoriesProvider>
                <Header />
                <Suspense fallback={<main id="main-content" className="bg-[var(--background-warm-yellow)] mt-[5.75rem] lg:mt-[7.75rem] min-h-screen" />}>
                  <MainContent id="main-content">{children}</MainContent>
                </Suspense>
                <Footer />
              </CategoriesProvider>
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
