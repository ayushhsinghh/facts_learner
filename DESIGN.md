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
  physics-title:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(3rem, 6vw, 5.4rem)"
    fontWeight: 400
  physics-question:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2.6rem, 4.5vw, 3.8rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  physics-heading:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(2rem, 3.4vw, 2.8rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.02em"
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
  physics-lesson:
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    width: "1040px"
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

Physics, Biology, Psychology, and Constitution use the shared large serif hero title.
Their opening question and section headings retain the lesson-specific serif roles. These roles preserve
the established families while adapting the scale for sustained explanation. Subordinate headings use
Instrument Serif (400, `1.65rem`, line-height `1.25`); learning goals use DM Sans (`1.1rem`).
These lesson roles do not change the global typography tokens.

### Named Rules

**The Editorial Scale Rule.** Reserve Instrument Serif's largest sizes for the question, search state, fact title, quotations, and section hierarchy; ordinary controls and navigation remain in DM Sans.

## Layout

The discovery surface fills at least one small viewport height and centers a single column within an `820px` maximum. Header and footer are pinned to the viewport edges with fluid inline padding; the category form narrows to `600px` and uses a two-column select/action arrangement on wide screens. Ambient geometry may cross the composition, but it is fixed behind content and never participates in interaction.

The fact reveal starts with a static `72px` utility header, followed by a dark full-width hero, a compact in-flow contents strip, and a warm reading canvas capped at `920px`. The header is visible only at the document top and scrolls away normally; a two-pixel reading-progress line is the sole fixed element. The one-minute summary, a compact “Did you know?” note, and key evidence stay visible. Long material is grouped into four closed semantic native disclosures so the reader chooses the depth: story, mechanics, world context, and surprises. API-authored Markdown is normalized at the rendering boundary so escaped line breaks become real headings, paragraphs, and lists. The timeline uses a dedicated date gutter beside an uninterrupted event rail, keeping long historical ranges separate from its line and markers. Takeaways, taxonomy, share copy, metadata, quotations, and references remain part of this single document flow rather than becoming cards.

At `720px` and below, the discovery header's secondary phrase is removed, the search controls stack, progress details become one column, and the in-flow contents strip scrolls horizontally. Fact metadata wraps, disclosures retain full-width tap targets, takeaway and taxonomy items become one column, timelines reduce their year rail, and the dark evidence and share insets deliberately bleed to the reading canvas edges. Minimum page width is `320px`; principal horizontal content padding is `20px`–`24px` on small screens.

The Physics lesson keeps the existing reader shell and a centered lesson wrapper capped at `1040px`.
Prose stays within `75ch`; the diagram section can use the full wrapper width. Section spacing is `64px`,
reducing to `48px` at the existing `720px` breakpoint. Example givens and diagram keys use two columns
on wide screens and one column on phones. Equations and graph data can scroll within their own region.
Physics, Biology, Psychology, and Constitution share the full-width cover hero with the other readers.
Its minimum height is `calc(100svh - 72px)` on desktop and mobile, below the static navigation.
Keep the large Instrument Serif title over a quiet dark overlay. Place metadata in the closed
“About this discovery” disclosure. The contents and lesson question follow the hero in normal flow.

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

- **Style:** An aperture of two fine circular guides, one scanning ray, and expanding diamond echoes surrounds the archive's diamond mark. Background orbital arcs recede during generation. The serif heading stays still and readable, with the category on its own line.
- **Motion thesis:** One indeterminate scan sustains the waiting state. A `16s` scan and `24s` counter-rotation surround an `8s` breathing core and staggered echoes. Only transforms and opacity animate; there are no animated gradients, shadows, or per-frame React updates. Entrances use `240ms` and `--ease-out`; status changes use `200ms`.
- **Continuity:** A newly generated fact receives a short `240ms` masthead arrival with no added navigation delay. Archive navigation and Back/Forward do not replay that reveal.
- **Status:** A polite live status reports generation, then longer waits after `50s` and `90s`. The elapsed clock uses wall time, not interval counts. The instrument never implies a completion percentage or invented backend stages.
- **Control:** Pause/resume affects the instrument only, not status updates or the request. Hidden tabs pause the instrument. Reduced motion replaces all loops with static geometry and a brief status fade. Decorative geometry stays hidden from assistive technology.
- **Responsive:** Aperture size follows both viewport width and height. Short screens use a smaller instrument and heading, keeping the motion control visible without obscuring the footer.

### Fact Metadata and Reading Sections

- **Style:** Metadata uses compact uppercase labels and serif values above a hairline. The summary remains open; secondary text is organized into native `<details>` elements with clear titles, scope hints, circular chevrons, and a pale indigo open state.
- **Grouped narration:** Each factual heading carries one discreet circular speaker control that reads every paragraph and list item in its section. Only content without a heading gets its own trailing speaker. Playback highlights the active sentence directly in the original text and stops when the same control is pressed again, another group starts, or the reader leaves the fact.
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

### Physics Lesson

A linear explanation extends the existing dark reader. The lesson uses Index Night, Mineral Paper,
Raised Night insets, blue-violet emphasis, existing sources, and grouped narration.
Separate Physics sections, disclosures, definitions, and checks with spacing rather than decorative rules.
Keep scientific diagram strokes, the reading progress line, focus outlines, and control boundaries.
Its current dark surface takes priority over the older warm-paper description for this component.
The explanation remains readable without opening optional mathematics.

- **Structure:** Keep the question, goal, basic idea, static diagram, causal explanation, worked example,
  limits, knowledge checks, and takeaways in one document flow. Reuse the existing in-flow contents links,
  reader controls, progress line, references, and sharing.
- **Disclosures:** Use native `<details>` for background, diagram description, numerical steps,
  mathematics, derivation, and answers. Summaries retain at least a `44px` target. Keep these closed
  initially; the main explanation and example result remain visible. Answers reveal without scoring or saving.
- **Diagram:** Render only the static SVG allowlist: comparison, force, ray, energy flow, and graph.
  Keep labels, a text description, assumptions, and sources attached. Graphs also provide a data table.
  Invalid diagram data falls back to its text description. Do not add executable model content.
  Follow the shared Article Images contract below. Generated images do not replace structured scientific diagrams.
- **Mathematics:** Load KaTeX only when the mathematics disclosure opens. Preserve spoken formulas,
  symbol meanings, units, assumptions, and readable error fallbacks. Keep formula overflow inside its region.
- **Narration:** Skip content inside closed lesson disclosures during section playback. Opening a disclosure
  explicitly opts its content into the next playback. Section playback must not open answers or mathematics.
  Preserve the existing sentence highlighting and stop controls.
- **Depth:** Analogy and model-limit insets use flat Raised Night fields, without shadows or nested cards.

### Biology Lesson

Biology extends the existing dark reader with context, participants, relationships, and conditions.
Reuse the `physics-*` reading primitives deliberately: section rhythm, serif headings, prose width,
flat insets, native disclosures, supporting images, and narration behavior. Keep the existing palette,
reader controls, progress line, references, sharing, and archive routes. Use spacing instead of
decorative dividers; retain scientific connections, focus outlines, and control boundaries.

- **Structure:** Keep the question and goal, organism/system context, conditions, big idea, key players,
  connections, explanation, worked example, changed condition, misconceptions, evidence limits,
  checks, and takeaways in one reading flow. Support five lesson types: process, structure/function,
  inheritance, adaptation/evolution, and ecosystem. Each changes the explanation heading and map type.
- **Layout:** Keep the shared `1040px` wrapper, `75ch` prose width, and `64px` section spacing.
  Reduce spacing to `48px` at `720px`. Context uses three columns on desktop and one on phones.
  Keep numbered diagram keys and written relationships readable beneath the map.
- **Maps:** Render static node-and-link SVG maps only: sequence, structure map, inheritance,
  population sequence, and relationship map. Infer inheritance levels from explicit parent-to-descendant
  edges, never node order. Preserve captions, sources, text descriptions, and limits. Invalid map data
  falls back to its text description. Do not imply anatomical precision or add executable model content.
- **Open teaching detail:** Local names, time zones and the flag explanation stay visible. The flag
  appears beside its explanation on desktop and above it on mobile, with accessible enlargement.
  New core topics require a complete explanation, two to four supporting details and a concrete example.
- **Optional depth:** Terms, deeper detail, diagram description/limits, and answers start closed in native
  `<details>`. Keep summaries at least `44px` high. Section narration skips closed disclosures;
  opening one opts its content into the next playback. Narration must not reveal answers automatically.
  Checks have no scoring or saved state.
- **Images:** Follow the shared Article Images contract below. Images do not replace maps.
- **Review scope:** The reviewed desktop and mobile captures use the process lesson fixture only.
  See `.impeccable/review/biology-desktop.png` and `.impeccable/review/biology-mobile.png`.
  These captures do not establish visual review of the other four lesson types or live generated content.

### Psychology Lesson

Psychology extends the existing dark reader with an experience-first explanation, evidence, and limits.
Reuse the `physics-*` reading primitives and `BiologyDiagram` deliberately: they supply the established
section rhythm, prose width, disclosures, static maps, and narration behavior. Keep the Nocturne palette,
Instrument Serif / DM Sans typography, reader controls, progress, references, sharing, and archive routes.
Separate content with spacing rather than decorative rules; retain meaningful diagram strokes and controls.

- **Opening:** Use the shared full-viewport cover hero, with metadata inside the closed “About this discovery” disclosure.
  Follow the hero with the question, learning goal, and illustrative scene. Give the scene a flat Raised Night inset.
  The scene invites thought; it does not assess personality or diagnose the reader.
- **Formats:** Support cognitive process, learning/behavior, social influence, and research finding lessons.
  Each changes the explanation heading and map format while preserving one linear reading flow:
  scene, idea, explanation, example, evidence, alternative explanations, limits, application, checks, and takeaways.
- **Evidence:** Keep the finding, interpretation, research design, inference limits, participants, setting,
  and important limitations visible. Put methods and reported numbers inside a closed native disclosure.
  Render unknown sample counts and publication years as “Not reported”; years never use digit grouping.
  Source links and evidence labels identify supplied references and never imply independent verification.
  Keep replication uncertainty and alternative explanations readable without opening study methods.
- **Maps:** Use static process maps, feedback loops, situation comparisons, or study designs.
  Associations use dashed connections without arrows; conceptual connections are also undirected.
  Procedure and causal connections use arrows. Preserve written relationships, source links, descriptions,
  and limits; invalid map data falls back to its text description.
- **Open teaching detail:** Local names, time zones and the flag explanation stay visible. The flag
  appears beside its explanation on desktop and above it on mobile, with accessible enlargement.
  New core topics require a complete explanation, two to four supporting details and a concrete example.
- **Optional depth:** Predictions, terms, study methods, deeper detail, diagram descriptions, and answers
  start closed. Keep disclosure summaries at least `44px` high. Narration skips closed disclosures,
  including prediction reveals and answers; opening a disclosure opts its content into the next playback.
  Never reveal an answer automatically. Predictions and checks have no scoring or saved state.
- **Layout and images:** Keep the shared `1040px` wrapper, `75ch` prose width, and `64px` section rhythm,
  reducing spacing to `48px` at `720px`. Study metadata uses three columns on desktop and one on phones.
  Follow the shared Article Images contract below. Generated images do not replace evidence maps.
- **Review scope and disposition:** Ship the reviewed cognitive-process fixture on desktop and mobile.
  Captures: `.impeccable/review/psychology-desktop.png` and `.impeccable/review/psychology-mobile.png`.
  Disclosures start closed, and review uses no paid image generation. These captures do not establish
  visual review of the other three formats or live generated content.

### Constitution Lesson

Constitution extends the existing dark reader to teach one easy-to-medium idea to a non-expert.
Reuse the `physics-*` reading primitives and `BiologyDiagram`, Nocturne palette, serif headings,
DM Sans prose, reader controls, progress, sources, sharing, and archive routes. Use spacing rather
than decorative rules. Keep plain meaning, original wording, and judicial interpretation distinct.

- **Opening and flow:** Keep the header static and use the shared full-viewport cover hero. Keep metadata
  inside the closed “About this discovery” disclosure. Follow with the question, learning goal, and a hypothetical scene
  in a flat Raised Night inset. Follow with plain meaning, the provision, explanation, worked example,
  scope, confusions, optional context, checks, and takeaways. Keep the same single-idea reading flow
  across five schema-supported modes: right/principle, institution, procedure, amendment, and case explainer.
- **Meaning and limits:** Label the plain-language explanation separately from constitutional text.
  Keep the provision type, legal effect, people concerned, conditions, exceptions, and limits visible.
  Distinguish a constitutional provision, judicial interpretation, amendment, and ordinary law.
  Keep each example's limits beside its outcome; do not present a hypothetical situation as a judgment.
- **Source wording:** Display original wording only when its metadata reports `matched_official_edition`,
  the fixed `COI_2024.pdf` official source URL, edition date `2024-05-01`, and a valid comparison date.
  Otherwise show the paraphrase explanation and official-edition link. Label the edition date and
  comparison date separately. The generation date is not a legal verification date, and matched wording
  does not establish current law or confirm later amendments and judgments.
- **Optional depth and narration:** Use closed native `<details>` for source wording, terms, case notes,
  amendment history, deeper detail, diagram descriptions, and answers. Keep summaries at least `44px`
  high. Narration skips closed disclosures; opening one opts its content into the next playback.
  Narration must not reveal answers automatically. Checks have no scoring or saved state.
- **Maps and responsive layout:** Keep the shared `1040px` wrapper, `75ch` prose width, and `64px`
  section rhythm, reducing spacing to `48px` at `720px`. Use static scope, roles, process, comparison,
  and case maps with written relationships, sources, descriptions, and limits. Invalid map data falls
  back to its text description. Amendment comparison panes stack on mobile. Amendment dates occupy
  their own row above each event, separate from any timeline line or marker.
- **Images:** Follow the shared Article Images contract below. Generated images do not replace
  constitutional text or structured maps.
- **Review scope and disposition:** Ship the reviewed Article 14 `right_or_principle` fixture on desktop
  and mobile. Captures: `.impeccable/review/constitution-desktop.png` and
  `.impeccable/review/constitution-mobile.png`. These files contain JPEG bytes despite their `.png`
  names, at native widths of `1270px` and `380px` for `1280px` and `390px` viewports with a `10px` gutter.
  Review uses no paid raster generation. These captures do not establish visual review of the other
  four modes, live generated content, or legal verification.

### Indian Laws Lesson

Indian Laws extends the existing Nocturne reader for one beginner legal concept outside the Constitution.
Reuse Instrument Serif headings, DM Sans prose, night surfaces, blue-violet controls, the shared
full-viewport cover, static header, visible hero metadata, reading progress, narration, and sharing.
The current reader has no diagram component or diagram chrome. Separate sections with spacing.

- **Flow:** Start with the question, learning goal, and familiar situation in a flat Raised Night inset.
  Continue with the plain-language rule, applicability, connected explanation steps, worked hypothetical,
  optional changed-fact contrast, confusions, optional legal detail, checks, and takeaways. Support concept,
  right/duty, procedure, comparison, and case-explainer modes within this reading flow.
- **Authority and limits:** Treat Acts and codes as primary authority; label court interpretation and
  commentary separately. Keep jurisdiction, people concerned, relevant dates, conditions, exceptions,
  and limits visible. Keep each hypothetical's implications and limits together. Legal explanations are
  paraphrases. Article-supplied status labels do not establish verified or current law. The backend does
  not retrieve sources or independently check legal currency. Source links appear only at the bottom.
- **Open teaching detail:** Local names, time zones and the flag explanation stay visible. The flag
  appears beside its explanation on desktop and above it on mobile, with accessible enlargement.
  New core topics require a complete explanation, two to four supporting details and a concrete example.
- **Optional depth:** Terms, legal basis, case notes, law changes, commentary, deeper detail, and check
  answers use native disclosures that start closed. Keep summaries at least `44px` high. Section narration
  skips closed disclosures; opening one includes its content in the next playback. Narration must not
  reveal answers automatically. Checks have no scoring or saved state.
- **Layout and images:** Keep the shared `1040px` wrapper, `75ch` prose width, and `64px` section rhythm,
  reducing section spacing to `48px` at `720px`. Follow the shared 3–5-image contract and enlargement
  dialog below. Generated scenes illustrate an idea; they do not provide authentic legal evidence.
  Stored facts without the valid structured lesson contract retain the generic reader.
- **Review scope and disposition:** Ship the reviewed agreement-versus-contract `concept` fixture.
  Captures: `.impeccable/review/laws-desktop-cover.png`, `laws-desktop.png`, `laws-mobile-cover.png`,
  `laws-mobile.png`, `laws-mobile-example.png`, and `laws-mobile-detail.png` in the same directory.
  These files contain JPEG bytes despite their `.png` names: `1270×794` desktop and `380×822` mobile.
  Review covers the cover, reading flow, hypothetical, and optional legal detail. It does not establish
  review of every mode, live generated content, source validity, or legal currency. No paid generation
  or deployment forms part of this review.

### Country Profile

Country extends the Nocturne reader with an accessible 8–15 minute portrait. Reuse Instrument Serif
headings, DM Sans prose, night surfaces, blue-violet controls, reading progress, section narration and
sharing. Keep the static header, full-viewport image cover, Flagpedia flag, country name,
one-sentence introduction, visible metadata and adjacent asset credit. Separate sections with spacing.

- **Flow and layout:** Follow one introduction with visible learning goals, essentials, map location, everyday life, concise history,
  world contributions and products, places, people, surprises and misunderstandings, recall checks,
  and further curiosity. Keep main prose visible. Reuse the shared `1040px` wrapper, `75ch` prose width
  and `64px` section spacing, reducing spacing to `48px` at `720px`. Capital, currency, languages and
  dated population, local names and area form a readable two-column reference, including on phones
  from `360px`; narrower screens stack it. Time zones stay open below it. Official name, population
  scope and snapshot caveats remain in Data dates and scope. City descriptions are optional. Keep the central idea for the recap and the
  first surprise in the surprises section. The cover shows reading time, level and region; secondary
  article labels and dates remain in Article details near the end. Four primary reading links lead
  to the start, essentials/map, life/stories and recap; Explore all sections exposes chapter links.
  History dates occupy a separate column on desktop and a separate row on phones.
- **Locator:** World and Region buttons reuse one Natural Earth map asset. Default to Region, fitting
  the main land area rather than a fixed 72-degree square. Use country coordinates,
  highlight the country and retain the small-island marker and neutral boundary caption. Keep polygon
  rings continuous across the antimeridian and repeat them at the map seam. The map uses `380px`
  height on desktop and `300px` on phones. A readable country callout and up to four nearby-country
  labels use snapshot coordinates, with collision filtering and pixel-scaled text/markers. Keep land
  neighbours and named waters beside the map. The marker is not a capital. Region may omit distant
  territories; World remains available. If loading fails, retain the written location description.
- **Data and sources:** Names, capitals, currencies, language lists, area and country coordinates use
  an adapted `mledoze/countries` ODbL snapshot retrieved on `2026-10-30`. Publish the adapted data
  and licence at `/maps/country-data.json` and `/maps/COUNTRY_DATA_LICENSE.txt`. Retrieval does not
  establish effective dates or current accuracy. Listed languages do not prove legally official status.
  Narrative population needs a measurement year; unknown values display “Not supplied.” Keep narrative
  source links at the bottom and asset credits beside the asset. Narrative claims remain unverified.
- **Illustrations, photographs and credit:** Country overrides the shared generated-image budget below.
  New `country_media.version: 2` profiles request at most four GenAI illustrations: required `cover`
  and `overview`, plus optional `how_it_works` and `explanation_2`. New `photo_layout: contextual_v2`
  plans separate Unsplash scenes from Wikimedia Commons subject figures. There is no ten-visual cap.
  Lifecycle state tracks subject slots; archived country profiles can request a cached photo-only upgrade. Legacy
  country retries remain photo-only; failed photo searches never trigger automatic paid backfill.
  Generated illustrations keep a small AI label and their full non-documentary notice in Image credits.
  Keep author, original page and licence available through a subtle info button in the carousel,
  enlargement, covers and archive cards. Do not render resizing/cropping boilerplate. Credits
  follow the asset currently displayed. Metadata checks do not independently verify subject, location,
  teaching relevance or licence accuracy. Preserve natural figure ratios and accessible enlargement.
- **Cover and archive fallback:** Request generation for the required cover and overview. Display the
  requested asset, another available image, a licensed gallery photo, then bundled Natural Earth
  world-map artwork. Broken URLs advance this chain. Gallery items are deduplicated at the fact root;
  persisted media status and history retain available results.
- **Photo carousel:** Search twelve distinct topics, using country-specific destinations where supplied. Prefer Unsplash
  and use topic-filtered Wikimedia fallback. Target at least ten photos, with up to two per topic
  (24 total); unavailable or irrelevant topics stay empty. Deduplicate source and description. Use native swipe/scroll with previous/next controls of at least
  `44px` and Left/Right keyboard navigation. Never autoplay. Respect reduced-motion preferences. Keep
  credits available through the adjacent info button and in the shared enlargement dialog. Preserve image proportions.
- **Subject figures:** Place a Wikimedia Commons figure with each notable person, notable place,
  everyday-life topic, contribution, product and optional city when a matching image is available.
  Topic entries use concrete `photo_subject` and bounded `photo_queries`; old titles derive simpler aliases.
  Everyday-life, contribution and product figures use the prose width, preserving a stable text layout. Keep native image proportions, adjacent credits and accessible
  enlargement. At `720px` and below, place the image after the text; portrait figures are at most `280px`
  wide. Missing or broken images leave a text-only entry with no empty figure.
- **Open teaching detail:** Local names, time zones and the flag explanation stay visible. The flag
  appears beside its explanation on desktop and above it on mobile, with accessible enlargement.
  New core topics require a complete explanation, two to four supporting details and a concrete example.
- **Optional depth:** Learning goals, language roles and answers
  use native disclosures that start closed. Section narration skips closed disclosures. Opening one opts
  its content into the next playback. Checks have no scores or saved state. Older country facts without
  the valid structured profile contract retain the generic reader.
- **Review scope and disposition:** Ship the reviewed hybrid country reader. The fresh
  `country_mixed_finish_reviewer` requests no fixes. Captures in `.impeccable/review/` are
  `country-mixed-desktop-cover.png`, `country-mixed-desktop-carousel.png`,
  `country-mixed-mobile-carousel.png`, `country-mixed-mobile-empty-cover.png`,
  `country-mixed-mobile-empty-card.png`, and `country-mixed-dialog.png`. They supersede the earlier
  photo-only country review evidence for this media change. Focused validation reports 41 frontend
  tests, 71 backend tests and a passing production build, with the existing chunk-size warning above
  500 KB. Generated-asset appearance has source and unit coverage only; no actual GenAI calls occur.
  A live public Commons fallback search for Costa Rica returns 12 candidates, with nine licensed,
  country-matching photos. This does not independently verify narrative facts, exact photo subjects,
  every country's layout or live generated-asset appearance. No paid generation or deployment occurs.
  This is historical evidence for the hybrid reader; the contextual extension has its own focused review.
- **Contextual extension review:** `country_context_finish_reviewer` returns ship with no material fixes
  for the reviewed sections. The six captures in `.impeccable/review/` are
  `country-context-desktop-people.png`, `country-context-desktop-places.png`,
  `country-context-desktop-culture.png`, `country-context-mobile-people.png`,
  `country-context-mobile-culture.png`, and `country-context-mobile-carousel.png`.
  This review does not approve the full page, cover, production behavior or live generated appearance.
  No paid generation or deployment occurs. Final focused test results belong to the implementation report.

### Article Images

- **New articles:** Request 3–5 purposeful images: `cover`, `overview`, and `how_it_works`, with optional
  `explanation_2` and `explanation_3`. This includes Physics, Biology, Psychology, and Constitution.
  The overview summarizes the whole article and takes priority on discovery cards. Cover art supplies the hero.
- **Myths:** Keep `cover`, `overview`, `myth_visual`, and `truth_visual` as the four-image minimum.
  An optional `how_it_works` image brings the total to five. Keep myth and truth art beside their respective content.
- **Metadata and placement:** Root `image_details` supplies each slot's `alt`, `caption`, `learning_purpose`,
  and `placement`. Place images in the overview, explanation, example, or limits according to that plan.
  Captions explain the learning value; generated artwork never replaces sources, evidence, or structured diagrams.
- **Figures:** Use the full available reading column and the natural image ratio without cropping.
  Each image is an accessible enlarge button with at least a `44px` target. Keep its caption below the image.
  Use the native `<dialog>` for enlargement. Focus moves to Close, remains inside the modal, and returns to
  the opener on close. Escape and the close button dismiss the dialog.
- **Archive compatibility:** Do not backfill stored facts. Show existing image slots when available and fall back
  to legacy lesson `supporting_image` metadata. Missing metadata uses readable fallback alt text and default placement.
- **Review scope:** Ship the reviewed layout shown in `.impeccable/review/article-images-desktop.png`,
  `.impeccable/review/article-images-mobile.png`, `.impeccable/review/article-images-mobile-body.png`, and
  `.impeccable/review/article-images-dialog.png`. The layout fixture reuses an existing car cover across slots.
  These captures support layout and dialog review; they do not establish asset accuracy or live generation quality.
  Review uses no paid generation and performs no deployment.

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


## Fitness and Indian food readers

Fitness, Indian Diet, Nutrition Myths, and Home Workouts live in the existing category selector under
“Fitness & Indian food.” Discovery keeps its single question, optional category, and reveal action.
Do not add a separate category card grid.

Fitness, Indian Diet, and Home Workouts reuse the existing dark FactView reader. Keep its poster
cover with overlaid title, Instrument Serif / DM Sans typography, blue-violet accents, metadata,
reading progress, grouped narration, progressive disclosures, source references, and sharing.
The current dark reading surface and the user's explicit dark-theme preference take priority over
older warm-paper descriptions above. Do not introduce category-specific palettes or article shells.
Nutrition Myths continues to use the existing dark myth reader.

Category-specific content can change its structure: workout instructions, rest and progression;
portion-based nutrition labels, meal examples and swaps. Use the existing night surfaces, thin rules, muted labels, blue focus states and 12px
controls. Keep sections flat and text readable. Unknown nutrients display a dash, distinct from a true zero.

Indian Diet follows a facts-first reading order: summary and the short contextual note, then the
explanations, followed by meal ideas, swaps, practical tips, and limitations. Its main context and
mechanics disclosures start open; non-wellness categories keep their existing order and disclosure defaults.
The contents links follow the same DOM order. Keep the dark reader and existing narrated headings.

Nutrition labels follow the practical guide, not the opening explanation. Each food is a separate
closed native disclosure with its name and portion visible. Opening it reveals preparation assumptions,
energy, protein, carbohydrates, fat, fibre, micronutrients, and source links. Values use a three-column
definition list on desktop and two columns on phones, with no horizontally scrolling table. Preserve
all API values and source IDs without calculating totals or introducing dietary claims. When the
section reader reaches a closed label, open that label before highlighting its spoken content.

Fitness and Home Workouts use the same explanation-first sequence: overview, supporting fact,
open context and mechanics, then the practice guide. The guide keeps its goal, level, duration,
equipment, frequency, safety notes, warm-up, cool-down, and recovery visible. Individual exercises
are flat, closed native disclosures with names and sets/reps/rest in their summaries. Steps, sources,
easier options and progression stay inside each exercise.
Narration opens enclosing disclosures within the selected section before highlighting their content.

Fitness and Home Workouts use written exercise instructions only. No external exercise catalog,
video search, video player, or provider credential is required. Keep sources, safety information,
and all generated practice-guide fields available independently of third-party services.

## India topic reader

Use the incumbent Nocturne reading world and full-height shared cover. Keep the hero to title,
headline, reading time, level and region. The body uses the shared 1040px wrapper, 75ch reading
measure and 64px section rhythm (48px on phones), without rules or repeated card containers.
Show the opening question and short answer first. Keep regional/time context, key terms, chapters,
case study, meaningful chronology, wider connections and nuance open. Only recall answers collapse.
Chapter photos use a stable 4:3 frame with contained images, a maximum height of 520px, enlargement
and subtle photo-credit controls. They sit directly with the relevant explanation and never crop out
scientific or architectural detail. The setting stacks below 480px. Main learning links lead to context,
explanation, case study and recall. References appear only at the bottom.

Review on 2026-10-31 used a stepwell fixture and real licensed Wikimedia photos, not a new model
response. The sample case uses UNESCO's Rani-ki-Vav description; this does not verify future lessons.
Desktop and 390px mobile captures are in `.impeccable/review/india-*`. The review checks reading
order, image loading, no horizontal overflow, enlargement, close control and reveal-answer behavior.
No paid image generation, production writes or deployment ran.

India's “See the story in photographs” section follows the case study, using the shared carousel
controls and contained image frame. It only shows attributed Unsplash scenes marked for the India
carousel; inline topic photos never enter it. Empty searches omit the section. Desktop/mobile review
uses two topic-matched, tracked Unsplash photos in a temporary fixture. Actual selected counts depend
on source availability and relevance filters; the 12-image figure is a maximum, not a guaranteed count.
