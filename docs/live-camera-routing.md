# Live Camera Routing Notes

The Live Camera page loads HLS streams from same-origin paths:

- `/parking/index.m3u8`
- `/parking2/index.m3u8`
- `/license/index.m3u8`
- `/license1/index.m3u8`

## Local Development

Local Vite development runs on `localhost:5173`, so these paths do not exist unless Vite proxies them. The dev server currently proxies the stream paths to:

```text
https://spl.camt.cmu.ac.th
```

This proxy is only for local development. It is not included in the production build.

## Production Question

Before deploying a new frontend build to the CAMT server, confirm how production routing is configured:

- Does the server already proxy `/parking/*`, `/parking2/*`, `/license/*`, and `/license1/*` to the camera or HLS source?
- Will deployment replace only static frontend files from `dist/`, or will it also replace nginx/openresty configuration?
- What internal machine, port, or service owns the HLS streams?
- Does viewing the streams require CAMT network access, VPN, or server-side access only?

Recommended deployment approach: replace only the frontend static files until the production reverse proxy configuration is understood.
