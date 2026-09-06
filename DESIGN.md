---
name: Nocturne Index
description: A nocturnal fact-discovery experience that turns one centered question into a focused long-form reading journey.
colors:
  night: "#07090d"
  night-soft: "#0d1119"
  paper: "#f0eee8"
  muted: "#a8adbb"
  faint: "#586174"
  line: "#2c3444"
  signal: "#9badff"
  signal-strong: "#c4ceff"
  reading-paper: "#f2f0e9"
  reading-ink: "#202632"
  signal-ink: "oklch(40% .13 268)"
  signal-wash: "oklch(92.8% .031 267)"
  signal-night: "oklch(20% .055 272)"
  archive-ink: "oklch(43% .09 68)"
  archive-line: "oklch(68% .07 72)"
  archive-wash: "oklch(92.5% .035 83)"
  error-ink: "#f1c3c7"
  error-line: "#71444a"
  error-surface: "#1b1014"
typography:
  display:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(3.5rem, 7.5vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(1.7rem, 3vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.05
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.8
  reading-lead:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(1.25rem, 2vw, 1.55rem)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.13em"
rounded:
  control: "12px"
  orbit: "50%"
spacing:
  xs: "7px"
  sm: "14px"
  md: "24px"
  lg: "48px"
  xl: "70px"
  section: "100px"
components:
  search-select:
    backgroundColor: "{colors.night-soft}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 54px 0 20px"
    height: "64px"
  button-primary:
    backgroundColor: "{colors.signal-strong}"
    textColor: "#0c1020"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 23px"
    height: "64px"
  error-message:
    backgroundColor: "{colors.error-surface}"
    textColor: "{colors.error-ink}"
    rounded: "{rounded.control}"
    padding: "15px 18px"
---

# Design System: Nocturne Index

## Overview

**Creative North Star: "The Nocturne Index"**

Nocturne Index frames curiosity as a quiet signal in a dark, astronomical archive. The opening experience is sparse and centered: mineral-white editorial type, hairline orbital geometry, and a single cold-blue action sit within generous near-black space. Mystery comes from restraint and scale, never from obscuring the task.

The same journey has two complementary materials. Selection and generation live in the nocturnal world; the completed fact opens into a warm paper field designed for sustained reading, while its masthead and occasional inset return to the night palette. The interface should feel like one continuous reveal, not a dashboard or a collection of cards.

**Key Characteristics:**

- A single centered decision surrounded by deliberate negative space.
- Instrument Serif supplies editorial scale; DM Sans keeps controls and metadata exact.
- Fine orbital lines, diamond signals, and one cold-blue accent create the signature atmosphere.
- Generation is an honest, legible interlude rather than an indeterminate blank state.
- Long-form facts move from a dark ceremonial masthead into a warm, calm reading surface.

## Colors

Near-black and mineral-white establish the nocturnal index. Restrained blue-violet indicates focus, motion, progress, and active reading states. A low-chroma archival amber is reserved for chronology and durable takeaways, helping long text become navigable without making the page colorful for its own sake.

### Primary

- **Cold Signal** (`signal`): Focus outlines, active rules, timeline years, and small navigational cues.
- **Illuminated Signal** (`signal-strong`): The primary reveal action, selected emphasis, orbit markers, and text that carries active progress.
- **Signal Ink / Wash / Night** (`signal-ink`, `signal-wash`, `signal-night`): The readable indigo ramp for headings, open disclosures, the fact masthead, and evidence inset.
- **Archive Ink / Line / Wash** (`archive-ink`, `archive-line`, `archive-wash`): The amber ramp used only for timeline structure and the final memory region.

### Neutral

- **Index Night** (`night`): The default page, hero, sticky navigation, and atmospheric field.
- **Raised Night** (`night-soft`): Inputs and dark editorial insets that need gentle separation from the surrounding night.
- **Mineral Paper** (`paper`): Primary type on dark surfaces and the loader's central signal.
- **Reading Paper** (`reading-paper`): The long-form article canvas after the reveal.
- **Reading Ink** (`reading-ink`): Base text color on the reading surface.
- **Muted Silver** (`muted`): Supporting copy, timing information, and low-priority chrome.
- **Faint Slate** (`faint`): Deeply subdued structural detail.
- **Orbital Line** (`line`): Hairline geometry and dark-surface dividers.
- **Error Surface / Line / Ink** (`error-surface`, `error-line`, `error-ink`): A quiet oxblood-tinted alert family used only when a search fails.

### Named Rules

**The Two-Role Color Rule.** Cold blue-violet owns action, selection, and active explanation. Archival amber appears only where the interface organizes time or memory. Neither color decorates ordinary prose.

**The Material Shift Rule.** Discovery remains nocturnal; extended reading moves to warm paper while retaining night in the masthead, sticky navigation, and signature inset.

## Typography

**Display Font:** Instrument Serif (with Georgia and generic serif fallbacks)  
**Body Font:** DM Sans (with a generic sans-serif fallback)

**Character:** Instrument Serif makes questions and facts feel discovered rather than processed. DM Sans gives labels, controls, progress text, and prose a calm technical clarity. Both families are installed locally through Fontsource; the interface must not depend on a network font request.

### Hierarchy

- **Display** (400, fluid up to `6rem`, line-height `0.94`): Opening question and fact title; balanced wrapping and tight tracking create the defining editorial silhouette.
- **Headline** (400, fluid `1.7rem`–`2.25rem`, line-height `1.05`): Long-form section headings.
- **Reading Lead** (400, fluid `1.25rem`–`1.55rem`, line-height `1.65`): The opening summary and prominent explanatory copy.
- **Body** (400, `1rem`, line-height `1.8`): Article prose and lists, held to a readable maximum of roughly `72ch`.
- **Label** (400, `0.72rem`, tracking `0.13em`): Uppercase category labels and utility chrome; metadata may step down to `0.62rem`–`0.78rem` while retaining generous tracking.

### Named Rules

**The Editorial Scale Rule.** Reserve Instrument Serif's largest sizes for the question, search state, fact title, quotations, and section hierarchy; ordinary controls and navigation remain in DM Sans.

## Layout

The discovery surface fills at least one small viewport height and centers a single column within an `820px` maximum. Header and footer are pinned to the viewport edges with fluid inline padding; the category form narrows to `600px` and uses a two-column select/action arrangement on wide screens. Ambient geometry may cross the composition, but it is fixed behind content and never participates in interaction.

The fact reveal starts with a static `68px` utility header, followed by a dark full-width hero, a compact in-flow contents strip, and a warm reading canvas capped at `920px`. The header is visible only at the document top and scrolls away normally; a two-pixel reading-progress line is the sole fixed element. The one-minute summary, a compact “Did you know?” note, and key evidence stay visible. Long material is grouped into four closed semantic native disclosures so the reader chooses the depth: story, mechanics, world context, and surprises. API-authored Markdown is normalized at the rendering boundary so escaped line breaks become real headings, paragraphs, and lists. The timeline uses a dedicated date gutter beside an uninterrupted event rail, keeping long historical ranges separate from its line and markers. Takeaways, taxonomy, share copy, metadata, quotations, and references remain part of this single document flow rather than becoming cards.

At `720px` and below, the discovery header's secondary phrase is removed, the search controls stack, progress details become one column, and the in-flow contents strip scrolls horizontally. Fact metadata wraps, disclosures retain full-width tap targets, takeaway and taxonomy items become one column, timelines reduce their year rail, and the dark evidence and share insets deliberately bleed to the reading canvas edges. Minimum page width is `320px`; principal horizontal content padding is `20px`–`24px` on small screens.

**The Center-to-Column Rule.** The journey begins as a centered moment and resolves into a vertically paced reading document; do not introduce sidebars, card grids, or persistent multi-panel navigation.

## Elevation & Depth

Depth is mostly tonal and atmospheric. The page uses a blurred indigo field, translucent orbital strokes, and sparse star points behind the opening content; reading depth comes from material contrast and hairline dividers. Shadows are reserved for the two interactive search controls and the moving orbital signal, never for article sections.

### Shadow Vocabulary

- **Control Float** (`0 18px 42px rgba(0, 0, 0, 0.28)`): The category selector over the night field.
- **Action Float** (`0 20px 44px rgba(0, 0, 0, 0.30)`): The primary reveal button.
- **Orbit Glow** (`0 6px 18px rgba(132, 152, 255, 0.42)`): The leading point on the loading instrument.

**The Flat Reading Rule.** Article sections remain flat and are separated by rules, spacing, and color changes; never turn them into elevated cards.

## Shapes

Controls use gently rounded `12px` corners and rectangular proportions. Signature geometry is finer and more exact: circular orbital paths, tiny circular stars, and squares rotated `45deg` into diamonds for the wordmark, loader core, dropdown mark, and takeaway bullets. Borders are one-pixel hairlines; the warm article canvas otherwise avoids boxed containers.

**The Diamond Signal Rule.** Use the rotated square only as a small recurring marker; it is a navigational or mnemonic signal, not a decorative pattern.

## Components

### Primary Reveal Button

- **Shape:** A `64px`-high rectangular control with gently curved `12px` corners and `23px` horizontal padding.
- **Color:** Illuminated Signal on deep ink, paired with a fine right-arrow outline.
- **Hover / Active:** Rise `3px` with a slightly brighter blue-violet surface; return to rest on press. State transitions use a spring-like `cubic-bezier(.16, 1, .3, 1)` for movement.
- **Disabled:** Preserve the shape but reduce opacity to `0.35`, remove lift, and use a not-allowed cursor.

### Category Select

- **Role:** Category is an optional preference, never a gate. The centered “Tell me a fact” action leads; a compact “Any category” select beneath it randomly chooses from the current API response unless the visitor specifies a subject. Categories are grouped into readable domains, with unknown future API categories retained under “More subjects.”
- **Style:** The small secondary select uses Raised Night fill, a one-pixel slate border, Mineral Paper text, and a custom cold-blue diamond chevron. It relies on direct control copy rather than explanatory text.
- **Shape:** The primary action is `64px` high; the category control is deliberately quieter at `42px`. Both use `12px` corners.
- **Focus:** All selects, buttons, and links receive a `2px` Cold Signal outline offset by `5px`.
- **Disabled:** While categories load, reduce opacity to `0.6` and communicate waiting with the cursor. Once loaded, the primary “Tell me a fact” action is enabled whether or not a custom subject is chosen.

### Previous Discoveries Trigger and Index

- **Trigger:** A quiet underlined action beneath the primary form uses the same thin-stroke icon language and never competes with fact generation.
- **Index:** A native `<dialog>` opens a nocturnal, scroll-contained list. A compact category selector requests server-filtered history before the list; each full-width row exposes category, generated date, title, and headline before a circular arrow affordance. Rows are divided by hairlines rather than rendered as cards.
- **States:** Fetch on first open and whenever the category changes. Provide composed loading, filtered-empty, error, retry, and incremental-loading states. Selecting a row closes the dialog and sends the complete historical fact into the established reader without starting a generation job.
- **Responsive:** The dialog retains a small viewport margin, a fixed header and footer, and an independently scrolling list on compact screens.

### Wordmark and Utility Navigation

- **Style:** Small tracked uppercase DM Sans. The wordmark begins with an outlined blue-violet diamond; the fact view changes to a sticky near-black bar with category context and an understated underlined reset action.
- **Behavior:** Both wordmarks are real home links; the reader link returns to `/` rather than targeting its own hero fragment. The opening header and single-line footer remain peripheral. On small screens, remove the secondary header phrase before reducing the wordmark.

### Orbital Search Instrument

- **Style:** Three concentric one-pixel orbits contain small signal points around a mineral-white diamond core.
- **Motion:** Orbits rotate at different durations (`9s`, `6.5s`, and `4.5s`), with one reversed direction; the core breathes every `2.6s`.
- **Status:** Pair the instrument with a live polite text status, tabular elapsed seconds, and the honest `35–50 seconds` expectation. The changing visual itself remains hidden from assistive technology.

### Fact Metadata and Reading Sections

- **Style:** Metadata uses compact uppercase labels and serif values above a hairline. The summary remains open; secondary text is organized into native `<details>` elements with clear titles, scope hints, circular chevrons, and a pale indigo open state.
- **Responsive:** Metadata wraps naturally; every disclosure retains a large tap target and its content returns to the full reading width below `720px`.

### Reading Timeline

- **Style:** Each dated event is mapped to a shared vertical spine with a diamond marker, a tabular year rail, and an aligned event description. Archival amber distinguishes chronology from navigation.
- **Responsive:** The year rail and gaps contract below `720px`, while dates and events remain in separate columns.

### Memory Region

- **Style:** Learning takeaways sit in one flat archival-amber field near the end of the article. Diamond markers and rules retain meaning without turning each takeaway into a card.
- **Responsive:** The two-column list becomes a single sequence on compact screens.

### Fact Aside

- **Style:** A flat Raised Night inset combines an italic Instrument Serif quotation with key figures or statistics. It has no border radius and no card shadow.
- **Responsive:** The two-column composition collapses to one column and bleeds to the mobile reading edge.

### Error Message

- **Style:** A compact centered alert with muted oxblood surface and border, pale rose text, `12px` corners, and an explicit `role="alert"`.

## Do's and Don'ts

### Do:

- **Do** keep the opening screen focused on one question, one native category selector, and one reveal action.
- **Do** use generous negative space, hairlines, and restrained tonal changes before adding new containers.
- **Do** keep focus states obvious, status copy live, and all atmospheric graphics non-interactive and hidden from assistive technology.
- **Do** honor `prefers-reduced-motion` by collapsing animation and transition durations, and preserve a clear static state.
- **Do** keep display and body fonts local through Fontsource with practical fallbacks.
- **Do** let optional fact fields disappear cleanly without leaving empty sections or broken rhythm.

### Don't:

- **Don't** turn categories, fact sections, or takeaways into a dashboard or card grid.
- **Don't** use indigo or amber outside their action/explanation and chronology/memory roles, or add gradients, raster decoration, or ornate archive metaphors.
- **Don't** use shadows on the reading document; depth there comes from type, spacing, rules, and night-to-paper contrast.
- **Don't** obscure the real generation wait or replace its elapsed time and expectation with false progress.
- **Don't** shrink away the serif scale that gives the experience its voice; adapt wrapping and spacing first.
