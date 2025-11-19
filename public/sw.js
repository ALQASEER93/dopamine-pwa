self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // simple SW – يمكن لاحقاً إضافة كاش
});

self.addEventListener('fetch', () => {
  // مكان مناسب لإضافة caching لو احتجت
});

