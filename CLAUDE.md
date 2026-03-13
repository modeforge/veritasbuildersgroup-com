# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

**Project:** veritasbuildersgroup.com redesign
**Built by:** Modeforge (Ryan + Claude)
**Status:** V1 complete — awaiting Vercel deployment and domain transfer

---

## Client Overview

Veritas Builders Group LLC

- Location: Monticello, FL 32344 (Jefferson County)
- Owner: Personal friend of Ryan's
- Phone: 850-347-1467
- Email: `admin@veritasbuildersgroup.com`
- FL License: CBC1266699 (Certified Building Contractor — Active)

**Services:** Home remodels, custom residential/commercial builds, decks, sheds, solar installation, general commercial work

**Service area:** Jefferson County and surrounding North Florida (Tallahassee, Madison, Perry, Quincy, etc.)

---

## Stack & Architecture

**Single-file static HTML/CSS/JS** — no build step, no dependencies, no framework.
Deployment target: Vercel. Drop `index.html` in repo root and Vercel serves it directly.

The entire site lives in one HTML file. CSS is in a `<style>` block at the top; JavaScript is in a `<script>` block at the bottom. No external JS libraries.

**Current file:** `comp/veritas-builders-group.html` — this is the V1 build, not yet moved to `index.html` at root for deployment.

**Fonts (Google Fonts):**

- Display/headings: `Oswald` (700, 600, 500, 400)
- Body: `Source Serif 4` (300, 300i, 400)

**Color palette (CSS custom properties):**

```css
--red:       #C0392B   /* primary brand red */
--red-dark:  #96281B   /* hover states */
--red-light: #E74C3C   /* hero accents, eyebrows */
--gray-900:  #1a1a1a   /* dark backgrounds */
--gray-800:  #2d2d2d   /* form fields */
--gray-600:  #555555   /* body text, muted */
--gray-300:  #cccccc   /* reversed text */
--gray-100:  #f5f5f5   /* light section bg */
--gold:      #B8A97A   /* nav logo accent */
```

**Design direction:** Industrial/editorial. Bold Oswald uppercase typography, strong red/dark contrast, restrained serif body copy.

---

## Page Sections (in order)

1. Fixed nav — logo, links, phone CTA always visible
2. Hero — split layout, kitchen "after" photo right, animated headline left
3. Red stats bar — 20+ years, licensed & insured, free estimates, local
4. Services grid — 6 service cards with hover accent
5. Before/after slider — interactive drag slider, kitchen remodel photos
6. Why Veritas — split section, red left (trust points + license #), gray right (service area + CTA)
7. Contact — two-column, contact info left + form right (frontend-only, no backend wired)
8. Footer

---

## Images

Both before/after photos are **embedded as base64** in the HTML (~850KB total file size). This is intentional for V1 simplicity.

- Before: `IMG_7915.HEIC` — dated 70s kitchen, floral wallpaper
- After: `IMG_8163.HEIC` — modern white shaker cabinets, granite, stainless, LVP flooring

For V2, extract images to `/public/images/` and reference by path.

---

## Deployment

No configuration needed for Vercel with a single static file:

```bash
# Rename comp file, commit, push to GitHub, import in Vercel dashboard
cp comp/veritas-builders-group.html index.html
git add index.html
git commit -m "Deploy V1"
# Or: npx vercel deploy
```

Optional `vercel.json` for cache headers when images move to `/public/images/`:

```json
{
  "headers": [
    {
      "source": "/public/images/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

---

## Known Gaps / Next Steps

### Before go-live

- [ ] Move `comp/veritas-builders-group.html` → `index.html` at repo root
- [ ] Deploy to Vercel, point `veritasbuildersgroup.com` DNS
- [ ] Confirm business hours (placeholder: Mon–Fri 8am–5pm, Sat by appt)
- [ ] Confirm service area city list is accurate
- [ ] Confirm `admin@veritasbuildersgroup.com` is actively monitored

### V2

- [ ] Extract base64 images → `/public/images/` directory
- [ ] Wire contact form (Formspree, Netlify Forms, or Resend work well with Vercel static)
- [ ] Add more before/after photo sets (client has many)
- [ ] Project gallery (grid or lightbox)
- [ ] Testimonials/reviews section
- [ ] Google Analytics or Fathom
- [ ] `sitemap.xml`, `robots.txt`, meta description, OG tags, favicon
- [ ] Accessibility pass (WCAG AA — red background contrast, alt text, keyboard nav)

### Longer term

- [ ] Multi-page split (services detail pages, project portfolio)
- [ ] Local SEO citations (Monticello/Jefferson County NAP consistency)
- [ ] Real logo (current nav/footer uses text-based logotype)

---

## Internal Notes

- Personal relationship with owner — keep communication casual
- Brand built from scratch (no existing logo, no prior assets) based on red/gray preference
- BuildZoom score: 90 — not a standout stat, leave off the site
