import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
const build = (await readFile(".next/BUILD_ID", "utf8")).trim();
async function walk(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      files.map((f) =>
        f.isDirectory() ? walk(join(dir, f.name)) : [join(dir, f.name)],
      ),
    )
  ).flat();
}
const assets = (await walk(".next/static"))
  .filter((f) => !f.endsWith(".map"))
  .map((f) => f.replace(".next/", "/_next/"));
await writeFile(
  "public/sw.js",
  `
const cacheName='ppl-shell-${build}';
const shell=${JSON.stringify(["/", "/plates.webp", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", ...assets])};
self.addEventListener('install',event=>{event.waitUntil(caches.open(cacheName).then(cache=>cache.addAll(shell)))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ppl-shell-')&&k!==cacheName).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==location.origin||url.pathname.startsWith('/api/')||url.searchParams.has('_rsc'))return;
 if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.open(cacheName).then(c=>c.match('/'))));return}
 if(shell.includes(url.pathname))event.respondWith(caches.open(cacheName).then(async cache=>(await cache.match(url.pathname))||fetch(event.request)));
});
`,
);
