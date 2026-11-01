description: >
  HIGHEST PRIORITY — applies to ALL HTML generation. Apply Institutional
  Minimalism × Apple HIG principles with a light-first surface strategy and
  insight-only emphasis discipline. Light backgrounds throughout; brand palette
  applied to text and structural accents, not fills. UI emphasis (color, weight,
  size variation) is reserved exclusively for actionable insights, anomaly alerts,
  and business recommendations — never for positive/negative data direction, never
  for decorative differentiation. Use whenever building any HTML interface —
  dashboards, reports, data tables, internal tools, landing pages, or any web UI.
  Trigger on: any request for HTML/CSS styling, web dashboard, data table design,
  HTML report, web component polish, or any task where HTML output should carry
  consistent visual identity. Also trigger whenever building any HTML artifact
  from scratch — this skill overrides all other HTML styling guidance.
---
 
# HTML Visual Style Skill
 
## Brand Foundation
 
```
Institutional Minimalism × Apple Spatial Design — Web Edition
Light-First. Insight-Only Emphasis. Analysis Before Decoration.
```
 
**Two philosophies, one surface:**
 
- **From excel-visual-style (MUJI):** Remove everything that doesn't serve
  decision-making. Color budget of 4. Table first. Signal-to-noise discipline.
- **From Apple HIG:** Depth through layered materials, not decoration.
  Generous spatial breathing. Spring motion. Light surfaces with shadow-based
  elevation. Tight negative tracking on display type.
The palette and fonts are unchanged from excel-visual-style. The surface
strategy shifts to light-first: brand colors apply to text, borders, and
structural accents — not dark fills. Emphasis is earned by business importance,
not visual variety.
 
**This is a base layer.** All additions are additive, never substitutive.
 
---
 
## Core Design Principle
 
> "Does this element help the user make a decision, or does it compete for
> attention?"
 
Apple adds one corollary:
 
> "Does the user know where they are in space — what is above, what is below,
> what is interactive?"
 
The product philosophy adds a third:
 
> "Does this UI difference signal a required business action — or is it
> decoration? If no action is needed, no emphasis is warranted."
 
Depth answers the spatial question without introducing visual noise. Emphasis
answers the business question — and earns the right to appear only when the
answer is yes.
 
---
 
## CSS Design Tokens (Single Source of Truth)
 
Always define as CSS custom properties at `:root`. Never hardcode values.
 
