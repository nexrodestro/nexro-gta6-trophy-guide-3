// A small static server for app/ (Node 22, standard library only), so the guide can
// be tried locally without a build step: `node serve.ts` serves app/ on
// http://localhost:8080 (`--port <n>` for another port). It sends the MIME types a
// browser needs, refuses any path outside app/, and otherwise does nothing clever:
// this is a development convenience, not a web server for the internet.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(fileURLToPath(new URL('./app', import.meta.url)));

function choosePort() {
  const args = process.argv.slice(2);
  const at = args.indexOf('--port');
  if (at === -1) return 8080;
  const wanted = Number(args[at + 1]);
  return Number.isInteger(wanted) && wanted > 0 && wanted < 65536 ? wanted : 8080;
}

const MEDIA = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.woff2', 'font/woff2'],
  ['.webmanifest', 'application/manifest+json'],
]);

function respond(request, response) {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (path.endsWith('/')) path += 'index.html';
  const file = resolve(join(appDir, normalize(path)));
  if (file !== appDir && !file.startsWith(appDir + sep)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  let size;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('not a file');
    size = info.size;
  } catch {
    response.writeHead(404).end('not found');
    return;
  }
  response.writeHead(200, {
    'content-type': MEDIA.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}

const listenPort = choosePort();
createServer(respond).listen(listenPort, '127.0.0.1', () => {
  console.log(`app/ is on http://localhost:${listenPort}`);
});
