# Nexus — Product Website

A modern, fully responsive product/company website built with pure HTML, CSS, and JavaScript. No frameworks or dependencies required (except Google Fonts via CDN).

## Project Structure

```
nexus-website/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styles (variables, layout, animations)
├── js/
│   └── main.js         # Interactivity (nav, scroll reveal, form)
└── README.md
```

## Sections

| Section       | Description                                              |
|---------------|----------------------------------------------------------|
| Navigation    | Sticky nav with blur backdrop + mobile hamburger menu    |
| Hero          | Full-height banner with animated orbs, stats, CTA buttons|
| Features      | 6-card grid with icon hover animations                   |
| Testimonials  | 3 cards; centre card elevated/highlighted                |
| Pricing       | 3 plans; Pro plan visually highlighted with badge        |
| Contact       | Two-column layout with form + validation                 |
| Footer        | Dark footer with links and social icons                  |

## Features

- **Responsive** — works on mobile, tablet, and desktop
- **Hover animations** — `transform`, `box-shadow`, `transition` on all cards and buttons
- **Scroll reveal** — elements fade in with stagger as you scroll
- **Sticky nav** — adds shadow on scroll; active link tracking
- **Mobile menu** — animated hamburger that opens a slide-down menu
- **Form validation** — client-side validation with visual feedback
- **CSS custom properties** — easy to re-theme by editing `:root` variables
- **Google Fonts** — Syne (headings) + DM Sans (body)

## How to Run

Simply open `index.html` in any modern browser — no build step or server required.

```bash
# macOS / Linux
open index.html

# Windows
start index.html

# Or use VS Code Live Server extension
```

## Customisation

- **Colors** — edit the CSS variables in the `:root` block at the top of `css/style.css`
- **Content** — update text directly in `index.html`
- **Fonts** — swap the Google Fonts `<link>` in `index.html` and update `--font-head` / `--font-body` variables

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
