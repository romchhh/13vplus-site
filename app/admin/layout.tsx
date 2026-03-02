// /app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { SidebarProvider } from "@/lib/SidebarContext";
import ClientLayoutShell from "@/components/admin/ClientLayoutShell";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Choice — Admin Panel",
  icons: {
    icon: "/images/choice-features/open-browser.png",
    shortcut: "/images/choice-features/open-browser.png",
    apple: "/images/choice-features/open-browser.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <head>
        {/* Additional favicon for compatibility */}
        <link rel="icon" type="image/png" href="/images/choice-features/open-browser.png" />
        <link rel="shortcut icon" type="image/png" href="/images/choice-features/open-browser.png" />
        <link rel="apple-touch-icon" href="/images/choice-features/open-browser.png" />
      </head>
      <body className={montserrat.className}>
          <SidebarProvider>
            <ClientLayoutShell>{children}</ClientLayoutShell>
          </SidebarProvider>
      </body>
    </html>
  );
}
