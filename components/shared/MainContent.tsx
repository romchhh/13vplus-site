"use client";

import { usePathname } from "next/navigation";

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  return (
    <main className={`bg-white ${isHomePage ? '' : 'mt-16 lg:mt-20'}`}>
      {children}
    </main>
  );
}

