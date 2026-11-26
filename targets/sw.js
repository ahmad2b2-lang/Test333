// Today's Targets: offline cache + reminder notifications.
const C = 'tt-app-v2';
const API = 'https://bhfgwlkzkbwcwyoypwhy.supabase.co/functions/v1/today-targets';
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'badge-96.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('tt-app-') && k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first, saved copy when offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.origin !== location.origin || !u.pathname.startsWith(new URL('./', self.registration.scope).pathname)) return;
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html'))));
});

const scopeUrl = p => new URL(p || './', self.registration.scope).href;

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: "Today's Targets", body: e.data && e.data.text() }; }
  const opts = {
    body: d.body || '',
    tag: d.tag || 'tt',
    renotify: true,
    icon: 'icon-192.png',
    badge: 'badge-96.png',
    vibrate: [80, 60, 80],
    data: { url: scopeUrl(d.url), target_id: d.target_id || null, key: d.key || null },
  };
  if (Array.isArray(d.actions) && d.target_id) opts.actions = d.actions.slice(0, 2);
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || "Today's Targets", opts),
    tellClients(),
  ]));
});

async function tellClients() {
  const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  cs.forEach(c => c.postMessage('refresh'));
}

self.addEventListener('notificationclick', e => {
  const n = e.notification, d = n.data || {};
  n.close();
  if ((e.action === 'done' || e.action === 'snooze') && d.target_id && d.key) {
    e.waitUntil((async () => {
      try {
        const r = await fetch(API, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'notif', key: d.key, target_id: d.target_id, op: e.action }),
        });
        const j = await r.json();
        if (e.action === 'done') {
          await self.registration.showNotification(j.left === 0 ? 'All targets done! 🎉' : 'Nice! ✅', {
            body: j.left === 0 ? 'Every target ticked today. Enjoy it.' : `${j.title ? j.title + ' is done. ' : ''}${j.left} left today.`,
            tag: 'tt-ack', icon: 'icon-192.png', badge: 'badge-96.png', silent: true, data: { url: scopeUrl() },
          });
        } else {
          await self.registration.showNotification('⏰ Snoozed', {
            body: "I'll nudge you again in about 30 minutes.", tag: 'tt-ack', icon: 'icon-192.png', badge: 'badge-96.png', silent: true, data: { url: scopeUrl() },
          });
        }
        await tellClients();
      } catch {
        await self.registration.showNotification("Couldn't reach the app", { body: 'Open it to tick this target.', tag: 'tt-ack', icon: 'icon-192.png', data: { url: scopeUrl() } });
      }
    })());
    return;
  }
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) if (c.url.startsWith(scopeUrl()) && 'focus' in c) { c.postMessage((d.url || '').includes('wrap=1') ? 'wrap' : 'refresh'); return c.focus(); }
    return self.clients.openWindow(d.url || scopeUrl());
  })());
});
