# Cabinet of Unfinished Wonders

A React + Vite fact-learning experience backed by the asynchronous Daily Learning Facts API.

## Local development

```bash
npm install
npm run dev
```

Vite proxies browser requests from `/api` to `https://api.ayush.ltd`, avoiding local CORS restrictions.

## Production

The client uses same-origin `/api` requests by default. Configure the production host to reverse-proxy `/api` to `https://api.ayush.ltd`.

If the API later allows cross-origin browser requests, set `VITE_FACTS_API_URL=https://api.ayush.ltd` during the build instead.

## Build

```bash
npm run build
```