```css
:root {
  /* ── Core Palette (unchanged from excel-visual-style) ── */
  --color-primary:    #051C2C;
  --color-accent:     #2251FF;
  --color-bg:         #F5F5F2;
  --color-muted:      #888888;
  --color-body-text:  #1A1A2E;
 
  /* ── Semantic (anomaly / action-required states only) ───── */
  /* RESTRICTION: never use for positive/negative data direction */
  /* Use ONLY for: anomaly rows, at-risk status, action-required alerts */
  --color-positive:   #00C853;   /* met/exceeded target threshold — rare */
  --color-negative:   #D32F2F;   /* anomaly requiring action — rare     */
  /* BANNED: #F57C00 — do not introduce orange into any HTML output */
 
  /* ── Surface ──────────────────────────────────────────── */
  --color-surface:    #FFFFFF;
  --color-input-bg:   #FFFDE7;
  --color-border:     #E8E8E6;
 
  /* ── Light Navigation Surface ────────────────────────── */
  /* Nav is white, brand text, accent active underline      */
  --nav-bg:           #FFFFFF;
  --nav-border:       #E8E8E6;
  --nav-text:         #051C2C;
  --nav-text-inactive: rgba(5, 28, 44, 0.45);
 
  /* ── Light Table Header ───────────────────────────────── */
  --table-header-bg:  rgba(5, 28, 44, 0.04);
  --table-header-sep: rgba(5, 28, 44, 0.12);
 
  /* ── Insight & Anomaly Surfaces ──────────────────────── */
  /* insight-bg: recommendation / so-what blocks only       */
  /* anomaly-bg: data outside threshold requiring action    */
  --insight-bg:       rgba(34, 81, 255, 0.04);
  --anomaly-bg:       rgba(211, 47, 47, 0.04);
 
  /* ── Typography (unchanged from excel-visual-style) ───── */
  --font-heading:     'EB Garamond', 'Garamond', Georgia, serif;
  --font-body:        'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
 
  /* ── Type Scale ───────────────────────────────────────── */
  --text-page-title:  28px;      /* +4px from v1 — Apple display sizing */
  --text-section:     18px;
  --text-kpi-value:   36px;      /* +4px from v1 */
  --text-table-head:  13px;
  --text-body:        13px;
  --text-label:       11px;
 
  /* ── Type Tracking (Apple negative tracking on display) ── */
  --tracking-display: -0.03em;   /* page title, KPI values */
  --tracking-heading: -0.02em;   /* section titles */
  --tracking-label:    0.05em;   /* uppercase labels */
 
  /* ── Spacing — 8pt grid ───────────────────────────────── */
  --space-xs:   4px;
  --space-sm:   8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;
 
  /* ── Radius System (Apple tiered) ─────────────────────── */
  --radius-sm:   6px;    /* inputs, inline badges */
  --radius-md:  10px;    /* cards, table container */
  --radius-lg:  14px;    /* KPI cards, chart cards */
  --radius-pill: 100px;  /* status badges, tags */
 
  /* ── Shadow System (Apple layered) ────────────────────── */
  /* sm: resting card — barely visible */
  --shadow-sm:
    0 1px 2px rgba(5, 28, 44, 0.04),
    0 2px 8px rgba(5, 28, 44, 0.06);
  /* md: elevated card / table container */
  --shadow-md:
    0 2px 4px rgba(5, 28, 44, 0.04),
    0 8px 24px rgba(5, 28, 44, 0.08),
    0 1px 0px rgba(255,255,255,0.6) inset;  /* inner top edge highlight */
  /* lg: modal / dropdown — highest elevation */
  --shadow-lg:
    0 4px 8px  rgba(5, 28, 44, 0.06),
    0 16px 48px rgba(5, 28, 44, 0.14),
    0 1px 0px rgba(255,255,255,0.5) inset;
  /* nav: light nav — just a shadow below, no directional cast */
  --shadow-nav:
    0 1px 3px rgba(5, 28, 44, 0.06),
    0 1px 0px rgba(5, 28, 44, 0.08);
 
  /* ── Motion System (Apple easing) ─────────────────────── */
  --ease-standard:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1.0);  /* slight overshoot */
  --ease-decel:     cubic-bezier(0.0,  0.0,  0.2, 1.0);   /* entering elements */
  --ease-accel:     cubic-bezier(0.4,  0.0,  1.0, 1.0);   /* exiting elements */
  --dur-fast:    150ms;
  --dur-normal:  250ms;
  --dur-slow:    400ms;
 
  /* ── Nav Bar ──────────────────────────────────────────── */
  --nav-height: 56px;   /* +4px from v1 — Apple standard toolbar height */
 
  /* ── Table Row Heights ─────────────────────────────────── */
  --row-height-body:   40px;     /* +4px from v1 — Apple list row standard */
  --row-height-header: 44px;
}
```
 
**Color budget:** Four structural roles maximum — unchanged. When instinct is
to add a fifth color, solve with size, weight, radius, or motion instead.
 
---
 
## Render Quality: Font Antialiasing
 
Apply to `body` on every page. Apple renders type with subpixel antialiasing;
this replicates the crisp, slightly lighter weight on web:
 
```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```
 
---
 
