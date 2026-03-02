// /components/ClientLayoutShell.tsx
"use client";

import { useSidebar } from '@/lib/SidebarContext';
import AppSidebar from '@/components/admin/AppSidebar';
import AppHeader from '@/components/admin/AppHeader';
import Backdrop from '@/components/admin/Backdrop';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();

  // Check if we're on the login page
  const isLoginPage = pathname === '/admin/login';

  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
    ? 'lg:ml-[290px]'
    : 'lg:ml-[90px]';

  // If login page, render without sidebar and header
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen xl:flex min-w-0 overflow-x-hidden">
      <AppSidebar />
      <Backdrop />
      <div
        className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="px-3 py-4 mx-auto max-w-[--breakpoint-2xl] sm:px-4 md:px-6 md:py-6 w-full overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
