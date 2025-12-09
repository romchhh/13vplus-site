// Mobile-optimized service worker for 13VPLUS e-commerce
  const CACHE_NAME = '13vplus-mobile-v3';
const STATIC_CACHE = '13vplus-static-v3';
const DYNAMIC_CACHE = '13vplus-dynamic-v3';
const IMAGE_CACHE = '13vplus-images-v3';
const MOBILE_CACHE = '13vplus-mobile-v3';

// Critical resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/catalog',
  '/images/13VPLUS BLACK PNG 2.png',
  '/images/Знімок екрана 2025-10-17 о 22.25.53.png', // Mobile hero image
  '/images/location-icon.svg',
  '/images/email-icon.svg',
  '/images/instagram-icon.svg',
  '/images/facebook-icon.svg'
  // Video only cached on desktop, Why Choose Us images load on scroll
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for 5 minutes
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
              // Clean cache after 5 minutes
              setTimeout(() => {
                cache.delete(request);
              }, 5 * 60 * 1000);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request);
        })
    );
    return;
  }

  // Handle images and videos with mobile-optimized cache-first strategy
  if (url.pathname.startsWith('/images/') || 
      url.pathname.startsWith('/api/images/') ||
      request.destination === 'image' ||
      request.destination === 'video') {
    
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request).then((response) => {
            if (response.status === 200) {
              // Only cache smaller images on mobile to save storage
              const isMobile = request.headers.get('user-agent')?.includes('Mobile');
              const contentLength = response.headers.get('content-length');
              const fileSize = contentLength ? parseInt(contentLength) : 0;
              
              // Cache all images on desktop, only <2MB on mobile
              if (!isMobile || fileSize < 2 * 1024 * 1024) {
                cache.put(request, response.clone());
              }
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Handle static assets and pages with stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const cache = url.pathname.startsWith('/_next/') ? 
            caches.open(STATIC_CACHE) : 
            caches.open(DYNAMIC_CACHE);
          
          cache.then((c) => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
      });

      // Return cached version immediately, update in background
      return cachedResponse || fetchPromise;
    })
  );
});