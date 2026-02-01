import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function base64Decode(str: string): string {
  try {
    if (typeof atob !== 'undefined') {
      return atob(str);
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < str.length) {
      const enc1 = chars.indexOf(str.charAt(i++));
      const enc2 = chars.indexOf(str.charAt(i++));
      const enc3 = chars.indexOf(str.charAt(i++));
      const enc4 = chars.indexOf(str.charAt(i++));
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      output += String.fromCharCode(chr1);
      if (enc3 !== 64) output += String.fromCharCode(chr2);
      if (enc4 !== 64) output += String.fromCharCode(chr3);
    }
    return output;
  } catch (e) {
    throw new Error('Invalid base64 string');
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // CRITICAL FIX: Handle webhook routes FIRST before any other logic
  // This prevents Server Actions validation from running
  if (pathname.startsWith("/api/wayforpay/webhook") || 
      pathname.startsWith("/api/plisio/webhook")) {
    
    console.log("[Middleware] Webhook route detected:", pathname);
    
    // Create a response that bypasses Server Actions
    const response = NextResponse.next();
    
    // Remove headers that trigger Server Actions validation
    // These headers are set by the proxy/load balancer and cause Server Actions validation
    response.headers.delete("x-forwarded-host");
    response.headers.delete("origin");
    
    // Set headers to indicate this is NOT a Server Action
    response.headers.set("Content-Type", "application/json");
    response.headers.set("X-Middleware-Webhook", "true");
    
    return response;
  }

  // POST to /success (e.g. WayForPay redirect): redirect to GET to avoid Next.js Invalid URL when origin/url is null
  if (pathname === "/success" && request.method === "POST") {
    const base = process.env.PUBLIC_URL || process.env.NEXT_PUBLIC_PUBLIC_URL || "http://localhost:3000";
    const successUrl = `${base.replace(/\/$/, "")}${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(successUrl, 303);
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Performance headers for images
  if (pathname.startsWith('/images/') || pathname.startsWith('/api/images/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Accept-Ranges', 'bytes');
  }

  // Static assets caching
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('Vary', 'Accept-Encoding');
  }

  // Mobile optimizations
  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
  
  if (isMobile) {
    response.headers.set('X-Mobile-Optimized', 'true');
    response.headers.set('Critical-CH', 'Viewport-Width, Device-Memory');
  }

  // Admin authentication logic
  if (!pathname.startsWith("/admin")) {
    return response;
  }

  if (pathname.startsWith("/api/auth/")) {
    return response;
  }

  // Check authentication
  const authCookie = request.cookies.get("admin_auth");
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const token = authCookie.value;
      const decoded = base64Decode(token);
      const [user, password] = decoded.split(":");

      const validUser = process.env.ADMIN_USER;
      const validPass = process.env.ADMIN_PASS;

      if (user === validUser && password === validPass) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error("[Middleware] Auth error:", e);
    }
  }

  // Redirect authenticated users away from login
  if (pathname === "/admin/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Allow login page
  if (pathname === "/admin/login") {
    return response;
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/wayforpay/webhook/:path*", // Explicitly include webhook routes
    "/api/plisio/webhook/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};