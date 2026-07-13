# ArcanaScreen — Forward Roadmap (proposal)

**Date:** 2026-07-14 · **Status:** proposal for product-owner review (has open decisions)
**Method:** two intensive design rounds between three personas — a **Dungeon Master**, a **product designer**, and a **UI/UX expert** — round 1 grounded in the seeds, round 2 explicitly generative (invent new features + better design). This doc is the synthesis, not a solo plan.

> The seed themes (roster/AC, official materials, icons, multi-system, more widgets, mini-wiki) were **examples**. The real output below is the *discovered* direction: one foundational architecture, five outcome horizons, four continuous design tracks, and four open bets that need your call.

---

## Decisions taken (2026-07-14, product owner)

1. **Prepare/Run → DELETE the mode boundary.** Target: one always-live surface with inline editing + a single lock toggle (open-quill ↔ closed-lock). The widget-marketplace grid and the Prepare/Run segmented control are retired. (Enables reactive Focus later.)
2. **Focuses → KEEP 4** (Narrative / Social / Exploration / Combat) — matches the validated model + mockups.
3. **Party surface → RESOLVED (2026-07-14): no duplication, contextual views of one Entity.** The party is not a second copy of data. In **Combat** the PCs are already in the Initiative Tracker → show **AC (and roster fields) inline on the PC rows**, no separate bar. In the **other three Focuses** (which have no tracker) a **compact collapsible party badge → overlay** surfaces AC / passives / HP. The roster is the single source that auto-populates the tracker; editing HP in either view edits the same Entity.
4. **Present mode → INCLUDE, LOW priority.** Ship as a local read-only presenter (2nd window); COL-01 relaxed to "present the current moment on this device," not a multiplayer/synced client.

### Real-state update — WebKit (2026-07-14)
Dockerization works (podman + official Playwright image `v1.61.1-noble`). **WebKit now *launches*** — it is no longer a host-dependency block. But **8 of 9 critical tests fail on WebKit** with `element(s) not found` / `toBeVisible failed`, a systematic boot/render failure — i.e. a **real cross-browser (Safari) bug, previously masked** because WebKit never ran on the Fedora host. → **New workstream: WebKit/Safari compatibility triage** (now unblocked; run e2e in the podman Playwright image). Non-WebKit browsers remain green (25 pass) after the WCAG fix.

---

## 0. Foundational architecture — build once, unlocks everything

Every persona converged here independently. **This is the single highest-leverage decision.**

### The unified Entity
A PC on the roster, a monster stat block, an NPC, a place, an item and a wiki note are **the same shape of object**. Model one `Entity`:

- `id`, `kind` (pc | npc | monster | place | item | note | faction…), `name`, `aliases[]`
- `summary` (one line), `fields` (kind- and **system-aware**), `links[]` (to other entities)
- **`reveal`** (`secret` | `known`) — first-class, not a note convention (DM r2). Powers read-aloud mode and spoiler-safe surfacing.
- **`origin`** (`mine` | `imported`) — see storage.

Designing this once de-risks roster, wiki, official materials, present-mode, the oracle, and future multi-system in a single stroke.

