# Nexus Glass — Glassmorphism Redesign

A full dark glassmorphism redesign of the Nexus product website.

## Project Structure

```
nexus-glass/
├── index.html        # All 6 sections
├── css/
│   └── style.css     # Glassmorphism design system
├── js/
│   └── main.js       # Nav, scroll reveal, form, cursor glow
└── README.md
```

## Design System

- **Theme**: Deep dark space (#050816) with frosted glass cards
- **Accent**: Cyan (#00e5ff) + Pink (#f000b8) + Green (#00ffb2)
- **Fonts**: Outfit (headings/body) + JetBrains Mono (labels/code)
- **Glass**: `backdrop-filter: blur(20px)` + rgba borders + glow shadows

## Sections

| Section       | Glassmorphism Feature                                    |
|---------------|----------------------------------------------------------|
| Nav           | Blur backdrop, glowing underline on hover                |
| Hero          | Animated orbs, glass stat cards, code snippet widget     |
| Features      | Glass cards with icon spin + cyan glow on hover          |
| Testimonials  | Frosted cards; centre card has pink glow highlight       |
| Pricing       | Glass panels; Pro plan has cyan border + neon glow       |
| Contact       | Glass form with cyan focus glow on inputs                |
| Footer        | Semi-transparent, mono-style labels                      |

## Special Effects

- **Cursor glow** — subtle radial light follows mouse (desktop)
- **Floating orbs** — animated blur blobs in background
- **Noise texture** — film-grain overlay for depth
- **Neon glows** — box-shadow on hover states and CTA buttons
- **Scroll reveal** — staggered fade-up on scroll
- **Animated badge dot** — pulsing live indicator in hero

## How to Run

Open `index.html` in any modern browser. No build step needed.

```bash
open index.html   # macOS
start index.html  # Windows
```

## Browser Support

Requires `backdrop-filter` support: Chrome 76+, Safari 14+, Edge 79+  
Firefox 103+ (with `layout.css.backdrop-filter.enabled` flag or enabled by default in newer versions)
