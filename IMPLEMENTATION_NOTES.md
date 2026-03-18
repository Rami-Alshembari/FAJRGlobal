# FAJR Global Gaza — Platform Implementation Notes

## Overview

This document describes the enhanced analytics and reporting platform for FAJR Global Gaza, covering four interconnected dashboards unified under a shared design system.

---

## Architecture

### File Structure

```
FAJR Global Gaza/
├── shared-brand.css          ← Global design system (tokens, components, brandbar)
├── shared-utils.js           ← Shared JS utilities (formatters, animations, chart defaults)
│
├── FAJR_Global_Gaza_Master_Dashboard/
│   └── index.html            ← Landing portal / launcher
│
├── FAJR Gaza Project General/
│   ├── index.html            ← General Projects dashboard
│   ├── styles.css            ← Dashboard-specific styles (extends shared-brand.css)
│   ├── app.js                ← Dashboard logic (filtering, charts, table, animations)
│   └── data/
│       ├── portfolio-data.js ← Live dataset (primary)
│       └── portfolio-data.json
│
├── Public aid/
│   └── dashboard.html        ← Public Aid Hospital dashboard (self-contained)
│
└── Vouchers/
    ├── fajr-dashboard-en.html  ← English voucher dashboard
    └── fajr-dashboard.html     ← Arabic RTL voucher dashboard
```

---

## Shared Assets

### `shared-brand.css`

The global design system. Linked in every dashboard via:
```html
<link rel="stylesheet" href="../shared-brand.css" />
```

**Provides:**
- CSS custom properties (tokens): color palette, shadows, spacing, typography scale, border-radius scale, chart palette
- `.fajr-brandbar` — sticky top navigation bar with logo and inter-dashboard links
- Shared components: `.fajr-card`, `.fajr-eyebrow`, `.fajr-tag`, `.fajr-btn`, `.fajr-field`, `.fajr-insight-card`, `.fajr-progress`, `.fajr-loader`, `.fajr-empty`
- Animation keyframes: `fajr-rise`, `fajr-shimmer`
- Section reveal classes: `.fajr-reveal` → `.fajr-reveal.is-visible` (IntersectionObserver)
- Accessibility: `prefers-reduced-motion` overrides, `:focus-visible` styles, print styles

**Key CSS Variables:**
```css
--fajr-navy:  #173347   /* Primary brand navy */
--fajr-teal:  #157a75   /* Brand teal */
--fajr-gold:  #b88746   /* Brand gold */
--fajr-coral: #b66a57   /* Brand coral */
--fajr-sand:  #f6f4ef   /* Background sand */
--fajr-muted: #5c6f7b   /* Secondary text */
```

### `shared-utils.js`

Shared JavaScript utility library. Attach before the dashboard's `<script>` block:
```html
<script src="../shared-utils.js"></script>
```

**Provides** (all under `window.FAJR`):

| Export | Description |
|--------|-------------|
| `FAJR.format.number(n)` | Locale-formatted integer |
| `FAJR.format.percent(n)` | Percentage with 1 decimal |
| `FAJR.format.currency(n, symbol)` | Currency string |
| `FAJR.format.compact(n)` | 1.2K / 3.4M compact notation |
| `FAJR.countUp(el, target, fn, dur)` | Animated count-up (cubic ease) |
| `FAJR.runAllCountUps()` | Auto-animates `[data-countup]` elements |
| `FAJR.initReveal(selector)` | IntersectionObserver section reveal |
| `FAJR.PALETTE` | Shared color constants object |
| `FAJR.applyChartDefaults()` | Sets Chart.js global defaults (fonts, tooltips, legend) |
| `FAJR.barOptions(axis)` | Bar chart options factory |
| `FAJR.donutOptions(pos)` | Donut/pie chart options factory |
| `FAJR.showLoader(id)` / `FAJR.hideLoader(id)` | Loader visibility helpers |
| `FAJR.prefersReduced` | Boolean for reduced motion preference |

---

## Dashboard Details

### 1. Master Landing Page (`FAJR_Global_Gaza_Master_Dashboard/index.html`)

**Purpose:** Entry point and program overview portal.

**Key Sections:**
- Sticky brandbar navigation
- Hero section with platform stats (3 dashboards, 5,137+ beneficiaries)
- KPI strip (1,097 surgeries, 3,934 clinic visits, 95,775+ voucher units, 13 departments)
- 3-column dashboard card grid with colored accent bars, metrics, and CTA links
- Platform methodology note
- Footer with program tags

**Data:** All figures are static/hardcoded summaries from the operational dashboards.

---

### 2. General Projects Dashboard (`FAJR Gaza Project General/`)

**Purpose:** Project portfolio tracker — locations, sectors, beneficiaries, stories.

