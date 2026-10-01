# Live Camera Routing Notes

The Live Camera page loads HLS streams from same-origin paths:

- `/parking/index.m3u8`
- `/parking2/index.m3u8`
- `/license/index.m3u8`
- `/license1/index.m3u8`

## Local Development

Local Vite development runs on `localhost:5173`. Vite proxies `/api/*` and all
four stream prefixes to the local backend (`http://127.0.0.1:8000` by default).
This keeps the API and native HLS requests on the same browser origin so the
HttpOnly stream cookie works in both hls.js and Safari/iOS native playback.
Override the target with `VITE_BACKEND_PROXY_TARGET` when the backend listens
elsewhere.

These Vite proxy rules are development-only and are not included in the
production build.

## Production Question

Before deploying a new frontend build to the CAMT server, route all stream
prefixes to the backend's protected stream proxy (see
`spl-backend/docs/camera-stream-proxy-handoff.md`). Confirm the production API
and frontend use the same HTTPS hostname so the Secure stream cookie is sent
with native HLS requests. Also confirm:

- Will deployment replace only static frontend files from `dist/`, or will it also replace nginx/openresty configuration?
- What internal machine, port, or service owns the HLS streams?
- Does viewing the streams require CAMT network access, VPN, or server-side access only?

The backend stream proxy reads `EDGE_BASE_URL` (defaults to the current camera
edge host) and supports all four frontend stream prefixes. Keep the edge host
inaccessible to public clients where practical.
