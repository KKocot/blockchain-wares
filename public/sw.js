self.addEventListener('install', function() {
  self.skipWaiting();
});

self.addEventListener('activate', function() {
  self.registration.unregister();
  caches.keys().then(function(names) {
    names.forEach(function(name) { caches.delete(name); });
  });
});