## HTML Template: Base Page Shell
 
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;600;700&family=Noto+Sans+SC:wght@400;500&display=swap" rel="stylesheet">
  <style>
    /* paste :root token block here — use updated light nav tokens */
 
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
    body {
      background: var(--color-bg);
      color: var(--color-body-text);
      font-family: var(--font-body);
      font-size: var(--text-body);
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
 
    .page-wrapper {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 var(--space-xl);
    }
  </style>
</head>
<body>
  <!-- §1 Light Nav Bar -->
  <!-- §9 Page Header -->
  <!-- §2 KPI Row -->
  <!-- §10 Insight Block (if insights exist) -->
  <!-- §3 Data Table + §5 Chart -->
  <!-- §11 Anomaly rows as needed within table -->
</body>
</html>
```
 
---
 
## Component Library
 
Read `references/components.md` for full HTML+CSS. Index:
 
| Component | When to use | Section |
|---|---|---|
| Nav Bar | Every page — light white surface, primary text | §1 |
| KPI Card | 3–5 hero metrics — all trends in muted color | §2 |
| Data Table | Primary element — light header, rounded container | §3 |
| Status Badge | Pill for action-state signals (at-risk only colored) | §4 |
| Chart Container | Secondary to table | §5 |
| Section Header | Zone separation | §6 |
| Input Field | User-editable — yellow fill | §7 |
| Data Bar | Inline magnitude — animated fill | §8 |
| Page Header | START_HERE equivalent | §9 |
| Insight / Recommendation Block | So-what + action — accent left border | §10 |
| Anomaly Highlighting | Row/cell anomaly — only when action needed | §11 |
 
---
 
## Layout Rules
 
### Zone Structure
 
```
┌────────────────────────────────────────────────────┐
│  NAV BAR  (frosted #051C2C, 56px, sticky)          │
├────────────────────────────────────────────────────┤
│  [48px top padding — Apple breathing room]         │
├────────────────────────────────────────────────────┤
│  Page Title + Subtitle                             │
├────────────────────────────────────────────────────┤
│  [32px separator]                                  │
├────────────────────────────────────────────────────┤
│  KPI Cards (3–5, equal width grid)                 │
├────────────────────────────────────────────────────┤
│  [40px separator]                                  │
├──────────────────────────┬─────────────────────────┤
│  Primary Table (60–65%)  │  Supporting Chart       │
│  radius-md container     │  (35–40%, optional)     │
├──────────────────────────┴─────────────────────────┤
│  [40px separator]                                  │
├────────────────────────────────────────────────────┤
│  Secondary Table or Trend                          │
└────────────────────────────────────────────────────┘
```
 
**Rules:**
- Nav bar always first. Content never starts at `<body>` top.
- `page-wrapper` provides 40px left/right margin.
- Zone separation via `margin-bottom: var(--space-xl)` — no visible dividers.
- Apple spatial rule: zones should feel separated by air, not lines.
### Grid Layout
 
```css
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}
 
.main-zone {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}
 
.main-zone.with-chart {
  grid-template-columns: 3fr 2fr;
}
```
 
---
 
## Depth System: Three Elevations
 
Apple's spatial model: every surface has a position in Z-space. Use shadows
to communicate elevation, not decoration.
 
| Elevation | Shadow token | Used for |
|---|---|---|
| Resting | `--shadow-sm` | Default cards, secondary containers |
| Elevated | `--shadow-md` | Primary table, KPI cards, chart cards |
| Floating | `--shadow-lg` | Dropdowns, modals, popovers |
| Nav | `--shadow-nav` | Navigation bar only |
 
**Rule:** Within a single page, maximum three distinct elevation levels.
Using all four simultaneously collapses the hierarchy.
 
---
 
## Glassmorphism: Modal Only
 
`backdrop-filter` is permitted on **one surface only**:
 
1. **Modal overlay backdrop** — `rgba(5,28,44,0.4)` + `blur(8px)`
It is **prohibited** on:
- Navigation bar (light surface — no glass needed)
- Data cards
- Table containers
- KPI cards
- Any content surface
The rationale: frosted glass communicates "I float above content." The light
nav bar communicates "I am a structural chrome element at the same layer as
the page." Data cards sit on the page surface — they do not float above it.
 
---
 
## Motion Rules
 
Apply transitions consistently. Apple's principle: motion communicates
spatial relationships, not decoration.
 
```css
/* Standard interactive state change */
.interactive-element {
  transition:
    transform    var(--dur-fast)   var(--ease-standard),
    box-shadow   var(--dur-fast)   var(--ease-standard),
    background   var(--dur-fast)   var(--ease-standard);
}
 
/* Hover lift — cards only (not nav, not table rows) */
.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  transition: transform var(--dur-normal) var(--ease-spring),
              box-shadow var(--dur-normal) var(--ease-standard);
}
 
