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
  title: "13VPLUS — Admin Panel",
  icons: {
    icon: "/images/13vplus-logo-favicon.png",
    shortcut: "/images/13vplus-logo-favicon.png",
    apple: "/images/13vplus-logo-favicon.png",
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
        <link rel="icon" type="image/png" href="/images/13vplus-logo-favicon.png" />
        <link rel="shortcut icon" type="image/png" href="/images/13vplus-logo-favicon.png" />
        <link rel="apple-touch-icon" href="/images/13vplus-logo-favicon.png" />
      </head>
      <body className={montserrat.className}>
          <SidebarProvider>
            <ClientLayoutShell>{children}</ClientLayoutShell>
          </SidebarProvider>
      </body>
    </html>
  );
}
