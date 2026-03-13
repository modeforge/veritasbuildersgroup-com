# Site V2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add testimonials, CTA band, projects gallery page, Formspree form wiring, and meta/OG tags to the Veritas Builders Group site.

**Architecture:** Single static HTML/CSS/JS site. `index.html` gets new sections and tags. New `projects.html` shares the same CSS variables, font stack, and nav. No build step, no dependencies, no libraries. Images extracted from base64 to `/public/images/` to avoid duplication between pages.

**Tech Stack:** Vanilla HTML/CSS/JS. Formspree for form submissions. Vercel static hosting. Auto-deploys on `git push origin main`.

---

## Prerequisites

Before starting:
- [ ] Sign up at formspree.io with `admin@veritasbuildersgroup.com`
- [ ] Create a new form, copy the form ID (looks like `xyzabcde`)
- [ ] Have at least 2–3 real customer quotes ready (pull from Google/Facebook reviews)

---

## Task 1: Extract base64 images to files

The before/after photos are currently embedded as base64 in `index.html`. The `projects.html` page needs them too — duplicating 850KB of base64 is not acceptable. Extract them first.

**Files:**
- Modify: `index.html`
- Create: `public/images/kitchen-before.jpg`
- Create: `public/images/kitchen-after.jpg`

**Step 1: Extract the base64 strings**

```bash
# Extract the after image (ba-after src)
grep -o 'data:image/jpeg;base64,[^"]*' index.html | head -1 | sed 's/data:image\/jpeg;base64,//' > /tmp/after_b64.txt

# Extract the before image (ba-before src)
grep -o 'data:image/jpeg;base64,[^"]*' index.html | tail -1 | sed 's/data:image\/jpeg;base64,//' > /tmp/before_b64.txt
```

**Step 2: Create the image files**

```bash
mkdir -p public/images
python3 -c "import base64; open('public/images/kitchen-after.jpg','wb').write(base64.b64decode(open('/tmp/after_b64.txt').read().strip()))"
python3 -c "import base64; open('public/images/kitchen-before.jpg','wb').write(base64.b64decode(open('/tmp/before_b64.txt').read().strip()))"
ls -lh public/images/
```

Expected: two files, each 200–500KB.

**Step 3: Update `index.html` to use file paths**

In `index.html`, find the `<img class="ba-img ba-after"` and `<img class="ba-img ba-before"` tags and replace the `src` attributes:

```html
<!-- BEFORE (find and replace) -->
<img class="ba-img ba-after" src="data:image/jpeg;base64,/9j/..." ...>
<img class="ba-img ba-before" src="data:image/jpeg;base64,/9j/..." ...>

<!-- AFTER -->
<img class="ba-img ba-after" src="/public/images/kitchen-after.jpg" alt="Kitchen remodel after — modern white shaker cabinets, granite countertops, Monticello FL">
<img class="ba-img ba-before" src="/public/images/kitchen-before.jpg" alt="Kitchen before remodel — original 1970s cabinets and wallpaper, Monticello FL">
```

Also find the hero `<img>` (which uses the after photo) and update it the same way.

**Step 4: Verify visually**

Open `index.html` in a browser. The hero photo and before/after slider should look identical to before.

**Step 5: Commit**

```bash
git add public/images/kitchen-after.jpg public/images/kitchen-before.jpg index.html
git commit -m "Extract base64 images to /public/images/"
```

---

## Task 2: Meta/OG tags + favicon

**Files:**
- Modify: `index.html` — inside `<head>`, after the existing `<meta charset>` and `<meta viewport>` tags

**Step 1: Generate favicon**

Run this Python script to create a 32×32 red square PNG with a white "V":

```bash
python3 << 'EOF'
import base64, struct, zlib

def create_png(width, height, pixels):
    def chunk(name, data):
        c = zlib.crc32(name + data) & 0xffffffff
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', c)
    raw = b''.join(b'\x00' + bytes(row) for row in pixels)
    compressed = zlib.compress(raw, 9)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', compressed)
    png += chunk(b'IEND', b'')
    return png

W, H = 32, 32
RED = [192, 57, 43]
WHITE = [255, 255, 255]

pixels = [[RED * W][0] for _ in range(H)]
# Draw a simple "V" shape in white pixels
v_pixels = [
    (8,8),(9,9),(10,10),(11,11),(12,12),(13,13),(14,14),(15,15),
    (23,8),(22,9),(21,10),(20,11),(19,12),(18,13),(17,14),(16,15),(15,16)
]
rows = [[RED[:] for _ in range(W)] for _ in range(H)]
for (x, y) in v_pixels:
    if 0 <= x < W and 0 <= y < H:
        rows[y][x] = WHITE[:]

flat_pixels = [[val for px in row for val in px] for row in rows]
png_data = create_png(W, H, flat_pixels)
b64 = base64.b64encode(png_data).decode()
print(f'data:image/png;base64,{b64}')
EOF
```

