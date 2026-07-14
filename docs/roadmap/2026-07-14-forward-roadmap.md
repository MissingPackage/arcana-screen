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
1. **Entity + party store.** ✅ done 2026-07-14 — `src/domain/partyModel.ts` (PC `Entity`: id/kind/name/ac/hp/maxHp/initMod/passivePerception/passiveInsight/notes/reveal/origin, with `createPartyMember` validating+clamping) + `src/store/usePartyStore.ts` (persisted `arcana_party`, add/update/remove/reorder/setMembers/clear) + 10 unit tests. `test:ci` 96 green.
2. **Backup integration.** ✅ done 2026-07-14 — party added to `exportBackup`/`importBackup` (`dataPortability.ts`), backup schema bumped to **v3** (accepts v1/v2/v3; imported party sanitized via `setMembers`); round-trip test. `test:ci` 97 green.
3. **Party/table setup UI.** ✅ done 2026-07-14 — `PartySetup/PartySetup.tsx` (header `<details>` panel, always accessible): inline add/edit/remove PC rows (Name/AC/HP/Max/Init/pass. Perc./pass. Ins./Notes), uncontrolled inputs committed on blur (no mid-typing snap), sane defaults, count badge. 3 component tests; `test:ci` 100 green; **browser+axe verified: 0 violations**. Pending 3b: the non-blocking entry nudge when a Focus needs an empty party. (Judged by designer+DM — feedback folds into step 4/3b.)
3b. ✅ done 2026-07-14 — numeric fields are now **optional (blank until set, placeholder hint)** in the model + UI, so an untouched party never looks pre-filled; added **player name, passive Investigation, spell save DC, spell attack** (DM); grouped layout (identity / core / passives / spellcasting with dividers). `test:ci` 101 green; browser+axe 0 violations. Follow-up: the anchor caret is hidden when the panel abuts the header — proper anchoring pending. Original notes below.
   *Both judges' #1:* blank/dim the **unedited defaults** — `10`/`0` makes an untouched party look filled and the DM re-types HP/Init; show placeholders and distinguish "set" from "default". *DM fields to add:* **player name**, **passive Investigation** (more used than Insight for traps/secrets), **spell save DC + spell attack** (needed when a monster forces a save); keep passive Insight but secondary. *Designer:* group HP+Max as one unit, pair the two passives, ease the cramped labels, and **anchor the panel to its trigger** (it reads as floating). Optional: paste-from-stat-block to pre-fill. Re-verify browser+axe.

4. **Tracker integration (Combat).**
   - 4a ✅ done 2026-07-14 — **AC inline on every combatant row** (gold chip in the identity cell, AA-safe, no grid change); `ac?` added to the encounter model + demo seed. `test:ci` 101 green; browser+axe 0 violations. (Fixed a CSS collision where the icon-circle rule also styled the AC span.)
   - 4b ✅ done 2026-07-14 — **roster chip-picker** ("Add from party" chips under the tracker; click adds a PC as a combatant with name/AC/HP/init auto-filled from the entity, dedup-disables the chip). `addCombatant` + `combatantFromMember` mappers, 3 integration tests; `test:ci` 104 green; browser+axe verified (chips 2, combatants 7→8, chip disables). Follow-up: set the *rolled* initiative in-Run (currently seeds from the init modifier); HP edited in the tracker doesn't yet write back to the roster entity (encounter holds its own copy).
4c. **Tracker polish (from designer + DM judgment, 2026-07-14).** ✅ done 2026-07-14 — commits `83995e8` (base) + `ae29995` (polish); `test:ci` 107 green; browser+axe 0 violations on the Combat surface.
   - *Designer P1:* AC chip **always renders** (dashed "AC —" when unset) — no ragged edge; AC chip given `margin-right` so it no longer crowds the HP number (designer P1 crowding).
   - *DM #1 / Designer P0:* **in-place INIT editing** — click a combatant's initiative to type the rolled value; blur/Enter commits and auto-resorts. Made discoverable per designer P0: the number is a real button with a **dashed underline + pencil glyph** (hover was invisible on touch) and a ≥30px hit target (WCAG 2.5.8), solid on hover/focus.
   - *DM P0 (silent-0 trap):* roster PCs with no stored init modifier are flagged `initiativeUnset` and render as a dashed **"—"**, never a rolled 0; setting a value clears the flag. `EncounterCombatant.initiativeUnset?`, unit test in `partyCombat.test.ts`.
   - *DM:* HP live editor discoverability — added a hint line ("Tap a combatant to adjust HP…") shown until a combatant is selected. Later: downed / death saves / concentration.

