# Placeboard Inventory visual thesis

## Direction: night-market neon signage

Placeboard treats a house like a small night market after closing: every shelf is a stall, every bin has a bright sign, and the path to an item is readable at a glance. This is not a generic black dashboard. Warm near-black timber, paper label stock, thin tube-light borders, and condensed sign lettering make the interface feel physical and memorable. Decoration always helps answer “where is it?”

## Tokens

- `--ink: #f8f2dc` — primary text and label paper.
- `--muted: #c6c0a9` — secondary text; 7.4:1 on the background.
- `--night: #100f18` — page background, explicitly single-mode.
- `--stall: #1b1925` and `--stall-raised: #252232` — surfaces.
- `--cyan: #4de7dc` / `--cyan-ink: #061e1d` — place and primary-action signal.
- `--amber: #ffc857` / `--amber-ink: #271800` — quantities and warnings.
- `--pink: #ff6f91` — transfer signal.
- `--green: #76e39d` and `--danger: #ff8b7b` — named success and error states. Color never carries state without text or a shape.

All text and interactive outlines meet WCAG AA against their specified surfaces. The single dark treatment is intentional: the direction depends on pools of sign light against a night backdrop.

## Type

- Display: `Arial Narrow`, `Roboto Condensed`, `Impact`, sans-serif. Uppercase with restrained tracking, used like hand-cut market signs.
- Body: `Inter`, `Avenir Next`, `Segoe UI`, system sans-serif. It stays familiar and fast; no runtime font files or CDN requests.
- Quantities use tabular numerals. The scale is 14, 16, 20, 28, and clamp(40–72) px.

## Spacing, shape, and layout

An 8 px base rhythm drives spacing. Controls are at least 44 px. Content caps at 1180 px and reading copy at 68 characters. Signs use clipped corners, 2 px borders, small offset shadows, and label tabs. The place tree resembles stacked stall signs connected by a vertical rail. On phones, the workbench becomes one column and secondary actions collapse into scrolling tool rows.

## Interaction grammar

- Cyan means “choose or create a place.” Amber marks item quantities. Pink is reserved for a move between places.
- Pressed controls shift 2 px toward their hard shadow.
- Search results arrive as hanging signs. Expanding a place reveals its children from the parent rail.
- Feedback names both the action and the object: “Moved 2 batteries to Hall cupboard.” Destructive actions confirm the exact target.

## Motion policy

One signature motion: when an item moves, a small arrow ticket travels horizontally into the saved-move notice over 240 ms, then settles. Other transitions use opacity or 2–4 px transforms for 150–220 ms. Nothing loops. Under `prefers-reduced-motion: reduce`, travel and transforms are removed and state changes are immediate.

## Asset plan and provenance

- Hero: an original wide editorial still life of translucent labelled-style storage bins and household objects arranged like a neon night-market stall. It clarifies the mental model without pretending to be a screenshot.
- Social card: composed locally from the same generated art, cropped to 1200×630 with product copy added in HTML/SVG tooling outside the generated pixels.
- Icons and logo: hand-authored SVG line work; no icon library.
- Generated art prompt sheet: “Wide editorial still life for a household inventory app. A dark, tidy home storage wall arranged like a late-night market stall: wooden cubbies, translucent bins, a hand drill, batteries, pantry jars, camping lantern, and folded linens. Thin cyan, amber and coral neon tubes trace routes between shelves. Rich near-black plum background, warm paper tags with no legible writing, subtle film grain, practical objects, cinematic side light, deep shadows, straight-on three-quarter view, generous clear dark area at left, no people, no brands, no logos, no readable text, no watermark, no interface screenshot.”
- Generator: Azure AI Foundry factory image deployment via `/opt/fleet/lib/gen-image.sh`; generation date 2026-08-28. Generated assets are original to this product. Candidate sources and prompt sidecars live in `assets/src/`; optimized WebP ships in `public/assets/`.

## Accessibility and performance

The page paints its background before assets load. The hero reserves its dimensions and stays below 300 KB as WebP. Focus uses a 3 px amber ring with a 3 px offset. Every color badge includes text. The app uses semantic lists, native controls, and one `<h1>` per route.
