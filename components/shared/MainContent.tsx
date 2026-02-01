"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface MainContentProps {
  children: React.ReactNode;
  id?: string;
}

export default function MainContent({ children, id }: MainContentProps) {
  const pathname = usePathname();
  const [isHomePage, setIsHomePage] = useState(false);

  useEffect(() => {
    setIsHomePage(pathname === "/");
  }, [pathname]);

  return (
    <main id={id} className={`bg-white ${isHomePage ? "" : "mt-16 lg:mt-20"}`}>
      {children}
    </main>
  );
}

