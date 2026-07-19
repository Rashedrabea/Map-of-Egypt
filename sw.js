// ================================================================
//  Service Worker - أورا ماب
//  يخزن الملفات والبلاطات للاستخدام بدون إنترنت
// ================================================================

const CACHE_NAME = 'aora-map-v1';
const ASSETS = [
    '/',
    '/index.html',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2',
];

// ================================================================
//  تثبيت Service Worker
// ================================================================
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('📦 جاري تخزين الملفات الأساسية...');
            return cache.addAll(ASSETS);
        })
        .then(function() {
            console.log('✅ تم تخزين جميع الملفات الأساسية');
            return self.skipWaiting();
        })
    );
});

// ================================================================
//  تفعيل Service Worker
// ================================================================
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) {
                    return key !== CACHE_NAME;
                }).map(function(key) {
                    console.log('🗑️ حذف الكاش القديم:', key);
                    return caches.delete(key);
                })
            );
        }).then(function() {
            console.log('✅ Service Worker جاهز للعمل');
            return self.clients.claim();
        })
    );
});

// ================================================================
//  طلب البيانات - استراتيجية: Cache First ثم Network
// ================================================================
self.addEventListener('fetch', function(event) {
    var request = event.request;

    // تجاهل طلبات التحليلات والإحصائيات
    if (request.url.includes('analytics') || request.url.includes('telemetry')) {
        return;
    }

    event.respondWith(
        caches.match(request)
        .then(function(cachedResponse) {
            if (cachedResponse) {
                // إذا كان الملف موجوداً في الكاش، نعيده فوراً
                // ونقوم بتحديثه في الخلفية (للحصول على النسخة الأحدث)
                fetch(request).then(function(networkResponse) {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then(function(cache) {
                            cache.put(request, networkResponse);
                        });
                    }
                }).catch(function() {
                    // إذا فشل التحديث، لا نفعل شيء
                });
                return cachedResponse;
            }

            // إذا لم يكن الملف موجوداً في الكاش، نطلبه من الشبكة
            return fetch(request).then(function(networkResponse) {
                // نخزن الملف الجديد في الكاش
                if (networkResponse && networkResponse.status === 200) {
                    var responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(function() {
                // إذا فشل الطلب (لا إنترنت)، نعيد صفحة بديلة
                if (request.headers.get('Accept').includes('text/html')) {
                    return caches.match('/offline.html');
                }
                return new Response('⚠️ غير متصل بالإنترنت', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            });
        })
    );
});

// ================================================================
//  تحديث الكاش عند تغيير الإصدار
// ================================================================
self.addEventListener('message', function(event) {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});

console.log('✅ Service Worker - أورا ماب جاهز');