Copy the output — it's the favicon data URL.

**Step 2: Add to `index.html` head**

Find the `<title>` tag (near the top of `<head>`) and insert after it:

```html
<meta name="description" content="Veritas Builders Group — Licensed Florida contractor serving Jefferson County and North Florida. Kitchen remodels, custom builds, decks, solar. Call 850-347-1467.">
<meta property="og:title" content="Veritas Builders Group — Jefferson County FL Contractor">
<meta property="og:description" content="Licensed, insured, locally owned. Kitchen remodels, custom builds, decks, solar installation. Serving Monticello, Tallahassee, and North Florida. Free estimates.">
<meta property="og:image" content="https://veritasbuildersgroup.com/public/images/kitchen-after.jpg">
<meta property="og:url" content="https://veritasbuildersgroup.com">
<meta property="og:type" content="website">
<link rel="icon" type="image/png" href="[PASTE_DATA_URL_HERE]">
```

**Step 3: Verify**

Open `index.html` in browser. Check the browser tab — it should show the small red favicon icon.

**Step 4: Commit**

```bash
git add index.html
git commit -m "Add meta/OG tags and favicon"
```

---

## Task 3: Add "Projects" to nav

**Files:**
- Modify: `index.html` line ~775 (the `<ul class="nav-links">` block)

**Step 1: Add the link**

Find:
```html
    <ul class="nav-links">
      <li><a href="#services">Services</a></li>
      <li><a href="#work">Our Work</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
```

Replace with:
```html
    <ul class="nav-links">
      <li><a href="#services">Services</a></li>
      <li><a href="#work">Our Work</a></li>
      <li><a href="projects.html">Projects</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
```

**Step 2: Verify**

Open `index.html`. Nav should show "Projects" between "Our Work" and "About". Clicking it won't work yet (page doesn't exist) — that's fine.

**Step 3: Commit**

```bash
git add index.html
git commit -m "Add Projects link to nav"
```

---

## Task 4: Testimonials section

**Files:**
- Modify: `index.html` — insert CSS in `<style>` block, insert HTML after the why-section closing tag (line ~911)

**Step 1: Add CSS**

In the `<style>` block, before the closing `</style>` tag, add:

```css
/* TESTIMONIALS */
.testimonials-section {
  background: var(--gray-900);
  padding: 6rem 4rem;
}
.testimonials-section .section-label { color: var(--red-light); }
.testimonials-section .section-title { color: var(--white); margin-bottom: 3rem; }
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}
.testimonial-card {
  border-left: 4px solid var(--red);
  padding: 2rem;
  background: rgba(255,255,255,0.04);
}
.testimonial-quote {
  font-family: 'Source Serif 4', serif;
  font-style: italic;
  font-weight: 300;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--gray-300);
  margin-bottom: 1.5rem;
}
.testimonial-attr {
  font-family: 'Oswald', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--red-light);
}
@media (max-width: 768px) {
  .testimonials-section { padding: 4rem 2rem; }
  .testimonials-grid { grid-template-columns: 1fr; }
}
```

**Step 2: Add HTML**

After the closing `</section>` of the why-section (line ~911), insert:

```html
<!-- TESTIMONIALS -->
<section class="testimonials-section">
  <p class="section-label">What Our Clients Say</p>
  <h2 class="section-title">Real Results.<br />Real Clients.</h2>
  <div class="testimonials-grid">
    <div class="testimonial-card">
      <p class="testimonial-quote">"[PASTE QUOTE 1 HERE]"</p>
      <p class="testimonial-attr">[First Name Last Initial] &mdash; [Project Type], [City]</p>
    </div>
    <div class="testimonial-card">
      <p class="testimonial-quote">"[PASTE QUOTE 2 HERE]"</p>
      <p class="testimonial-attr">[First Name Last Initial] &mdash; [Project Type], [City]</p>
    </div>
    <div class="testimonial-card">
      <p class="testimonial-quote">"[PASTE QUOTE 3 HERE]"</p>
      <p class="testimonial-attr">[First Name Last Initial] &mdash; [Project Type], [City]</p>
    </div>
  </div>
</section>
```