**Key Features:**
- SVG-based custom charts (no Chart.js dependency)
- Multi-filter system: sector, status, location, timeline
- Active filter chip bar with individual × removal buttons
- Animated progress bars in location beneficiary panel
- Sticky controls panel + sticky table header
- IntersectionObserver section reveal for `.section, .panel, .kpi-card`
- Table with `aria-sort` attributes and sector tag pills
- Empty state row when no records match filters

**Data Source:** `data/portfolio-data.js` (primary); `data/portfolio-data.json` (reference)

---

### 3. Public Aid Hospital Dashboard (`Public aid/dashboard.html`)

**Purpose:** Hospital operations reporting — surgeries, clinic visits, ward admissions across 13 departments.

**Key Features:**
- SheetJS XLSX parsing from live Excel workbook (`Hospital Updated Report - FAJR Global_2.xlsx`)
- Embedded fallback dataset (`FALLBACK_REPORT_DATA`) when file unavailable
- 5 Chart.js charts: weekly stacked bar, service mix donut, total trend line, and per-metric bar charts
- **Operational Insights panel** — auto-rendered grid showing top department per metric with animated mini progress bars
- Rank badges in department summary table (#1, #2, #3 with gold/navy/coral colors)
- IntersectionObserver section reveal for all chart cards, stat cards, highlight cards
- `BRAND` color constants aligned with shared design system

**Data Source:** XLSX file (fetched) or embedded fallback

---

### 4. Voucher Dashboards

#### English (`Vouchers/fajr-dashboard-en.html`)
#### Arabic RTL (`Vouchers/fajr-dashboard.html`)

**Purpose:** Purchase demand analytics for the Ramadan voucher program.

**Key Features:**
- Interactive filtering: search, unit filter, top-N selector
- 3 charts: horizontal bar (top items), distribution bar (pareto), share donut
- Top 5 list with animated progress bars
- Summary metric cards with count-up animation
- Quick insights text panel
- Ranked detail table with sticky header and alternating row shading
- AR version: full RTL layout, IBM Plex Sans Arabic font, existing brandbar
- EN version: brandbar added, Manrope + Fraunces fonts, shared-brand.css linked

**Data Source:** Embedded JSON payload (20 items) — update `payload.data` to refresh

---

## Color Palette Reference

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#173347` | Primary headings, KPI numbers, table headers |
| Teal | `#157a75` | Accent, interactive elements, surgery charts |
| Gold | `#b88746` | Highlights, 3rd rank, voucher program |
| Coral | `#b66a57` | Admissions, 2nd/3rd highlights |
| Sand | `#f6f4ef` | Page backgrounds |
| Muted | `#5c6f7b` | Secondary text, labels |

---

## Typography

| Font | Weight | Usage |
|------|--------|-------|
| Manrope | 300–800 | Body text, labels, UI elements |
| Fraunces (opsz) | 500, 700 | Display headings, KPI numbers |
| IBM Plex Sans Arabic | 400, 600, 700 | Arabic RTL dashboard text |

---

## How to Update Data

### General Projects
Edit `FAJR Gaza Project General/data/portfolio-data.js` — the `PORTFOLIO_DATA` array.

### Public Aid Hospital
Replace `Public aid/Hospital Updated Report - FAJR Global_2.xlsx` with the updated Excel file. The dashboard parses `First Month`, `Updated Report`, and `Second Month` sheets automatically. To update the embedded fallback, edit `FALLBACK_REPORT_DATA` in `dashboard.html`.

### Vouchers
Edit the `payload.data` array in each voucher HTML file. The `summary` object is auto-computed from the data by the dashboard JS.

---

## Cross-Dashboard Navigation

All dashboards link to each other via the `.fajr-brandbar` navigation:

| Brandbar Link | Points To |
|---------------|-----------|
| Logo / "FAJR Global Gaza" | `../FAJR_Global_Gaza_Master_Dashboard/index.html` |
| General Projects | `../FAJR Gaza Project General/index.html` |
| Public Aid Hospital | `../Public aid/dashboard.html` |
| Vouchers (EN pages) | `../Vouchers/fajr-dashboard-en.html` |
| Vouchers (AR page) | `../Vouchers/fajr-dashboard.html` (self) |

---

## Extending the Platform

### Adding a new dashboard
1. Create your HTML file with `<link rel="stylesheet" href="../shared-brand.css" />`
2. Add `<script src="../shared-utils.js"></script>` before your dashboard script
3. Add the `.fajr-brandbar` block (copy from any existing dashboard and update the active link)
4. Add a link to the new dashboard in all other brandbar navs
5. Add a new card in the Master Dashboard `index.html`

### Adding a new shared component
Add the component CSS to `shared-brand.css` in its own section with a comment header. Test in all 4 dashboards.

---

*Last updated: June 2025*

