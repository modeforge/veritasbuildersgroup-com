# Site V2 Design — Veritas Builders Group
**Date:** 2026-03-12
**Scope:** Lead generation improvements + project gallery page

---

## Goals

- Drive more phone calls and form submissions from the homepage
- Add a `/projects` page ready to populate with client photos
- Wire the contact form to actually send emails
- Add proper meta/OG tags before go-live

## Architecture

Single-page site stays single-page. One new page added: `projects.html`.

```
veritasbuildersgroup-com/
├── index.html          ← homepage (modified)
├── projects.html       ← new project gallery page
├── CLAUDE.md
└── ...
```

No new dependencies. Vanilla JS only, consistent with the existing codebase.

---

## Homepage Changes (`index.html`)

### 1. Testimonials Section

**Position:** Between "Why Veritas" section and "Contact" section.

**Design:**
- Background: `--gray-900` (dark, matches existing dark sections)
- Section label: "What Our Clients Say" in red eyebrow style
- Section title: "REAL RESULTS. REAL CLIENTS." in Oswald bold
- 3-card grid, responsive (3 cols → 1 col on mobile)

**Card anatomy:**
- Thin red left-border (`4px solid var(--red)`)
- Pull quote in `Source Serif 4` italic, `--gray-300`
- Attribution line: First name + last initial + project type + city in Oswald small caps (e.g. "Karen B. — Kitchen Remodel, Monticello")

**Content:** Pull verbatim quotes from existing Google/Facebook reviews. Attribute by first name + last initial only.

---

### 2. Free Estimate CTA Band

**Position:** Between Testimonials section and Contact section.

**Design:**
- Full-width red band (`--red` background)
- White Oswald headline: "READY TO START YOUR PROJECT?"
- Phone number large and clickable: `tel:850-347-1467`
- Button: white background, red text → "Get a Free Estimate" → smooth scroll to `#contact`
- Tight padding (3rem top/bottom), no filler content

---

### 3. Nav Update

Add "Projects" link to the fixed nav between "Services" and the phone CTA. Links to `projects.html`.

---

### 4. Contact Form — Formspree

**Change:** Add `action` and `method` to the existing `<form>` tag.

```html
<form action="https://formspree.io/f/[FORM_ID]" method="POST">
```

Steps:
1. Sign up at formspree.io with `admin@veritasbuildersgroup.com`
2. Create a new form, copy the endpoint ID
3. Replace `[FORM_ID]` above

The existing success state UI in the JS can stay or be removed — Formspree handles the redirect. Simplest path: remove the fake JS submit handler and let Formspree handle it natively.

---

### 5. Meta / OG Tags + Favicon

Add to `<head>` in `index.html`:

```html
<meta name="description" content="Veritas Builders Group — Licensed Florida contractor serving Jefferson County and North Florida. Kitchen remodels, custom builds, decks, solar. Call 850-347-1467.">
<meta property="og:title" content="Veritas Builders Group — Jefferson County FL Contractor">
<meta property="og:description" content="Licensed, insured, locally owned. Kitchen remodels, custom builds, decks, solar installation. Serving Monticello, Tallahassee, and North Florida. Free estimates.">
<meta property="og:image" content="https://veritasbuildersgroup-com.vercel.app/og-image.jpg">
<meta property="og:url" content="https://veritasbuildersgroup.com">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="data:image/png;base64,[BASE64_FAVICON]">
```

**Favicon:** 32×32 PNG, red square (`#C0392B`) with white "V" centered in Oswald. Generate as base64 and inline — no extra file needed.

---

## New Page: `projects.html`

### Layout

Full standalone HTML page sharing the same CSS variables, fonts, and nav as `index.html`. Dark background (`--gray-900`) throughout.

**Hero area:**
- Same fixed nav (with "Projects" active state)
- Simple page header: section label "Our Work", H1 "PROJECT GALLERY" in Oswald
- No photo, no slider — clean and fast

**Grid:**
- CSS Grid, 3 columns on desktop → 2 on tablet → 1 on mobile
- `gap: 1.5rem`
- Each card: `aspect-ratio: 4/3`, cover photo fills card

**Card anatomy:**
```
[ PHOTO (after shot) ]
[ PROJECT TYPE      ]  ← Oswald caps, white
[ Location, FL      ]  ← Oswald small, --gray-300
```

On hover: red overlay at 60% opacity, white "View Project →" centered.

**Click → Lightbox:**
- Full-screen overlay, dark background
- If both before/after photos exist: the same drag-slider component from the homepage (extract as a reusable function)
- If only after photo: full-width image, centered
- Close on click-outside or ESC key
- No external library

**Starting content:** Kitchen remodel (Monticello, FL) — both before/after photos already available.

**Adding future projects:** Each project is a self-contained card block in the HTML. To add a new project, duplicate the card block and update the photo path, type, and location. No JS changes needed.

**Meta tags for `/projects`:**
```html
<meta name="description" content="Project gallery — Veritas Builders Group. Kitchen remodels, decks, custom builds across Jefferson County and North Florida.">
<meta property="og:title" content="Our Work — Veritas Builders Group">
```

---

## Implementation Order

1. Meta/OG tags + favicon → `index.html` (quick, high value, do first)
2. Nav "Projects" link → `index.html`
3. Testimonials section → `index.html`
4. Free Estimate CTA band → `index.html`
5. Formspree form wiring → `index.html`
6. `projects.html` — full page build
7. Commit + push → auto-deploys to Vercel

---

## Out of Scope (This Build)

- Service-area location pages (SEO) — add later
- Blog / content marketing — add later
- Google Analytics — add later
- Multi-page service detail pages — add later
