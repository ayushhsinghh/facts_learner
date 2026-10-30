# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite. Deployment target is not yet confirmed.

## Users

General curious learners who want to discover an interesting fact without creating an account or managing a personal learning history. They may also revisit the shared index of facts generated previously.

Assume no subject expertise. Each new article teaches one fact or useful idea through an easy-to-medium topic, simple language, short explanations and a familiar example. Define necessary terms at first use. Optional detail clarifies the same idea; it does not introduce advanced coursework. Keep scientific evidence and limits accurate and understandable.

## Product Purpose

Let a visitor choose a category and receive a rich, generated fact that rewards curiosity. Success means the selection feels immediate and intriguing while the asynchronous generation period remains understandable and engaging.

## Positioning

The product turns a single category choice into an encyclopedic learning object with context, mechanisms, timelines, misconceptions, takeaways, and India-specific relevance when available.

## Operating Context

Visitors arrive anonymously, choose from API-provided categories, wait while a fact is generated in the background, and read the completed fact in the same experience.

## Capabilities and Constraints

- Fetch allowed categories from `GET https://api.ayush.ltd/api/facts/categories`.
- Start generation with `POST https://api.ayush.ltd/api/facts/generate?category=<id>`.
- Poll `GET https://api.ayush.ltd/api/facts/status/<job_id>` every 3–5 seconds until the job completes or fails.
- Fact generation normally takes 35–50 seconds.
- Generation is limited to 10 requests per day per IP; category listing is limited to 30 requests per minute.
- Category identifiers are at most 50 characters and use alphanumeric characters plus underscores.
- Jobs expire after 24 hours.
- No accounts and no user-specific saved learning history; previously generated public facts remain browsable.
- New articles request 3–5 purposeful images: a cover, an article overview, a mechanism image, and up to two further explanations. Myth articles retain the myth/truth pair within a 4–5 image plan.
- Keep stored facts readable without image backfills. Image metadata supplies alt text, captions, learning purpose, and placement; figures support accessible enlargement.
- Indian Laws lessons teach one beginner concept outside the Constitution through a familiar situation, a plain rule, visible applicability and limits, and a hypothetical example. Acts and codes provide primary authority; commentary provides context. Article-supplied legal status is unverified: the backend does not retrieve sources or independently check legal currency. Existing facts retain the generic reader when they lack the structured lesson contract.
- Country profiles permit an accessible 8–15 minute portrait as an exception to the single-idea article rule. They introduce the country once, show learning goals and core essentials, then connect map location, everyday life, history, contributions, products, places, people and further questions. Local names, time zones and flag explanations stay open; snapshot caveats and city descriptions are expandable; the central idea returns in the recap. Country covers show reading time, level and region, with secondary article labels available near the end. The locator defaults to a fitted regional view with country/nearby-country labels and neighbour/water context; World remains available. New country profiles use at most four GenAI illustrations: required cover and overview, plus up to two optional explanations. New `country_media.photo_layout: contextual_v2` profiles separate photo sources: an Unsplash-first scene carousel with topic-filtered Wikimedia fallback and Wikimedia Commons subject figures with each notable person, notable place, everyday-life topic, contribution, product and optional city. Twelve scene topics target ten or more photographs, with up to two per topic (24 total). Country-specific destinations supplement landscapes, streets, markets, architecture, coast, wildlife, food, boats, history and festivals. Unsplash is preferred; Wikimedia fills matching gaps. Selection deduplicates source and description. New core topics require complete explanations, supporting details, concrete examples and focused `photo_subject`/`photo_queries`. Subject figures keep native proportions, credits and enlargement; they stack after their text on mobile. Missing or broken subject images leave the text readable. They also use an accurate Flagpedia flag and a Natural Earth map. There is no ten-visual cap. Media lifecycle state tracks subject slots. Archived country profiles can receive a cached photo-only upgrade without regenerating text. Legacy country retries remain photo-only without automatic paid backfill. Covers and archive cards try the requested image, another available image, a licensed gallery photo, then bundled Natural Earth world-map artwork. Broken URLs advance this fallback chain. Generated illustrations are labelled as illustrations, not documentary photographs. Photograph credits follow the displayed asset through a subtle info button in the carousel, enlargement, covers and cards. Hover previews credits on desktop; tapping or keyboard activation opens them, with source and licence links. The icon has a 44px hit area. Generated illustrations keep a small AI label. Snapshot provenance and dated population remain visible, while narrative sources appear at the bottom. Photo metadata and source links do not establish independent factual or exact-subject verification. Stored country facts without the structured profile contract retain the generic reader.

## Brand Commitments

The experience should feel clean, beautiful, and mysterious while remaining suitable for general curious learners. Category choice and the reveal action are centered in the opening screen; searching is a distinctive atmospheric interlude, and the completed fact replaces that moment with a focused reading experience.

## Evidence on Hand

API contract: `/Users/ayushsingh/Documents/api_documentation.md`. No testimonials, usage claims, customer logos, or existing brand assets were provided; future work must not fabricate them.

## Product Principles

- Make curiosity the primary interaction, not configuration.
- Turn generation time into anticipation with honest progress communication.
- Reveal depth progressively so a fact is inviting before it becomes encyclopedic.
- Keep the entire experience useful without identity, accounts, or personal history.
- Preserve clarity and accessibility inside the mysterious atmosphere.