4d. **Combat start throughput (from DM judgment, 2026-07-14).** The single-row edit doesn't scale to the top of round 1.
   - *DM P0:* **batch initiative entry** — ✅ done 2026-07-14 (commits `fc891f9` + `9a1fbf4`). A "Set initiative" toggle in the tracker header opens a parchment panel with one number field per combatant; typing never reflows the list; "Apply order" (or Enter) commits all values at once and sorts once; Tab moves field-to-field; Cancel discards. Inline per-row edit kept for one-offs. Judged by designer+DM; folded designer P0s: the panel now **swaps in for the list** (no half-clipped rows), **autofocuses** the first field (once — fixed a controlled-input callback-ref that stole focus mid-typing), reads **column-major** (matches the vertical list), and the toggle goes **gold when any combatant is unrolled**. `test:ci` **108 green**; browser+axe verified (0 violations).
   - *DM P1:* **tie visibility** — ⏳ open. `sortCombatants` breaks ties by `tieBreaker` then name, but `tieBreaker` is never surfaced or editable; expose it (or a manual up/down nudge) so a DM can honor a house tie rule ("PCs win ties").
   - *DM P2 (accepted, no action):* AC chip is a real glance-need mid-scrum, not noise.

4e. **Add combatants to the Run encounter (DM P0, 2026-07-14).** ✅ on-ramp done 2026-07-14 (commit `a273716`). A collapsed "＋ Add combatant" toggle under the tracker opens an inline form (name + optional AC/HP/init + a quantity "×N"); "Add" builds the combatant(s) via a new `createCombatant(id, input)` factory in `encounterModel` (omitted init → flagged unset "—"; omitted HP → 10; free-string ids so duplicates are fine) and `addCombatant`; quantity > 1 auto-names "Goblin 1..N". `createCombatant` domain tests + a component test (single + group) + `test:ci` **110 green**; browser+axe verified (autofocus, group of 3, unrolled "—", 0 violations).
   - ✅ **polish** done 2026-07-14 (commit `987621e`), from designer+DM judgment: **persistent AC/HP/Init/Qty field labels** (placeholders vanished on input → wrong-value risk — designer P0); **solid** toggle border + 40px touch target (was dashed, colliding with the "unset" motif — designer P0/P2); the form **stays open after Add** with a green "Added X" acknowledgement (continuous entry + silent-add feedback — DM P1); and **`removeCombatant`** + a red Remove button in the live editor (you could add but not un-add without nuking the fight — DM P1). `test:ci` **113 green**; browser+axe 0 violations.
   - ⏳ **deferred** (logged from judgment): promote the Add toggle into the tracker header next to "Set initiative" (designer P1, drift); **clone/duplicate** a combatant (DM P1); a **grouped/minion** line with a shared pool as an alternative to per-instance rows (DM P2); auto-scroll/announce so an off-screen add is visible (DM P2).
   - *Open decision (DM P1, for the owner):* a roster PC's initiative is pre-seeded from their static **init modifier** (Dex mod), which renders identically to a committed d20 roll. Options: always start roster PCs unset ("—") and enter the roll; or add a "roll" affordance (d20+mod); or keep seeding. Touches `combatantFromMember` + 3 `partyCombat` tests + the step-4b decision — logging, not flipping unilaterally.