/* Press scale — buttons, interactive cells */
.btn:active {
  transform: scale(0.97);
  transition: transform var(--dur-fast) var(--ease-accel);
}
 
/* Page-enter animation for content blocks */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in {
  animation: fadeUp var(--dur-slow) var(--ease-decel) both;
}
```
 
**Motion budget:** Maximum 3 distinct animation types per page.
Hover lift, page-enter, and status-change covers all typical needs.
 
---
 
## Typography Rules
 
**Font assignment (unchanged):**
- Headings, KPI labels, nav brand → `var(--font-heading)`
- All body, table data, labels → `var(--font-body)`
- No third font.
**Apple tracking (new):**
```css
.page-title  { letter-spacing: var(--tracking-display); }
.kpi-value   { letter-spacing: var(--tracking-display); }
.section-title { letter-spacing: var(--tracking-heading); }
.kpi-label, .field-label { letter-spacing: var(--tracking-label); }
```
 
**Alignment (non-negotiable):**
- Numbers: `text-align: right`; text: `text-align: left`
- Headers mirror column content
---
 
## Border Rules: Horizontal Only
 
Unchanged from v1. Apple agrees: contained surfaces (cards with radius) need
no border. Separator lines are horizontal only.
 
```css
/* ✅ */
.table-row { border-bottom: 1px solid var(--color-border); }
/* ❌ */
.card      { border: 1px solid var(--color-border); }
```
 
Exception: a 1px inset border (via `box-shadow inset`) is permitted on elevated
cards — this is part of the layered shadow system, not a "box border."
 
---
 
## Semantic Colors: Strictly Restricted Use
 
`--color-positive` and `--color-negative` are in the token set but their
application scope is narrow and intentional:
 
**Permitted:**
- `.anomaly` and `.at-risk` status badges (action required)
- Anomaly table row/cell text for the specific breaching value
- Anomaly KPI trend text when a threshold is crossed
- Chart data series representing anomaly or threshold-exceeded states
**Not permitted:**
- KPI trend direction (positive = up, negative = down) — use `--color-muted`
- Status badges for normal/completed/pending states — use `--color-muted`
- Section headers, card fills, nav states, decorative accents
The rationale: color signals importance. Using color to say "this number went
up" trains readers to ignore the signal. Reserve it for "this number requires
your action."
 
---
 
## Color Application Map
 
| Element | Property | Value |
|---|---|---|
| Nav bar bg | `background` | `var(--nav-bg)` = `#FFFFFF` |
| Nav bar bottom separator | `border-bottom` | `1px solid var(--nav-border)` |
| Nav bar brand + active item | `color` | `var(--nav-text)` = `#051C2C` |
| Nav bar inactive items | `color` | `var(--nav-text-inactive)` |
| Active nav item underline | `border-bottom` | `3px solid var(--color-accent)` |
| Page background | `background` | `var(--color-bg)` |
| Card fill | `background` | `var(--color-surface)` |
| Table header bg | `background` | `var(--table-header-bg)` |
| Table header text | `color` | `var(--color-primary)` |
| Table header separator | `border-bottom` | `2px solid var(--table-header-sep)` |
| Even rows | `background` | `var(--color-bg)` |
| Odd rows | `background` | `var(--color-surface)` |
| All KPI trend text | `color` | `var(--color-muted)` — direction-neutral |
| Anomaly KPI trend | `color` | `var(--color-negative)` + `font-weight: 500` — action required only |
| Insight block fill | `background` | `var(--insight-bg)` |
| Insight block left edge | `border-left` | `3px solid var(--color-accent)` |
| Anomaly table row | `background` | `var(--anomaly-bg)` |
| Anomaly cell text | `color` | `var(--color-negative)` + `font-weight: 500` |
| Data bar fill | `background` | `var(--color-accent)` (solid) |
| Chart primary | fill/border | `var(--color-accent)` |
| Axis labels | `color` | `var(--color-muted)` |
| Input field bg | `background` | `var(--color-input-bg)` |
 
