// ============================================================
// ===== Service Worker - متجر طالب الله =====
// ============================================================

const CACHE_NAME = 'taleb-store-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json'
];

// تثبيت
self.addEventListener('install', (event) => {
    console.log('✅ SW Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// تفعيل
self.addEventListener('activate', (event) => {
    console.log('✅ SW Activated');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// جلب - Network First (يتم تحميل من الإنترنت أولاً، إذا فشل يستخدم الكاش)
self.addEventListener('fetch', (event) => {
    // تجاهل طلبات Google Apps Script
    if (event.request.url.includes('script.google.com')) {
        return;
    }
    
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // احفظ نسخة في الكاش
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                // إذا فشل الإنترنت، جرب الكاش
                return caches.match(event.request);
            })
    );
});

// معالجة الإشعارات
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('./')
    );
});