### Storage split by ORIGIN, not by type (DM r2 — load-bearing correction)
- **The DM's own entities** (roster, NPCs, notes, references) stay in the **portable JSON store** (Zustand persist). Reason: one-tap export must remain a *complete* backup — "you can always take your table with you" is the whole local-first promise.
- **Bulk imported content** (SRD packs, bestiaries) lives in **IndexedDB** (localStorage can't hold a bestiary; never in the JS bundle — budget is tight), with a client-side search index (MiniSearch/FlexSearch) built at import time. No backend.

---

## 1. Outcome horizons (sequenced)

### H-A — "Every screen knows who's at the table." (ships first)
The decided **party/table setup** + roster. Fields the DM actually uses (DM r1): name, AC, max/current HP, initiative mod, passive Perception/Insight, save-relevant stats, spell DC/attack, resistances/conditions, notes — a stat **card**, not a character sheet.
- Initiative auto-populates from the roster (no re-keying). AC drives a glanceable **party surface** (see open decision #3) so "does a 17 hit?" is answered at a glance. Social surfaces passive Insight/Perception. Instant per-round override (bump AC +5 for a Shield spell) is a trust requirement.
- Introduces the minimal shared-Entity object and a minimal Prepare↔Run shared surface (de-risks the mode question).
- **Exit:** party survives export/import + reload; initiative auto-fills; AC/passives glanceable in any Focus; one setup flow across screens. Naming: **"party/table setup"**, never "campaign database" (product-model guardrail).

### H-B — "The screen improvises *with* you."
The hardest live moment; incumbents ignore it.
- **Instant NPC minting** (DM r2): one tap mints a named entity from a tiny local name-table (name + trait + want + voice hint), drops into the scene *and* becomes a linkable Entity.
- **Contextual oracle** (product r2): one-tap generators (NPC, complication, yes-but/no-and, table) seeded from the roster + wiki entities, so results reference a PC's bond or the current scene. Offline, tiny remixable tables the DM edits.

### H-C — "The session remembers."
A state we ignore today; all three personas proposed a version.
- **Session tape** (product r2): append-only event log from the streams we already produce (captures, rolls, rounds, HP, note edits, timestamped) — not an editor, a log.
- **Session bookends** (DM + UI/UX): start-of-session "Previously on…" recap from starred captures; end-of-session one-line "what's unresolved?" wrap (wax-seal ritual). Non-blocking, skippable.
- **Session spine** (DM r2): 3–5 beats for the night; a quiet pacing rail shows beat position vs wall-clock ("95 min in, still on beat 1 of 4") so the DM can cut a dragging scene.
- **Read-aloud / secret layer** (DM r2): content tagged read-aloud vs DM-secret (via `reveal`); one-tap presenter shows boxed text large + clean.

### H-D — "Your reference is fast and linked."
- **Mini-wiki, link-driven** (all): `[[Entity Name]]` inline combobox in notes; a rendered link is a gold chip; hover/focus/long-press → peek card → "open" pins it into the context column without leaving the Focus. A **"Relevant now"** rail lists entities referenced in the active Focus's recent notes, ranked by recency (no scoring model). DM's own content first.
- **Official materials** (product r1): *import-your-own* packs through the same wiki surface, seeded with **SRD 5.1 (CC-BY-4.0)** only. Retrieval, not authoring; homebrew import > breadth (DM r1). Never scrape paid/WotC content.
- **Exit:** typing an entity name offers a link; opening retrieves the record in Run without losing place; a DM imports a pack, searches it, pulls a stat block into Run, offline.

### H-E — "Beyond one system." (usage-gated)
System-profile abstraction (sheet schema + dice conventions + field visibility), attempted only once **two** real systems exist. Design system-aware from H-A; do not build system #2 speculatively.

---

## 2. Continuous design tracks (slotted where a horizon needs them — not milestones)

- **Iconography:** one in-house SVG `<symbol>` sprite (12–16 category glyphs: beast/humanoid/undead/place/item/trap…) at Phosphor stroke weight via `<use>` — near-zero marginal cost per entity, budget-safe. (Replaces the keyword-guessed per-entity Phosphor glyphs.)
- **Motion identity — "ink-settle":** one ~140ms radial soften-to-sharp gold primitive reused wherever a state commits (die lands, HP changes, card pins); `prefers-reduced-motion` → instant + static outline pulse. A physical signature beyond Cinzel/gold.
- **In-world empty/error states:** one reused parchment SVG motif (torn corner + faint quill) so "nothing here yet" and "this failed" read as the same surface, not a bolted-on app.
- **Screen/Desk density:** a brand-owned toggle for arm's-length glancing under pressure, first-class (not buried in settings).
- **Flick-to-hand pinning:** drag/long-press any live element into a session-scoped transient dock slot (auto-clears on Focus switch); keyboard equivalent in each card's overflow. The one-gesture signature the dock lacks.

---

## 3. OPEN DECISIONS — need the product owner's call (big bets)

These emerged as genuine debates; I did **not** decide them unilaterally.

1. **Delete the Prepare/Run mode boundary?** Both product and UI/UX (r2) argue the Prepare↔Run split is the *root artifact* behind the "two different apps" problem. Proposal: one always-live surface with inline editing and a single **lock toggle** (open-quill ↔ closed-lock icon in the header) instead of a Prepare/Run segmented control — the lock covers the only real job Run does (prevent accidental edits). Resolve coherence by **deletion**, not reconciliation. → *Reconcile (softer) vs delete-the-mode (bolder)?*
2. **Collapse the four Focuses to two?** Product (r2): only Combat carries genuinely distinct tooling; Social/Exploration differ mainly in hierarchy. Ship one flexible Narrative surface with Social/Exploration as lightweight presets → kills a four-layout maintenance tax. **Contradicts** the current 4-Focus model and the four approved reference mockups. → *Keep 4, or collapse to 2 (+presets)?*
3. **Party surface: always-visible bar vs collapsible glance-badge?** DM wants a flagship always-visible party bar (AC/HP/init). UI/UX warns it's a chrome tax at 390px in Combat and proposes a collapsible glyph+count badge → ephemeral overlay (real button, `aria-expanded`, AA/keyboard). → *Suggested synthesis: collapsible badge by default, denser/expanded on wide viewports.*
4. **Present mode** (2nd-window read-only handout/initiative/countdown) brushes the **permanent non-goal COL-01** (player-facing views). Product frames it as "presenting the current moment on this device," not a synced multiplayer client. → *In scope as a local presenter, or hold the line on COL-01?*

Bonus (DM r2): make **Focus reactive** — the app infers Focus from actions (rolling initiative → Combat) with a one-tap manual override. Depends on decision #1/#2.

---

## 4. Guardrails (unchanged, enforced)
Local-first, no backend · WCAG **AA enforced by the Playwright axe suite** (unit tests do not catch contrast — see the 2026-07-14 regression) · asset budget (currently 560/110 KiB) · identity = a **live operational surface**, not a VTT or campaign database · permanent non-goals (player views, maps/tokens/fog, video/audio hosting, universal VTT sync) hold unless explicitly revised (see decision #4).

## 5. Loop plan
Decisions are taken (see top). Run the goal-loop per feature → build → **browser verification in the podman Playwright container (all browsers incl. WebKit) + axe** → unit/component tests → product-designer + DM judgment → commit+push to `dev` (no AI attribution). Reminder: `test:ci` runs unit only.

### Horizon A — build steps (loop-sized)
1. **Entity + party store.** Define the PC `Entity` (`id`, `kind:'pc'`, `name`, `ac`, `hp`/`maxHp`, `initMod`, `passivePerception`, `passiveInsight`, `saveNotes`, `reveal`, `origin:'mine'`) and a persisted party store (portable JSON, not IndexedDB). Unit tests: add/edit/remove PC.
2. **Backup integration.** Include the party in export/import with a schema-version bump + migration; round-trip test.
3. **Party/table setup UI.** Inline add/edit PC rows (light, sane defaults, tab-through); non-blocking entry nudge when a Focus needs the party and it's empty.
4. **Tracker integration (Combat).** AC inline on combatant rows; add-PC becomes a roster chip-picker (auto-fills name/AC/init, no re-keying); HP edits write the shared Entity.
5. **Non-combat party surface.** Collapsible badge → ephemeral overlay (real button, `aria-expanded`, AA/keyboard) in Narrative/Social/Exploration; Social shows passive Insight/Perception.
6. **Verify + judge each step** (container Playwright + axe + unit + designer/DM), commit+push.
