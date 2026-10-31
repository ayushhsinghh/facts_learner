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

- India lessons explore one specific India-related topic in an accessible 7–10 minute read. They use a question, opening story, central answer, regional/time context, three to six connected chapters, a real case study, optional chronology, wider connections, nuance and recall. They do not repeat the country portrait or list unrelated facts. New articles generate exactly two illustrations (cover and overview/card); two to six requested supporting documentary photos use existing Unsplash and Wikimedia providers. Photo requests bind to specific sections. Named people and places use exact-subject lookup; generic stock portraits cannot represent named people. Photo failures retain readable text. References stay at the bottom, narration and image enlargement use shared controls, and older India articles retain the generic reader.
- India lessons also have an Unsplash-first topic-photo carousel with Wikimedia fallback after the case study. New responses provide three to six concise `carousel_queries`; older structured responses derive searches from non-person photo requests. Up to six searches select up to two photos each (12 maximum), with source/description deduplication, India/topic metadata checks and selection tracking. Inline documentary photos remain separate. The carousel uses the existing swipe, keyboard, enlargement and credit controls without autoplay. It never adds AI-generation slots.

Country carousel ranking (current): profiles with `country_media.photo_ranking_version: 1` share India's text-only gpt-6-luna pipeline. Up to twelve country-specific searches collect candidate metadata. Successful rankings reveal 10–18 complementary photos together, replacing the legacy 24-photo plan. Five retries after the initial failed chat request precede the legacy Unsplash/Commons fallback, which may return fewer photos. Selection runs after article delivery without a ranking cache. Pending and insufficient states keep the article readable. Version-4 photo-only enrichment upgrades saved country profiles without regenerating article text or AI images. Wikimedia subject figures and the four-image GenAI limit stay unchanged.

India carousel repair: match the subject as well as geography. Try a shorter subject query and use
licensed Wikimedia fallback for sparse Unsplash topics. A Meghalaya river cannot qualify for a root-bridge
query merely through its location. The frontend also filters unsuitable older results; image retry
rechecks saved carousel assets without regenerating existing cover/overview illustrations.
- India photo search also tries bounded keyword combinations, such as “Meghalaya bridge” and “root bridge.” It reuses shared search results within a lesson. Returned Unsplash tags, alternative descriptions and country metadata are retained for relevance checks; regional terms alone cannot qualify a photo. A missing tag list is not treated as evidence. Provider coverage still determines whether Unsplash or Wikimedia supplies the carousel.

Unsplash selection now sorts each returned search page by likes and retrieves full metadata by
photo ID. Reject failed details or unsuitable tags and try the next most-liked candidate, keeping
at most three matches per search. Detail responses are cached in memory for ten minutes. New India
carousel plans have up to 18 slots (three per topic); earlier 12-slot plans remain compatible.
Standalone region searches are supported and still require subject evidence in full metadata.
No extra AI images are generated.
- India carousel searches keep three tag matches when available. If a search yields fewer than three matches, use that search's three most-liked valid, detail-fetched photos instead. This is the whole popular top-three set, not a mixture padded around fewer tag matches. Keep multiple topic searches, exact photo/source deduplication and truthful original captions. Popular fallbacks may show broader related scenes and remain visible despite a tag mismatch. AI generation remains two images.
- New India lessons finalize carousel photos after the article is saved and the article job is marked completed. A separate background step requests 30 Unsplash summaries per search, deduplicates candidate pools, and sends only IDs, descriptions and alt descriptions to gpt-6-luna. It retries five times after the initial failed chat request, then uses the existing tag/popularity/Commons selection flow. Successful text rankings publish 10–18 photos; insufficient relevant metadata reports an empty/insufficient photo state rather than padding. No application ranking cache is used. Progress and selected assets persist with the article. Job links and archived links poll image progress independently of article delivery, for up to 12 minutes. The cover/overview image budget remains two.