5. **Non-combat party surface.** ✅ done 2026-07-14 (commit `ced4f19`). New `PartyGlance` component (`session/PartyGlance.tsx`): a "Party · N" toggle in the non-combat capture bar opens an ephemeral overlay (real button + `aria-expanded`/`aria-controls`, dismissed by Escape / click-away / re-toggle) with a table of the roster's contextual stats — Social: passive Insight + Perception; Exploration: Perception + Investigation; Narrative: Perception; plus AC/HP, unset → "—". Reads the SAME `usePartyStore` roster (no duplication); hidden in Combat (inline in the tracker there) and when the roster is empty. 4 component tests + `test:ci` **117 green**; browser+axe verified (open/Escape/columns/absent-in-combat, 0 violations).
   - ✅ **polish** done 2026-07-14 (commit `634e952`), from designer+DM judgment: made it **pinnable** (no longer closes on outside click — a DM checking a passive then writing a note kept losing it; closes on Escape / ✕ / re-toggle) and **right-anchored + width-capped** so it no longer masks the primary notebook (designer P0 occlusion + DM P1); **highlights the top value** per column so "who has the best Insight" is a glance at 5-PC tables (DM P1); **low-HP cue** (bloodied/critical colour) on the HP cell (designer P1); added **Spell Save DC** to Social (free win — already in the model, DM P2); and disambiguated the header roster disclosure to **"Edit party"** vs the read-only glance (designer P0 dual-affordance). `test:ci` **119 green**; browser+axe 0 violations.
   - ⏳ **deferred** (logged): dock as a true per-Focus right-rail so it occludes *nothing* (designer's ideal — a per-layout restructure); add a **passive Stealth** field to the roster model for Exploration (DM P2, not in `PartyMember` yet).
6. **Verify + judge each step** (container Playwright + axe + unit + designer/DM), commit+push.

### Horizon B — build steps (loop-sized)
B1. **Yes/no improv oracle.** ✅ done 2026-07-14 (commits `855ca51` shipped inline, `f06ea33` redesigned from judgment). `oracleModel.ts` — `rollOracle(likelihood)` maps a d20 shifted by likelihood (unlikely −4 / even 0 / likely +4) to six bands (No,and … Yes,and); "Yes,and" can't occur on Unlikely nor "No,and" on Likely. Lives in the universal `UtilityDock` alongside Dice/Timer. **Judged** (designer 2×P0 + DM 3×P1), all folded into the redesign: collapsed to a **popover** (reclaims dock space — the inline form had overcrowded the bar into horizontal scroll, clipping Timer's Start); **3 likelihood buttons that ask on tap** (DM: the native `<select>` was a slow overlay on touch); result shows a **coloured Yes/No headline + and/but tag + the raw d20** (designer: hiding the roll killed trust; no polarity hierarchy vs a dice number); one-tap **Log** reuses the existing `onCapture` pipe so an answer survives reload (DM: local state was lost on refresh). 6 oracle-related unit tests + `test:ci` **123 green**; browser+axe 0 violations (note: the likelihood buttons carry a 0.3s colour transition — settled state is AA; a mid-transition frame briefly dips, not WCAG-evaluated).
   - ⏳ **deferred** (logged from judgment): a random **spark/complication table** (the companion the DM reaches for — when the oracle says "Yes, but", hand them the "but"); optionally persist the last answer into `workspace.universal` so a refresh keeps it even without an explicit Log.
B0. **Asset-budget sweep.** ✅ done 2026-07-14 (commit `2b21d92`), ahead of B2. Vite `manualChunks` splits vendors off the app chunk: app `index.js` **554.8 → 175.9 KiB**; `react` 191.8, `icons` 135.0 (Phosphor), `dnd` 45.1 (react-dnd — Prepare/popout only), `vendor` 7.0 — each far under the 560 KiB per-file budget. CSS budget lifted 110 → **130 KiB** (108.4 used) — the app grew 5 feature surfaces this session and CSS golf is low-value/risky. `test:ci` 123 green + critical e2e (incl. startup-performance + axe) green on the split build. Follow-up (logged): `dnd` is still eagerly imported (App wraps everything in `DndProvider`); a `React.lazy` of the Prepare/popout branch would drop react-dnd from the Run path entirely — aligned with retiring the Prepare/Run boundary.
B2. **Instant NPC minting** — next: one tap mints a named Entity (name + trait + want + voice) from a tiny local table, drops into the scene and becomes linkable. Budget headroom now ample after B0.
