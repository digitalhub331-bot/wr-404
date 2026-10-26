# WR-404

**Your thoughts, met with clarity.**

WR-404 is a free, static reflection chatbot. It uses browser-side JavaScript response logic, requires no account or paid API, and sends no chat or memory data to a server. It is not a generative AI model; its answers come from a small set of built-in topic responses.

## Files

- `index.html` — page structure
- `style.css` — responsive classified-document interface
- `script.js` — chat replies, optional voice, and local memory log
- `logo.svg` — Quiet Signal mark
- `service-worker.js` — caches app files for return visits while offline
- `manifest.webmanifest` — installable web app metadata

## Run locally

Open `index.html` in a browser. Typed chat and local memory work without an account. Browser voice support varies; voice input or speech synthesis may rely on browser services and may not work offline. Service-worker offline caching requires the site to be served over HTTPS or localhost, as it will be on GitHub Pages.

## Publish free with GitHub Pages

1. Sign in to GitHub and create a **public** repository named `wr-404` (or another name you prefer).
2. Upload all files in this folder to the repository root. Keep `index.html` at the root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/(root)`, then save.
5. Wait for GitHub Pages to finish publishing. The share link will be `https://YOUR-USERNAME.github.io/wr-404/`.

You can alternatively upload with GitHub Desktop or the `git` command line. Pages is static hosting; this version has no shared database and does not synchronize memories between visitors.

## Privacy

Chat messages stay in the current page session. Memory entries are written to `localStorage` only after the visitor opts in and saves them. Visitors can delete entries individually or clear the log. Browser storage is not end-to-end encrypted; anyone with access to that browser profile may be able to view it. Voice input/output is handled by the browser and may use its online services.

The code includes a commented placeholder for a future AI connection. Never place a private API key in a public GitHub Pages repository; use a secure server-side proxy if you add a model later.

## Safety note

WR-404 is a supportive reflection tool, not medical, legal, financial, or professional advice. It does not diagnose or replace qualified support. In an immediate emergency, contact local emergency services or a trusted person.
