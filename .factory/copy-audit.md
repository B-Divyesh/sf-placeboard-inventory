# Public copy audit

Audited 2026-08-29. Counts treat hyphenated terms, URLs, and inline commands as one word. No audited line exceeds 22 words or uses a banned marketing word.

## Landing page

| Visible copy unit | Words | Result |
| --- | ---: | --- |
| Placeboard Inventory | 2 | Pass |
| Inventory | 1 | Pass |
| Demo | 1 | Pass |
| Privacy | 1 | Pass |
| Household inventory organized by place | 5 | Pass |
| Find household items by where you stored them | 8 | Pass |
| For households that share cupboards, bins, sheds, or homes and need one clear place to look. | 16 | Pass |
| Try it with sample data | 5 | Pass |
| Opens a stocked sample. | 4 | Pass |
| Your inventory is unchanged. | 4 | Pass |
| Start my inventory | 3 | Pass |
| Works offline after your first visit. | 6 | Pass: `offline-reload` |
| Inventory data stays on this device. | 6 | Pass: `local-data` |
| All inventory tools are free. | 5 | Pass: `free-core` |
| Household shelves linked by cyan, amber, and pink lights | 9 | Pass: image alt text |
| See every place | 3 | Pass |
| One item can sit in several places. | 7 | Pass: `multi-location-move` |
| Search shows every quantity and its full path. | 8 | Pass: `quick-search` |
| Search: AA batteries | 3 | Pass: preview label |
| Home / Hall cupboard | 3 | Pass: sample data |
| Home / Garage / Red tool bin | 5 | Pass: sample data |
| 8 AA batteries | 3 | Pass: sample data |
| 4 AA batteries | 3 | Pass: sample data |
| How to track an item | 6 | Pass |
| Build the same simple map you use when you tell someone where to look. | 14 | Pass |
| Name your places | 3 | Pass |
| Add a home, room, shelf, or bin. | 7 | Pass: `place-tree` |
| Nest bins and shelves inside rooms. | 6 | Pass: `place-tree` |
| Add items to places | 4 | Pass |
| Add a quantity to one place. | 6 | Pass: `multi-location-move` |
| Add the same item to another place later. | 8 | Pass: `multi-location-move` |
| Record each move | 3 | Pass |
| Choose the old place and new place. | 7 | Pass: `multi-location-move` |
| Placeboard updates both counts and keeps the history. | 8 | Pass: `multi-location-move` |
| Keep your inventory in this browser | 6 | Pass |
| Inventory data stays in this browser unless you export it. | 10 | Pass: `local-data` |
| Back up your inventory | 4 | Pass |
| Export JSON or CSV whenever you want a backup. | 9 | Pass: `json-export`, `csv-export` |
| Bring in an existing inventory | 5 | Pass |
| Import a Placeboard JSON or CSV file. | 7 | Pass: `file-import` |
| Find household items by place. | 6 | Pass |
| Original generated imagery · v1.1.1 · polish-3 | 5 | Pass: build label |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |

The headline names the job in eight words. The 16-word supporting sentence names the household situation. The primary action, result, and three facts fit at 390×844 and 1440×900.

## README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Find shared household items by place and record every move. | 10 | Pass: `multi-location-move` |
| Placeboard is for households that use cupboards, shelves, bins, sheds, cars, or multiple homes. | 14 | Pass |
| One item can have quantities in several places. | 8 | Pass: `multi-location-move` |
| A move updates both place counts and adds a dated history entry. | 12 | Pass: `multi-location-move` |
| Try sample data without changing your inventory | 7 | Pass |
| The demo includes seven places, five items, and three moves. | 10 | Pass: `sample-data` |
| It uses a separate browser database. | 6 | Pass: `demo-sandbox` |
| Leaving the demo deletes its changes and never changes the real inventory. | 11 | Pass: `demo-sandbox` |
| The sample is bundled with the app. | 7 | Pass: offline fixture |
| The demo works offline after the first visit. | 8 | Pass: `offline-reload` |
| What Placeboard Inventory does | 4 | Pass |
| Builds a nested place tree for homes, rooms, shelves, and bins. | 11 | Pass: `place-tree` |
| Keeps one item in several places with a quantity at each place. | 12 | Pass: `multi-location-move` |
| Records item quantities moving between places or in and out of the inventory. | 13 | Pass: `multi-location-move` |
| Lets you edit or archive items and places while keeping move history. | 12 | Pass: `record-correction` |
| Requires a destination before archiving an occupied place and offers undo. | 11 | Pass: `record-correction` |
| Searches item names, notes, and full place paths. | 8 | Pass: `quick-search` |
| Keeps dated move history. | 4 | Pass: `multi-location-move` |
| Prints all place labels or one chosen label. | 8 | Pass: `print-labels` |
| Exports full data and move history as JSON. | 8 | Pass: `json-export` |
| Exports current quantities and place paths as CSV. | 8 | Pass: `csv-export` |
| Imports Placeboard JSON and CSV files. | 6 | Pass: `file-import` |
| Stores inventory in this browser. | 5 | Pass: `local-data` |
| All inventory tools are free. | 5 | Pass: `free-core` |
| Inventory data stays in this browser unless you export it. | 10 | Pass: `local-data` |
| Requirements: Node.js 22 and npm. | 5 | Pass: maintainer instruction |
| Inventory use makes no third-party request. | 6 | Pass: `local-data` |
| Data stays in local browser storage unless you export it. | 10 | Pass: `local-data` |
| Deploy the contents of `dist/` as a static site. | 9 | Pass: maintainer instruction |
| The factory owns DNS and infrastructure. | 6 | Pass: repository responsibility |

## Catalog description

“Find shared household items by room, shelf, or bin and record every move.” starts with a verb and is 73 characters.

## Terminology

| Concept | One word used |
| --- | --- |
| A physical room, shelf, bin, car, or home | place |
| A tracked object or supply | item |
| A count change between places | move |
| Count of an item at a place | quantity |
| Safe try-out using sample data | demo |
| Downloaded copy of inventory data | export |