Fill in the bracketed placeholders with real quotes from Google/Facebook reviews.

**Step 3: Verify**

Open in browser. Three cards in a row, dark background, red left-border on each card, quotes in italic serif. On mobile, cards stack vertically.

**Step 4: Commit**

```bash
git add index.html
git commit -m "Add testimonials section"
```

---

## Task 5: Free Estimate CTA band

**Files:**
- Modify: `index.html` — CSS in `<style>`, HTML between testimonials and contact sections

**Step 1: Add CSS**

In the `<style>` block, after the testimonials CSS:

```css
/* CTA BAND */
.cta-band {
  background: var(--red);
  padding: 3.5rem 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}
.cta-band-text {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--white);
}
.cta-band-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}
.cta-band-phone {
  font-family: 'Oswald', sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--white);
  text-decoration: none;
  letter-spacing: 0.05em;
}
.cta-band-phone:hover { text-decoration: underline; }
.cta-band-btn {
  background: var(--white);
  color: var(--red);
  font-family: 'Oswald', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.85rem 2rem;
  text-decoration: none;
  white-space: nowrap;
}
.cta-band-btn:hover { background: var(--gray-100); }
@media (max-width: 768px) {
  .cta-band { flex-direction: column; text-align: center; padding: 3rem 2rem; }
  .cta-band-text { font-size: 1.5rem; }
  .cta-band-actions { flex-direction: column; gap: 1rem; }
}
```

**Step 2: Add HTML**

After the testimonials `</section>` closing tag, before the contact section:

```html
<!-- CTA BAND -->
<div class="cta-band">
  <p class="cta-band-text">Ready to Start Your Project?</p>
  <div class="cta-band-actions">
    <a href="tel:8503471467" class="cta-band-phone">850-347-1467</a>
    <a href="#contact" class="cta-band-btn">Get a Free Estimate</a>
  </div>
</div>
```

**Step 3: Verify**

Open in browser. Full-width red band with headline left, phone and button right. On mobile, stacks vertically and centers. Clicking "Get a Free Estimate" should scroll to the contact form.

**Step 4: Commit**

```bash
git add index.html
git commit -m "Add free estimate CTA band"
```

---

## Task 6: Wire contact form to Formspree

**Prerequisite:** You have a Formspree form ID (e.g. `xyzabcde`).

**Files:**
- Modify: `index.html` line ~950 (the `<form>` tag and the `handleSubmit` JS function)

**Step 1: Update the form tag**

Find:
```html
<form class="contact-form" onsubmit="handleSubmit(event)">
```

Replace with:
```html
<form class="contact-form" action="https://formspree.io/f/[YOUR_FORM_ID]" method="POST">
```

**Step 2: Remove the fake JS submit handler**

Find the `handleSubmit` function in the `<script>` block at the bottom of the file and delete it entirely. It currently shows a fake success message — Formspree handles the redirect natively.

Also remove the `onsubmit` call from the form tag (already done in step 1).

**Step 3: Add a hidden redirect field (optional)**

To redirect back to the site after submission instead of Formspree's default thank-you page, add inside the `<form>`:

```html
<input type="hidden" name="_next" value="https://veritasbuildersgroup.com/?submitted=true">
```

**Step 4: Verify**

Submit the form with a test email. Check that `admin@veritasbuildersgroup.com` receives the submission. Check the Formspree dashboard at formspree.io to see the entry.

**Step 5: Commit**

```bash
git add index.html
git commit -m "Wire contact form to Formspree"
```

---

## Task 7: Build `projects.html`

**Files:**
- Create: `projects.html`

**Step 1: Create the file**

