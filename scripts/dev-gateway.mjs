#!/usr/bin/env node
/**
 * Optional leftover: same-origin Node proxy for app + API.
 *
 * Daily development uses Vite only (`pnpm dev:app` on 5174) with
 * `server.proxy['/api']` → 8001. Keep this script only if something
 * still needs the old 5100 entry.
 *
 *   http://127.0.0.1:5100/BASE/  → Vite app (5174)
 *   http://127.0.0.1:5100/MES/   → Vite app (5174)
 *   http://127.0.0.1:5100/api/   → API gateway (8001)
 *   http://127.0.0.1:5100/       → redirect /BASE/ (login or home)
 */
import http from 'node:http'
import { URL } from 'node:url'

const PORT = Number(process.env.MMDA_GATEWAY_PORT || 5100)
const HOST = process.env.MMDA_GATEWAY_HOST || '127.0.0.1'
const APP_TARGET = process.env.MMDA_APP_VITE || 'http://127.0.0.1:5174'
const API_TARGET = process.env.MMDA_API_GATEWAY || 'http://127.0.0.1:8001'

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
])

function pickTarget(pathname) {
  if (pathname === '/api' || pathname.startsWith('/api/')) return API_TARGET
  return APP_TARGET
}

function filterHeaders(headers) {
  const out = {}
  for (const [key, value] of Object.entries(headers)) {
    if (value == null) continue
    if (HOP_BY_HOP.has(key.toLowerCase())) continue
    out[key] = value
  }
  return out
}

function redirectToApp(res) {
  res.writeHead(302, {
    location: '/BASE/',
    'cache-control': 'no-store',
  })
  res.end()
}

function proxyHttp(req, res, targetBase) {
  const incoming = new URL(req.url || '/', `http://${HOST}:${PORT}`)
  const target = new URL(incoming.pathname + incoming.search, targetBase)
  const headers = filterHeaders(req.headers)
  headers.host = target.host

  const upstream = http.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (upRes) => {
      res.writeHead(upRes.statusCode || 502, filterHeaders(upRes.headers))
      upRes.pipe(res)
    },
  )

  upstream.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' })
    }
    res.end(`Bad gateway: ${targetBase} (${err.message})`)
  })

  req.pipe(upstream)
}

function proxyWs(req, socket, head, targetBase) {
  const incoming = new URL(req.url || '/', `http://${HOST}:${PORT}`)
  const target = new URL(incoming.pathname + incoming.search, targetBase)
  const headers = filterHeaders(req.headers)
  headers.host = target.host

  const upstream = http.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port,
    path: target.pathname + target.search,
    method: req.method,
    headers: {
      ...headers,
      connection: req.headers.connection || 'Upgrade',
      upgrade: req.headers.upgrade || 'websocket',
    },
  })

  upstream.on('upgrade', (upRes, upSocket, upHead) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n${Object.entries(
        filterHeaders(upRes.headers),
      )
        .flatMap(([k, v]) =>
          (Array.isArray(v) ? v : [v]).map((item) => `${k}: ${item}\r\n`),
        )
        .join('')}Upgrade: websocket\r\nConnection: Upgrade\r\n\r\n`,
    )
    if (upHead?.length) socket.write(upHead)
    upSocket.pipe(socket)
    socket.pipe(upSocket)
  })

  upstream.on('error', () => {
    socket.destroy()
  })

  upstream.end(head)
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url || '/', `http://${HOST}:${PORT}`).pathname
  if (pathname === '/' || pathname === '') {
    redirectToApp(res)
    return
  }
  const target = pickTarget(pathname)
  if (!target) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(`No route for ${pathname}`)
    return
  }
  proxyHttp(req, res, target)
})

server.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url || '/', `http://${HOST}:${PORT}`).pathname
  const target = pickTarget(pathname)
  if (!target) {
    socket.destroy()
    return
  }
  proxyWs(req, socket, head, target)
})

server.listen(PORT, HOST, () => {
  console.log(`[mmda-gateway] http://${HOST}:${PORT}/`)
  console.log(`  /BASE → ${APP_TARGET}`)
  console.log(`  /MES  → ${APP_TARGET}`)
  console.log(`  /api  → ${API_TARGET}`)
})
