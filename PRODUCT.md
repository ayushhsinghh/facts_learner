# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite. Deployment target is not yet confirmed.

## Users

General curious learners who want to discover an interesting fact without creating an account or managing a learning history.

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
- No accounts and no saved learning history.

## Brand Commitments

The experience should feel clean, beautiful, and mysterious while remaining suitable for general curious learners. Category choice and the reveal action are centered in the opening screen; searching is a distinctive atmospheric interlude, and the completed fact replaces that moment with a focused reading experience.

## Evidence on Hand

API contract: `/Users/ayushsingh/Documents/api_documentation.md`. No testimonials, usage claims, customer logos, or existing brand assets were provided; future work must not fabricate them.

## Product Principles

- Make curiosity the primary interaction, not configuration.
- Turn generation time into anticipation with honest progress communication.
- Reveal depth progressively so a fact is inviting before it becomes encyclopedic.
- Keep the entire experience useful without identity, accounts, or history.
- Preserve clarity and accessibility inside the mysterious atmosphere.
