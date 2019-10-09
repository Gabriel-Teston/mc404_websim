// use a cacheName for cache versioning
var cacheName = 'v1.02:static';

// during the install phase you usually want to cache static assets
self.addEventListener('install', function(e) {
    // once the SW is installed, go ahead and fetch the resources to make this work offline
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll([
                './whisper.js',
                './whisper.wasm',
                './sim.css',
                './interface.js',
                './sim.html',
                './simulator_controller.js',
                './simulator_worker.js',
                './module_loader.js',
                './devices/midi_synthesizer.js',
                './devices/simple_interrupt.js',
                './devices/cleaner_robot.js',
                './dependencies/roomba-unity/Build/build.data.unityweb',
                './dependencies/roomba-unity/Build/build.json',
                './dependencies/roomba-unity/Build/build.wasm.code.unityweb',
                './dependencies/roomba-unity/Build/build.wasm.framework.unityweb',
                './dependencies/roomba-unity/Build/UnityLoader.js',
                './dependencies/roomba-unity/TemplateData/fullscreen.png',
                './dependencies/roomba-unity/TemplateData/progressEmpty.Dark.png',
                './dependencies/roomba-unity/TemplateData/progressEmpty.Light.png',
                './dependencies/roomba-unity/TemplateData/progressFull.Dark.png',
                './dependencies/roomba-unity/TemplateData/progressFull.Light.png',
                './dependencies/roomba-unity/TemplateData/progressLogo.Dark.png',
                './dependencies/roomba-unity/TemplateData/progressLogo.Light.png',
                './dependencies/roomba-unity/TemplateData/style.css',
                './dependencies/roomba-unity/TemplateData/UnityProgress.js',
                './dependencies/roomba-unity/TemplateData/webgl-logo.png',
                './dependencies/roomba-unity/index.html',
                './third-party/webaudio-tinysynth.js',
                './images/logo_192.png',
                './images/logo_b_192.png',
                './images/logo_128.png',
                './images/logo_512.png',
                'https://code.jquery.com/jquery-3.3.1.slim.min.js',
                'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
                'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js'
            ]).then(function() {
                self.skipWaiting();
            });
        })
    );
});

// when the browser fetches a url
self.addEventListener('fetch', function(event) {
    // either respond with the cached object or go ahead and fetch the actual url
    event.respondWith(
        caches.match(event.request).then(function(response) {
            if (response) {
                // retrieve from cache
                return response;
            }
            // fetch as normal
            return fetch(event.request);
        })
    );
});