Create `projects.html` at the repo root with the full page. It shares the same CSS variables, Google Fonts link, and nav as `index.html`. The nav "Projects" link gets an `active` class.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Work — Veritas Builders Group</title>
  <meta name="description" content="Project gallery — Veritas Builders Group. Kitchen remodels, decks, custom builds across Jefferson County and North Florida.">
  <meta property="og:title" content="Our Work — Veritas Builders Group">
  <meta property="og:description" content="Browse completed projects — kitchen remodels, decks, custom builds across Jefferson County and North Florida.">
  <meta property="og:image" content="https://veritasbuildersgroup.com/public/images/kitchen-after.jpg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;1,300&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --red: #C0392B;
      --red-dark: #96281B;
      --red-light: #E74C3C;
      --gray-900: #1a1a1a;
      --gray-800: #2d2d2d;
      --gray-600: #555555;
      --gray-300: #cccccc;
      --gray-100: #f5f5f5;
      --gold: #B8A97A;
      --white: #ffffff;
    }
    body { background: var(--gray-900); color: var(--white); font-family: 'Source Serif 4', serif; }

    /* NAV — identical to index.html */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 4rem; height: 64px;
      background: rgba(26,26,26,0.97); border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .nav-logo {
      font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 1.1rem;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); text-decoration: none;
    }
    .nav-logo span { display: block; font-size: 0.6rem; font-weight: 400; letter-spacing: 0.15em; color: var(--gold); margin-top: 1px; }
    .nav-links { list-style: none; display: flex; gap: 2.5rem; }
    .nav-links a { font-family: 'Oswald', sans-serif; font-size: 0.8rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray-300); text-decoration: none; }
    .nav-links a:hover, .nav-links a.active { color: var(--white); }
    .nav-cta {
      font-family: 'Oswald', sans-serif; font-size: 0.8rem; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      background: var(--red); color: var(--white); padding: 0.6rem 1.5rem; text-decoration: none;
    }
    .nav-cta:hover { background: var(--red-dark); }

    /* PAGE HEADER */
    .page-header {
      padding: 10rem 4rem 5rem;
      border-bottom: 1px solid rgba(255,255,255,0.08);
    }
    .section-label {
      font-family: 'Oswald', sans-serif; font-size: 0.75rem; font-weight: 500;
      letter-spacing: 0.2em; text-transform: uppercase; color: var(--red-light); margin-bottom: 1rem;
    }
    .page-title {
      font-family: 'Oswald', sans-serif; font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; line-height: 1.05;
      color: var(--white);
    }
    .page-intro {
      font-family: 'Source Serif 4', serif; font-weight: 300; font-size: 1.1rem;
      line-height: 1.7; color: var(--gray-300); max-width: 520px; margin-top: 1.5rem;
    }

    /* PROJECTS GRID */
    .projects-section { padding: 5rem 4rem; }
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      max-width: 1200px;
    }
    .project-card {
      position: relative; cursor: pointer; overflow: hidden;
      aspect-ratio: 4/3; background: var(--gray-800);
    }
    .project-card img {
      width: 100%; height: 100%; object-fit: cover;
      display: block; transition: transform 0.4s ease;
    }
    .project-card:hover img { transform: scale(1.04); }
    .project-card-overlay {
      position: absolute; inset: 0;
      background: rgba(192,57,43,0); transition: background 0.3s ease;
      display: flex; flex-direction: column; justify-content: flex-end; padding: 1.5rem;
    }
    .project-card:hover .project-card-overlay { background: rgba(26,26,26,0.75); }
    .project-type {
      font-family: 'Oswald', sans-serif; font-size: 1rem; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase; color: var(--white);
      opacity: 0; transform: translateY(8px); transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .project-location {
      font-family: 'Oswald', sans-serif; font-size: 0.75rem; font-weight: 400;
      letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray-300);
      opacity: 0; transform: translateY(8px); transition: opacity 0.3s 0.05s ease, transform 0.3s 0.05s ease;
      margin-top: 0.25rem;
    }
    .project-card:hover .project-type,
    .project-card:hover .project-location { opacity: 1; transform: translateY(0); }

    /* LIGHTBOX */
    .lightbox {
      display: none; position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,0.92); align-items: center; justify-content: center;
    }
    .lightbox.open { display: flex; }
    .lightbox-inner {
      position: relative; width: 90vw; max-width: 1000px; max-height: 85vh;
    }
    .lightbox-close {
      position: absolute; top: -2.5rem; right: 0;
      font-family: 'Oswald', sans-serif; font-size: 0.8rem; letter-spacing: 0.15em;
      text-transform: uppercase; color: var(--gray-300); background: none; border: none;
      cursor: pointer; padding: 0.5rem;
    }
    .lightbox-close:hover { color: var(--white); }

    /* BEFORE/AFTER SLIDER (in lightbox) */
    .lb-slider {
      position: relative; width: 100%; height: 60vh; overflow: hidden; cursor: ew-resize; user-select: none;
    }
    .lb-slider img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
    .lb-before { clip-path: inset(0 50% 0 0); }
    .lb-divider {
      position: absolute; top: 0; bottom: 0; left: 50%; width: 3px;
      background: var(--white); transform: translateX(-50%); pointer-events: none;
    }
    .lb-handle {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 44px; height: 44px; border-radius: 50%;
      background: var(--white); display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4); pointer-events: none;
    }
    .lb-handle::before {
      content: '◀ ▶'; font-size: 0.6rem; letter-spacing: -2px; color: var(--gray-900);
    }
    .lb-label-before, .lb-label-after {
      position: absolute; bottom: 1rem;
      font-family: 'Oswald', sans-serif; font-size: 0.7rem; font-weight: 600;
      letter-spacing: 0.15em; text-transform: uppercase;
      background: rgba(0,0,0,0.6); color: var(--white); padding: 0.3rem 0.75rem;
    }
    .lb-label-before { left: 1rem; }
    .lb-label-after { right: 1rem; }
    .lightbox-meta {
      padding: 1.25rem 0 0;
      display: flex; justify-content: space-between; align-items: baseline;
    }
    .lightbox-type {
      font-family: 'Oswald', sans-serif; font-size: 1.1rem; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--white);
    }
    .lightbox-location {
      font-family: 'Oswald', sans-serif; font-size: 0.8rem; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--gray-300);
    }

    /* FOOTER */
    footer {
      border-top: 1px solid rgba(255,255,255,0.08);
      padding: 2rem 4rem;
      display: flex; justify-content: space-between; align-items: center;
    }
    .footer-logo {
      font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 0.95rem;
      letter-spacing: 0.08em; text-transform: uppercase; color: var(--white);
    }
    .footer-copy {
      font-family: 'Source Serif 4', serif; font-size: 0.8rem;
      color: var(--gray-600);
    }

    @media (max-width: 900px) {
      .projects-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      nav { padding: 0 1.5rem; }
      .nav-links { display: none; }
      .page-header, .projects-section { padding-left: 1.5rem; padding-right: 1.5rem; }
      .projects-grid { grid-template-columns: 1fr; }
      footer { padding: 2rem 1.5rem; flex-direction: column; gap: 0.5rem; text-align: center; }
    }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav>
    <a href="index.html" class="nav-logo">
      Veritas Builders Group
      <span>Licensed · Monticello, FL</span>
    </a>
    <ul class="nav-links">
      <li><a href="index.html#services">Services</a></li>
      <li><a href="index.html#work">Our Work</a></li>
      <li><a href="projects.html" class="active">Projects</a></li>
      <li><a href="index.html#about">About</a></li>
      <li><a href="index.html#contact">Contact</a></li>
    </ul>
    <a href="tel:8503471467" class="nav-cta">850-347-1467</a>
  </nav>

  <!-- PAGE HEADER -->
  <div class="page-header">
    <p class="section-label">Our Work</p>
    <h1 class="page-title">Project Gallery</h1>
    <p class="page-intro">Every job we take on gets the same attention — whether it's a kitchen remodel or a ground-up custom build. Browse completed projects below.</p>
  </div>

  <!-- PROJECTS GRID -->
  <section class="projects-section">
    <div class="projects-grid">

      <!-- PROJECT CARD: Kitchen Remodel -->
      <!-- To add more projects: duplicate this card block, update src, data-type, data-location, data-before, data-after -->
      <div class="project-card"
           data-type="Kitchen Remodel"
           data-location="Monticello, FL"
           data-after="/public/images/kitchen-after.jpg"
           data-before="/public/images/kitchen-before.jpg"
           onclick="openLightbox(this)">
        <img src="/public/images/kitchen-after.jpg" alt="Kitchen remodel — modern white shaker cabinets, Monticello FL">
        <div class="project-card-overlay">
          <p class="project-type">Kitchen Remodel</p>
          <p class="project-location">Monticello, FL</p>
        </div>
      </div>

      <!-- ADD MORE PROJECT CARDS HERE -->

    </div>
  </section>

  <!-- LIGHTBOX -->
  <div class="lightbox" id="lightbox" onclick="closeLightboxOnBg(event)">
    <div class="lightbox-inner">
      <button class="lightbox-close" onclick="closeLightbox()">✕ Close</button>
      <div class="lb-slider" id="lbSlider">
        <img class="lb-after" id="lbAfter" src="" alt="">
        <img class="lb-before" id="lbBefore" src="" alt="">
        <div class="lb-divider" id="lbDivider"></div>
        <div class="lb-handle" id="lbHandle"></div>
        <span class="lb-label-before">Before</span>
        <span class="lb-label-after">After</span>
      </div>
      <div class="lightbox-meta">
        <span class="lightbox-type" id="lbType"></span>
        <span class="lightbox-location" id="lbLocation"></span>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <footer>
    <p class="footer-logo">Veritas Builders Group</p>
    <p class="footer-copy">© 2026 Veritas Builders Group LLC · CBC1266699 · Monticello, FL</p>
  </footer>

  <script>
    // Lightbox open/close
    function openLightbox(card) {
      const lb = document.getElementById('lightbox');
      document.getElementById('lbAfter').src = card.dataset.after;
      document.getElementById('lbBefore').src = card.dataset.before;
      document.getElementById('lbType').textContent = card.dataset.type;
      document.getElementById('lbLocation').textContent = card.dataset.location;
      lb.classList.add('open');
      resetSlider();
      initSlider();
    }
    function closeLightbox() {
      document.getElementById('lightbox').classList.remove('open');
    }
    function closeLightboxOnBg(e) {
      if (e.target === document.getElementById('lightbox')) closeLightbox();
    }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

    // Before/after slider (same logic as homepage)
    let dragging = false;
    function resetSlider() { setSliderPos(50); }
    function setSliderPos(pct) {
      pct = Math.max(5, Math.min(95, pct));
      document.getElementById('lbBefore').style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      document.getElementById('lbDivider').style.left = pct + '%';
      document.getElementById('lbHandle').style.left = pct + '%';
    }
    function getSliderPct(e, slider) {
      const rect = slider.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      return ((clientX - rect.left) / rect.width) * 100;
    }
    function initSlider() {
      const slider = document.getElementById('lbSlider');
      slider.onmousedown = e => { dragging = true; setSliderPos(getSliderPct(e, slider)); };
      slider.ontouchstart = e => { dragging = true; setSliderPos(getSliderPct(e, slider)); };
      document.onmousemove = e => { if (dragging) setSliderPos(getSliderPct(e, slider)); };
      document.ontouchmove = e => { if (dragging) setSliderPos(getSliderPct(e, slider)); };
      document.onmouseup = () => { dragging = false; };
      document.ontouchend = () => { dragging = false; };
    }
  </script>
