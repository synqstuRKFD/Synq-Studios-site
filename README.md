# SYNQ Studios website

Live at https://synqstudios815.com

- `dist/` is the published website. Netlify serves this folder (see `netlify.toml`) and redeploys on every push.
- `build-cinematic.py` holds the page content (English + Spanish), rates, links and SEO settings. Edit it, then run
  `python3 build-cinematic.py` to rebuild `dist/` (including the Spanish page `es.html`, made by `prerender-es.js`).
- `layouts/` styles, `images/` photos, `*.js` behaviour (language switch, booking form, text box, animations).

Bookings: Square (https://squareup.com/appointments/book/L6PTGPVMKXW8A). Form emails: Web3Forms.