---
 
## Emphasis Hierarchy — When to Use Special UI Signals
 
The single question to ask before applying any non-standard emphasis (different
color, heavier weight, background tint, larger size):
 
> **Does this data point require a specific business action right now?**
 
### Emphasis PERMITTED only for:
 
1. **Insight / Recommendation blocks** — `.insight-block` with accent left
   border + `--insight-bg` tint. These appear whenever a so-what conclusion or
   action suggestion is surfaced, regardless of data state.
2. **Anomaly data** — `.anomaly` class on table rows or KPI cards with
   `--anomaly-bg` tint + negative-color text on the offending value. Use only
   when a threshold is crossed and an action is required.
3. **Trend inflection points** — a single annotated cell or row that flags a
   structural change (e.g., third consecutive week of decline). Same `.anomaly`
   treatment.
### Emphasis FORBIDDEN for:
 
- Positive vs. negative direction on KPI trends (▲+12% green, ▼−3% red).
  Direction ≠ action. All trend text uses `--color-muted`.
- Different data categories within the same business dimension. Revenue is
  revenue — no sub-metric gets a special color to look "different."
- Data that is merely different, not actionable. Variety ≠ importance.
- Decorative section differentiation. Sections are separated by spacing only.
### Default state: zero special emphasis
 
A dashboard where all data is within normal operating range should render
**entirely in brand colors with no extra emphasis**. Insight blocks always
appear in their accent style — they exist by definition to surface so-what.
Everything else: uniform, quiet, readable.
 
---
 
## Product Philosophy
 
> Build lightweight operational analysis tools, not enterprise systems.
> Focus on repeatable analysis for recurring business problems using structured
> inputs and low-friction workflows.
 
This philosophy shapes every design decision:
 
- **Multi-role operational reasoning** — the same HTML report is read by
  operators, managers, and executives. Hierarchy in the layout (KPI → table →
  insight) serves all roles without requiring separate views.
- **Low noise, analysis-first** — the report exists to surface conclusions and
  support decisions. Every pixel that isn't data or insight is potential noise.
- **Minimal complexity** — one HTML file, no build tools, no frameworks.
  The tool should be shareable as a single file and readable without internet.
- **Solve business pain points with familiar tools** — output should integrate
  with Excel workflows and feel like a natural extension, not a new platform.
- **Communication style** — before adapting tone or emphasis for a specific
  audience, identify the stakeholder perspective shift first (operator → manager →
  exec), then adjust what is surfaced and how prominently.
---
 
## Implementation Checklist
 