</body>
</html>
```

**Step 2: Verify**

Open `projects.html` in browser:
- Nav shows "Projects" as active (slightly brighter)
- Page header renders correctly
- Kitchen card shows with hover overlay animation
- Clicking the card opens the lightbox with before/after slider
- Slider drag works
- ESC key closes lightbox
- Clicking outside the inner content closes lightbox
- Mobile: cards stack to 1 column, nav phone-only

**Step 3: Commit**

```bash
git add projects.html
git commit -m "Add projects gallery page with lightbox slider"
```

---

## Task 8: Final push and verify on Vercel

**Step 1: Push everything**

```bash
git push origin main
```

**Step 2: Watch the deploy**

The push triggers an automatic Vercel deployment. Visit the Vercel dashboard or run:

```bash
vercel ls
```

**Step 3: Verify on the live URL**

Open `https://veritasbuildersgroup-com.vercel.app`:
- Meta description visible when sharing the URL (test with opengraph.xyz or similar)
- Favicon shows in browser tab
- Nav includes "Projects" link
- Testimonials section renders between "Why Veritas" and "Contact"
- Red CTA band renders between testimonials and contact form
- Contact form submits to Formspree (check dashboard)
- `https://veritasbuildersgroup-com.vercel.app/projects.html` loads correctly
- Before/after images load from `/public/images/` (not base64)

---

## Adding Future Projects

When the client sends more photos:

1. Save images to `public/images/[project-slug]-after.jpg` and `public/images/[project-slug]-before.jpg`
2. In `projects.html`, duplicate the project card block and update:
   - `data-type` — e.g. "Deck Build"
   - `data-location` — e.g. "Tallahassee, FL"
   - `data-after` and `data-before` — new image paths
   - `<img src>` — same as `data-after`
   - `<img alt>` — describe the project
   - `.project-type` and `.project-location` text
3. Commit and push — auto-deploys