**Tokens**
- [ ] All values defined as `--*` in `:root`
- [ ] Two fonts only: EB Garamond + Noto Sans SC
- [ ] `-webkit-font-smoothing: antialiased` on body
- [ ] `#F57C00` absent from all CSS (explicit ban)
**Layout**
- [ ] Nav bar: light surface `#FFFFFF`, 56px, sticky, `border-bottom: 1px solid var(--nav-border)`
- [ ] Active nav: `#2251FF` bottom border on white background
- [ ] Content wrapped in `.page-wrapper`
- [ ] Zones separated by `--space-xl` margin — no visible dividers
- [ ] Table is primary; chart secondary
**Emphasis Discipline**
- [ ] All KPI trend text uses `--color-muted` — no green/red for direction
- [ ] Insight blocks use `.insight-block` (accent left border + insight-bg) — for so-what and recommendations only
- [ ] Anomaly emphasis uses `.anomaly` class — only when action is required
- [ ] No decorative color variation between data categories of the same dimension
- [ ] If no anomalies and no insights: zero special emphasis on the page
**Depth**
- [ ] Three elevation tiers maximum per page
- [ ] `backdrop-filter` on modal only — never on nav, never on data cards
- [ ] Cards use `--shadow-md` at rest; lift to `--shadow-lg` on hover
**Radius**
- [ ] Cards: `--radius-md` (10px) or `--radius-lg` (14px)
- [ ] Inputs: `--radius-sm` (6px)
- [ ] Status badges: `--radius-pill` (100px)
- [ ] No arbitrary radius values outside token system
**Motion**
- [ ] Transitions use `--ease-standard` or `--ease-spring`
- [ ] Hover lift on cards: `translateY(-2px)` + shadow upgrade
- [ ] Press scale on interactive elements: `scale(0.97)`
- [ ] Maximum 3 animation types per page
**Typography**
- [ ] Display type (page title, KPI value): `--tracking-display`
- [ ] Section headings: `--tracking-heading`
- [ ] Uppercase labels: `--tracking-label`
- [ ] Numbers right-aligned throughout
**Color**
- [ ] No colors outside token set
- [ ] `--color-positive` and `--color-negative`: anomaly/action-required contexts only
- [ ] No per-page palette variation
- [ ] No `#F57C00` or any orange not in the token set
**Tables**
- [ ] Header: `--table-header-bg` (light tint), `--color-primary` text, `font-weight: 600`
- [ ] Alternating rows: `#F5F5F2` / `#FFFFFF`
- [ ] Data bars: solid `#2251FF`, animated width
---
 
## Final Visual Audit
 
```
── HTML Visual Audit ────────────────────────────
 
字体检查
  ✓ 无问题  /  ✗ 发现以下违规：
  - [元素]：字体为 [X]，应为 EB Garamond / Noto Sans SC
 
颜色检查
  ✓ 无问题  /  ✗ 额外色系：
  - [元素]：[background/color] = [值] → 最近似 token：[--color-xxx]
  - 是否存在 #F57C00 或任何橙色 → 立即移除
 
强调纪律检查
  ✓ 无问题  /  ✗ 发现以下违规：
  - KPI trend 使用了 positive/negative 颜色 → 全部改为 --color-muted
  - 对非异常数据使用了 .anomaly 类 → 移除
  - insight-block 出现在非建议/so-what 场景 → 移除
  - 存在 .anomaly 但该数据实际不需要行动 → 移除
  - 同一业务维度的数据 UI 不一致 → 统一
 
导航检查
  ✓ 无问题  /  ✗ 发现以下违规：
  - nav-bar background 不是 #FFFFFF → 替换为 var(--nav-bg)
  - nav 上有 backdrop-filter → 移除（仅 modal 允许）
 
深度检查
  ✓ 无问题  /  ✗ 发现以下违规：
  - backdrop-filter 出现在非 modal 元素上
  - 页面内超过 3 个阴影层级
 
Radius 检查
  ✓ 无问题  /  ✗ token 以外的 radius 值：[元素] [值]
 
动效检查
  ✓ 无问题  /  ✗ 使用了非 token easing 或超出 3 种动画类型
 
─────────────────────────────────────────────────
是否需要调整？
  A) 自动修正所有违规
  B) 仅修正颜色 / 强调纪律违规
  C) 仅修正 Depth / Radius / 动效违规
  D) 保留，不调整
```
 
---
 
## Reference Files
 
- `references/components.md` — Full HTML+CSS for all components with Apple
  refinements applied (frosted nav, layered card shadows, pill badges,
  animated data bars, spring hover states)
- `references/responsive.md` — Mobile breakpoint adaptations