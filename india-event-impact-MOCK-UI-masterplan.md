# India Event-Impact Tool — Mock Web App Master Plan (Prototype v0)

**Last updated:** Oct 22, 2026
**Status:** Planning — nothing built yet
**Companion to:** `india-event-impact-masterplan.md` (the full product plan). This file covers **only the clickable mock display**: no backend, no real LLM, no real data. Everything on screen is pre-written sample content that behaves as if the real tool were running.

---

## 0. How to use this document (read first, every session)

1. When you switch AI tools, paste **this entire file** into the new AI (and the full product master plan too, if the AI needs the bigger picture).
2. Paste the current **Progress Tracker** (Section 21) and **Decisions Log** (Section 22).
3. Say: *"Continue from the first unchecked task. Follow the Golden Rules and the Design System. Do not change decisions in the log without asking me."*
4. After each session: tick tasks, add notes, log decisions.

**Task ID format:** `M<phase>-T<number>` (example: `M3-T2`). The `M` prefix keeps these separate from the full product's `P` tasks.

**Golden rules for any AI working on the mock:**
- **No backend.** No servers, no databases, no real API or LLM calls. All data comes from local mock files bundled with the app.
- **Everything free** (Section 5).
- **Mock data must look real but be clearly labelled as demo data** (a persistent "DEMO — sample data, not real analysis" banner). Never present invented numbers as genuine market analysis.
- **Mock data must follow the same JSON shapes** as the real product's schemas (Section 11), so the real backend can replace the mock later by changing one file.
- **Simulate behaviour, not just screens:** loading steps, progress, key rotation events, errors, empty states, and "resume later" must all be demonstrable.
- Mobile-friendly and accessible from day one.

---

## 1. Purpose of the Mock

The full tool (event → market report; company + event → impact and action plan) takes weeks to build. Before investing that effort, the mock lets you and your approver **see and click through the experience**:

- Validate that the idea makes sense visually and is understandable.
- Collect feedback on layout, report structure, wording, and flow.
- Decide what to cut, add, or reorder **before** writing the engine.
- Use as a demo for the approval email / pitch.
- Serve as the **UI blueprint** that the real frontend is built from.

### What the mock is
A static web app (HTML/CSS/JS or React) that you can open in a browser or host free on the web, where every button works and every screen is filled with realistic sample content.

### What the mock is not
Not connected to OpenRouter, not fetching real prices or news, not producing real analysis. Typing a new event does **not** generate new intelligence — it maps to the closest pre-written sample scenario (Section 12) and plays a simulated run.

---

## 2. How the Mock Relates to the Real Product

| Real product part | In the mock |
|---|---|
| OpenRouter gateway + key rotation | A **visual simulation**: a key-status panel and animated events ("Key 1 rate-limited → switched to Key 2") |
| Data layer (prices, news, fundamentals) | Pre-baked JSON files for ~50 Nifty companies and a few macro numbers |
| Exposure knowledge base | Browsable read-only pages with sample profiles |
| Mode A engine | A simulated 10-step pipeline that ends in a pre-written report |
| Mode B engine | Same, for company + event |
| Report generator | HTML report pages rendered from mock JSON, with a "Print / Save as PDF" button |
| Tutorial | A Help page + a short `MOCK-GUIDE.md` |

**Design rule:** one file (`src/api/mockApi.ts` or `mockApi.js`) is the only place that "fetches" data. Later, swapping it for real calls turns the mock into the real frontend.

---

## 3. Scope

### In scope
- All main screens (Section 6) with full navigation.
- Mode A flow: input → parsed-event confirmation → simulated run → report.
- Mode B flow: company pick + event → confirmation → simulated run → report with Defend/Capitalize plan.
- Reports history (with a few pre-saved reports).
- Settings/Keys status page (mock key pool with simulated rotation).
- Data status page (mock freshness/coverage).
- Knowledge Base browser (sector matrix, company exposure profiles — sample).
- Help/Tutorial page and disclaimer.
- Light/dark theme, responsive layout, print-friendly report CSS.
- 3 fully written Mode A scenarios and 4 fully written Mode B scenarios (Section 12).

### Out of scope
Real analysis, authentication/login, saving user data to a server, real charts of real prices, real news, payments, any backend.

---

## 4. Principles for the Mock
1. **Feels real:** realistic Indian companies, sensible numbers, believable reasoning text.
2. **Shows the hard parts:** progress steps, uncertainty, confidence, "uncertain" lists, key rotation, errors.
3. **Fast to change:** all copy and numbers live in JSON so you can edit content without touching code.
4. **Consistent visual language:** the five impact buckets always use the same colours and icons everywhere.
5. **Honest:** demo banner, sample-data labels, disclaimer on every report.
6. **Report-first:** the report page is the star; spend the most design effort there.
7. **Zero cost, zero setup for viewers:** opens from a link or a single file.

---

## 5. Free-Only Tech Stack

| Need | Choice | Why |
|---|---|---|
| Framework | **React + Vite** (static build) | Fast, huge ecosystem, free |
| Alt (simplest) | Single-file HTML + vanilla JS (or Alpine.js) | Can be opened by double-click or pasted anywhere; good for quick sharing |
| Styling | **Tailwind CSS** (+ CSS variables for theme) | Fast, consistent |
| Components | Hand-built + optional **shadcn/ui** (copy-paste, free) | Clean accessible base |
| Icons | **lucide-react** | Free |
| Charts | **Recharts** (React) or Chart.js | Free, enough for heatmaps/bars/lines/radar |
| Animations | **Framer Motion** or CSS transitions | Free |
| Routing | **React Router** (hash routing for static hosting) | Works on GitHub Pages |
| State | React Context + `useReducer` (no Redux needed) | Small app |
| Persistence (mock only) | `localStorage` for theme, "saved reports" in the mock | Free, browser-only |
| Fonts | Google Fonts (e.g., Inter + a serif for report headings) | Free |
| Testing | Vitest + React Testing Library, Playwright optional | Free |
| Hosting | **GitHub Pages**, Netlify free tier, Cloudflare Pages, or Vercel hobby | Free |
| PDF | Browser "Print → Save as PDF" with print stylesheet | Free, no library |

**Decision default:** React + Vite + Tailwind + Recharts + lucide, hash routing, hosted on GitHub Pages. (Alternative single-file HTML is documented as Phase M9 "shareable build".)

---

## 6. Information Architecture and Screens

### 6.1 Sitemap
```
/ (Home)
├─ /market                 Mode A: enter event
│   ├─ /market/confirm     Review parsed event
│   ├─ /market/run         Simulated pipeline progress
│   └─ /market/report/:id  Mode A report
├─ /company                Mode B: pick company + event
│   ├─ /company/confirm    Review parsed event + company snapshot
│   ├─ /company/run        Simulated pipeline progress
│   └─ /company/report/:id Mode B report
├─ /reports                Report history (search, filter)
├─ /knowledge
│   ├─ /knowledge/sectors  Sector sensitivity matrix
│   └─ /knowledge/companies  Company exposure profiles (+ /:symbol)
├─ /settings               Keys status, depth mode, theme, demo controls
├─ /data-status            Data freshness and coverage
├─ /help                   Tutorial + FAQ + glossary + disclaimer
└─ *                       404
```

### 6.2 Global layout
- **Top bar:** logo/name, mode shortcuts (Market Impact, Company Impact), Reports, Knowledge, Help, theme toggle, key-health pill (e.g., "Keys 3/3 healthy").
- **Demo banner** (sticky, dismissible per session but reappears on reports): "DEMO — all content is sample data, not real analysis."
- **Macro ticker strip** under the top bar: Nifty, Sensex, VIX, USD/INR, Brent, Gold, US 10Y, repo rate (mock values, small sparkline, up/down colour).
- **Footer:** disclaimer, version, links to Help.
- **Mobile:** bottom tab bar (Home, Market, Company, Reports, More).

### 6.3 Screen-by-screen specs

#### S1 — Home / Dashboard
- Hero: one-line value proposition + two big cards: **Market Impact** ("What does this event do to India?") and **Company Impact + Plan** ("What does it do to my company — and what should it do?").
- "Try a sample" chips: e.g., *Crude oil spikes to $110*, *US raises tariffs on Indian goods*, *RBI cuts repo rate by 25 bps* (one click pre-fills Mode A).
- Recent reports (3 cards from mock history).
- "How it works" 4-step strip (Event → Channels → Sectors/Companies → Report/Plan).
- Mini macro snapshot cards.
- States: first-visit (shows tour prompt), returning (shows recent).

#### S2 — Mode A Input (`/market`)
- Large textarea: "Paste a news headline, article text, or describe an event."
- URL field (mock: shows "URL fetched ✓" with a pre-written article for sample URLs).
- Depth selector: Quick / Standard / Deep with an info tooltip showing "≈ calls, ≈ time, companies covered" (mock numbers).
- Sample-event chips; character counter; validation (min length message).
- Right side panel: "Tips for good input" (good vs bad examples).
- Primary button: **Analyse event**. Secondary: **Load sample**.
- Matching rule (mock): keyword match to the 3 scenarios; unknown text → "Generic scenario" with a small note "Demo maps your text to the closest sample."

#### S3 — Parsed Event Confirmation (`/market/confirm`)
- Card showing the "understood" event: headline, type, geographies, magnitude, duration, certainty, direction for India, key facts, unknowns — fields **editable** (dropdowns/chips).
- Active transmission channels preview (chips with strength dots).
- Estimated run: "~14 LLM calls · ~6 min (simulated)".
- Buttons: **Looks right — run analysis**, **Edit text**, **Cancel**.

#### S4 — Simulated Run (`/market/run`, `/company/run`)
- Vertical stepper of the real pipeline steps (Mode A: Event understanding → Channel mapping → Macro impact → Sector ranking → Candidate shortlist → Company scoring (batch 1/6 … 6/6) → Calibration & bucketing → Scenarios → Report assembly). Mode B has its own step list.
- Each step: status icon (pending/running/done/warning), elapsed time, short log line ("Scoring batch 3/6 — 10 companies").
- Right panel **"LLM Gateway" live feed**: call counter, current model (sample free-model names, labelled sample), key in use, events like "Key 2 rate-limited (429) → cooldown 60s → switched to Key 3", "Model unavailable → fallback", "Cache hit ✓".
- Progress bar, estimated time left, **Pause**, **Cancel**.
- Demo controls (in Settings or a hidden drawer): force "all keys exhausted" to show the **Resume later** state (partial results preserved; shows reset time) and force an error state.
- On finish: auto-navigate to report with a success toast.

#### S5 — Mode A Report (`/market/report/:id`) — the showpiece
Sticky left table of contents (collapses on mobile); sections as in the product plan:
1. **Header:** title, date, depth, demo watermark, buttons: Print/PDF, Copy link (mock), Save to history, Re-run (mock), Share (mock modal).
2. **Executive summary** + **verdict box** (market tone arrow, counts per bucket, confidence).
3. **The event** — facts vs unknowns; magnitude/duration/certainty badges.
4. **Transmission channels** table with strength dots.
5. **Macro impact** table (GDP, CPI, CAD, INR, yields, RBI stance, FII flows, Nifty/Sensex tone) with direction arrows and confidence.
6. **Macro backdrop** snapshot.
7. **Sector heatmap** (interactive: hover shows reason; click filters company tables to that sector).
8. **Company buckets** — five collapsible tabs/sections (High Danger, Moderate Negative, Little/No Effect, Moderate Positive, Massive Gain). Each row: company, symbol, sector, score bar, channels chips, one-line reason, magnitude, horizon, confidence ring, mitigants. Row click opens a **side drawer** with full reasoning, resilience band, technical bias, and "Run Mode B for this company" button (jumps to Mode B pre-filled).
9. **Uncertain / low-confidence** list.
10. **Scenarios** (Best/Base/Worst cards) with "which companies change bucket" mini-table.
11. **Timeline** (day 1 → quarter 1).
12. **Watch-list & triggers**.
13. **Historical analogues** (cards: event, date, what happened).
14. **Assumptions & limitations**.
15. **Appendix:** models used (sample), prompt versions, call count, generation time.
- Filters: bucket multiselect, sector filter, confidence slider, search company, sort by score.
- Print stylesheet: clean A4 layout, no nav, page breaks before major sections.

#### S6 — Mode B Input (`/company`)
- Company search with **autocomplete** (name or symbol; shows sector badge and mini price sparkline) from the ~50-company mock universe.
- After selection: **company snapshot card** (business summary, revenue mix donut, exposure tags, resilience band).
- Event textarea + sample chips specific to that company (e.g., for Asian Paints: "Crude spikes to $110").
- Depth selector and **Analyse** button.

#### S7 — Mode B Confirmation (`/company/confirm`)
- Parsed event + **"Channels that actually touch this company"** (intersection of event channels and company exposure; untouched channels greyed with "no meaningful exposure").
- Editable fields, estimated calls/time, run button.

#### S8 — Mode B Report (`/company/report/:id`)
Sections (as in product plan):
1. Header (company, symbol, event, date, demo watermark, actions).
2. **At-a-glance box:** net impact score, resilience band, stance (**Defend / Capitalize / Both**), confidence.
3. The event and channels touching the company.
4. Company snapshot (business, revenue mix donut, exposure tags).
5. **Impact by dimension** — table with −3…+3 bars (revenue, pricing, input costs, margins, working capital, debt & interest, forex, supply chain, customers/demand, regulatory, reputation, capex, governance); expandable explanations.
6. **Financial resilience** — ratios table, resilience radar chart, "runway view" sentence.
7. **Market view** — mock 1D/1W/1M tabs with a simple line chart and bias badges; "priced-in check" note; **news sentiment table** (10 mock headlines with sentiment chips and materiality).
8. Macro backdrop.
9. **Peer comparison** table (better/same/worse than company).
10. **Strategic Plan — two tabs: Defend | Capitalize**, each with three time columns (Immediate 0–30d, Short 1–6m, Long 6–24m). Action cards: action, lever tag, why, owner, effort chip, expected effect, risk. Checkbox "mark as considered" (mock, local state) and a progress counter.
11. **KPIs & trigger points** (table + "if X then switch plan to Y").
12. **Plan risks & assumptions**.
13. **Scenarios** (best/base/worst) with "how the plan performs".
14. Historical analogues.
15. Limitations + disclaimer; appendix.

#### S9 — Reports History (`/reports`)
Table/cards of saved mock reports (5–8 pre-made + any "saved" during the demo): type badge (Market / Company), title, company, date, depth, bucket-count summary. Search, filter by type/date/company, sort, delete (local only), open, duplicate-as-new-run. Empty state: "No reports yet — try a sample."

#### S10 — Knowledge Base
- **Sector matrix:** table of sectors × channels with colour-coded cells (−2…+2), hover explanations, filter by channel; "this matrix is the prior used by the engine."
- **Company profiles list:** searchable cards (symbol, sector, verification badge `human-verified` / `llm-draft`, confidence); click → profile page with all schema fields, source list, last verified date, "Run Mode B" button.

#### S11 — Settings (`/settings`)
- **Keys panel (mock):** table of 3–4 sample keys (alias only: Key 1…): status (OK / cooling down / exhausted / dead), used today / cap, last error; buttons **Test key**, **Add key** (modal, mock), **Remove** (mock). Explanation text of rotation rules.
- **Model list (mock):** sample free models with success rate and ban/penalty state.
- Depth defaults, theme, "Reset demo data".
- **Demo controls drawer:** toggles — simulate rate limit, simulate all keys exhausted, simulate slow run, simulate error at step N, speed (1×/2×/5×).

#### S12 — Data Status (`/data-status`)
Cards for Prices, Fundamentals, News, Macro, Filings, Knowledge Base: last refresh, coverage %, stale warnings, "Refresh now" button (simulated progress + success). Table of per-source health (RSS feeds ✓/✗ sample).

#### S13 — Help (`/help`)
Tabs: Quick start, How to write a good event, How to read Mode A report, How to read Mode B report, Depth modes, Key rotation explained, FAQ, Glossary, Disclaimer. Content mirrors what the future `TUTORIAL.md` will say.

#### S14 — Empty / Error / Edge states (cross-cutting)
No history, no search results, invalid input, too-short event, unknown company, simulated error mid-run (with Retry from failed step), all keys exhausted (Resume later), offline notice, 404, print mode.

---

## 7. User Journeys to Make Demonstrable

| # | Journey | Steps | Proves |
|---|---|---|---|
| J1 | Market impact, happy path | Home → sample chip "Crude spikes to $110" → confirm → run → report → open a company drawer | Core value of Mode A |
| J2 | Drill-down to company | From J1 drawer → "Run Mode B" → pre-filled company+event → run → report → Defend/Capitalize tabs | Linkage between modes |
| J3 | Company first | Mode B → search "Asian Paints" → snapshot → event → report | Mode B standalone |
| J4 | Rate-limit drama | Enable demo toggle → run → see key rotation in the gateway feed → success | Key rotation concept |
| J5 | Keys exhausted | Enable "all keys exhausted" → run stops → "Resume later" screen → partial report preview | Free-tier reality handled |
| J6 | Reports history | Save report → open history → filter → reopen | Persistence idea |
| J7 | Knowledge base | Browse sector matrix → open company profile → run Mode B | Transparency of grounding |
| J8 | Custom text | Type unrelated event → mapped to nearest sample with notice | Honest mock behaviour |
| J9 | Print | Open report → Print/PDF → clean layout | Deliverable quality |
| J10 | Mobile | Repeat J1 on a phone-width screen | Responsiveness |

---

## 8. Simulation Engine (how the mock "pretends")

### 8.1 Run simulator
- A `runSimulator(mode, scenarioId, options)` function returns an async event stream: `step_started`, `log`, `gateway_event`, `step_done`, `warning`, `error`, `completed`.
- Each step has a configured duration range (e.g., 1.5–4 s at 1×) and scripted log lines; company-scoring batches loop N times.
- **Speed control:** 1×, 2×, 5×, instant (for QA).
- **Scripted gateway events** per scenario (e.g., at batch 3: "Key 1 → 429, cooldown 60s → Key 2"; at batch 5: "Model unavailable → fallback model B"; random "Cache hit").
- **Failure injection:** `forceErrorAtStep`, `forceAllKeysExhausted`, `forceSlowRun` from the demo drawer.
- **Resume:** saves `{scenarioId, completedSteps}` in `localStorage`; "Resume" continues from the next step.

### 8.2 Input-to-scenario matching
1. Normalise text (lowercase, strip punctuation).
2. Score each scenario by keyword lists (e.g., crude: "crude, oil, brent, opec"; tariff: "tariff, duty, trade war, export"; rates: "repo, rbi, rate cut, rate hike, interest").
3. Highest score ≥ threshold → that scenario; otherwise "generic" scenario with a visible notice.
4. Mode B: scenario + company → picks a company-specific variant if one exists; else derives a **templated variant** from the company's exposure tags (small rules table) so every company in the universe can produce *some* plausible report.

### 8.3 Dynamic-feeling touches
- Slight random jitter on numbers shown in the macro ticker (± small %, labelled sample).
- Timestamps relative to "now".
- Report IDs generated per run; duplicates allowed.
- Streaming effect: executive summary text types in line by line after the run.

---

## 9. Design System

### 9.1 Visual direction
Clean, data-dense but calm — "research terminal meets editorial report." Generous whitespace on the report page, compact density in tables. Indian context cues (₹, lakh/crore formatting, IST timestamps, NSE/BSE labels).

### 9.2 Tokens (CSS variables; light + dark)
- **Neutrals:** background, surface, surface-2, border, text, text-muted.
- **Brand accent:** one primary (deep blue/teal), one secondary.
- **Impact bucket colours (fixed everywhere):**
  - High Danger — deep red `#B42318` + ⚠ icon
  - Moderate Negative — orange `#DC6803` + ▼ icon
  - Little / No Effect — grey `#667085` + ● icon
  - Moderate Positive — light green `#039855` + ▲ icon
  - Massive Gain — deep green `#027A48` + ★ icon
  (Colour is never the only signal: icon + text label always included — accessibility.)
- **Confidence:** ring/pill with High/Medium/Low.
- **Demo banner:** amber.
- **Radius** 8–12px, **shadows** subtle, **spacing** 4-pt scale.

### 9.3 Typography
Inter (UI), a readable serif (e.g., Source Serif) for report narrative, tabular numerals for tables, monospace for symbols/log feed.

### 9.4 Core components
TopBar, MacroTicker, DemoBanner, ModeCard, SampleChip, DepthSelector, EventTextarea, ParsedEventCard, ChannelChip (with strength dots), PipelineStepper, GatewayFeed, KeyStatusTable, ReportShell (TOC + content), SectionCard, VerdictBox, BucketBadge, ScoreBar, ConfidenceRing, SectorHeatmap, CompanyTable, CompanyDrawer, ScenarioCard, Timeline, PlanTabs (Defend/Capitalize), ActionCard, KPITable, PeerTable, ResilienceRadar, PriceMiniChart, SentimentTable, RevenueDonut, MatrixGrid, ProfileView, Toast, Modal, EmptyState, ErrorState, Skeleton loaders.

### 9.5 Responsiveness
Breakpoints: 360 / 768 / 1024 / 1280. Tables become card lists on mobile; TOC becomes a dropdown; drawers become full-screen sheets.

### 9.6 Accessibility
Keyboard navigation, visible focus, ARIA roles for tabs/drawers/steppers, contrast ≥ 4.5:1, `prefers-reduced-motion` respected, screen-reader labels for score bars and charts (text summaries).

### 9.7 Print styles
A4, hide nav/ticker/banner except a small "Demo" watermark, avoid breaking tables/cards across pages, show URLs for links.

---

## 10. Project Structure
```
india-event-impact-mock/
├─ README.md
├─ MOCK-GUIDE.md                # how to run, demo script, how to edit content
├─ MOCK-UI-MASTERPLAN.md        # this file
├─ package.json  vite.config.ts  tailwind.config.js  index.html
├─ public/
│  └─ favicon, og-image
├─ src/
│  ├─ main.tsx  App.tsx  routes.tsx
│  ├─ api/
│  │  └─ mockApi.ts             # the ONLY data entry point (swap for real API later)
│  ├─ simulator/
│  │  ├─ runSimulator.ts  scenarioMatcher.ts  gatewaySim.ts  failureInjection.ts
│  ├─ data/
│  │  ├─ universe.json          # ~50 companies
│  │  ├─ macro.json  sectors.json  channels.json  sectorMatrix.json
│  │  ├─ profiles/              # exposure profile JSON per company (sample)
│  │  ├─ scenarios/market/      # crude.json, tariff.json, ratecut.json, generic.json
│  │  ├─ scenarios/company/     # asianpaints_crude.json, tcs_tariff.json, ...
│  │  ├─ reportsHistory.json  keys.json  models.json  dataStatus.json
│  │  └─ helpContent.json
│  ├─ components/               # see 9.4
│  ├─ pages/                    # one file per screen S1–S14
│  ├─ state/                    # context + reducers (theme, demoControls, savedReports)
│  ├─ styles/                   # tokens.css, print.css
│  ├─ types/                    # TypeScript types mirroring the real JSON schemas
│  └─ utils/                    # formatters (₹, crore/lakh, %, dates IST), scoring helpers
└─ tests/
```

---

## 11. Data Contract (shared with the real product)

The TypeScript types in `src/types/` mirror the real backend's Pydantic schemas so swapping is painless:

- `Event` — `headline, event_type, geographies[], magnitude, duration, certainty, direction_for_india, key_facts[], unknowns[]`
- `ChannelImpact` — `channel, active, direction, strength(1–5), reason`
- `MacroImpact` — `{gdp, cpi, cad, inr, yield10y, rbi_stance, fii_flows, index_tone}` each `{direction, magnitude_band, confidence, horizon}`
- `SectorImpact` — `sector, score(−5..+5), confidence, reason, key_channels[]`
- `CompanyImpact` — `symbol, impact_score, bucket, primary_channels[], reasoning, magnitude_estimate, horizon, confidence, mitigants[], data_gaps[]`
- `Scenario` — `name(best/base/worst), narrative, triggers[], bucket_shifts[]`
- `MarketReport` — all of the above + `timeline[], watchlist[], analogues[], assumptions[], appendix`
- `CompanyDimensionImpact` — `dimension, impact(−3..+3), explanation, evidence, magnitude_estimate, timing, confidence`
- `ResilienceSnapshot` — `score, band, strengths[], weaknesses[], ratios{}`
- `StrategyPlan` — `stance, immediate_0_30d[], short_term_1_6m[], long_term_6_24m[], kpis_to_track[], trigger_points[], plan_risks[], assumptions[]` with `Action{action, lever, why, owner, cost_effort, expected_effect, risk}`
- `CompanyReport` — all of the above + peers, technicals (1D/1W/1M), news sentiment[], macro backdrop
- `ExposureProfile` — as in the product plan
- `KeyStatus` — `alias, status, used_today, cap, cooldown_until, last_error`

**Rule:** if a field is added to the mock, add it to the types and note it in the Decisions Log so the real backend plan stays aligned.

---

## 12. Mock Content Plan (what must be written)

### 12.1 Universe (≈50 companies)
Nifty 50-style list with symbol, name, sector (from the product's taxonomy), market-cap bucket, mini price series (generated, labelled sample), resilience band, and tags. Use real company names/symbols for realism, but all figures are illustrative.

### 12.2 Market scenarios (Mode A) — fully written
| ID | Event | Highlights to show |
|---|---|---|
| MA-1 | Crude oil spikes to $110 | OMCs, paints, tyres, aviation hurt; upstream oil gains; INR pressure; inflation up; scenario on OPEC response |
| MA-2 | US imposes higher tariffs on Indian goods | Textiles, gems/jewellery, auto parts, some pharma/chemicals hurt; domestic-focused resilient; possible relative winners; INR dip |
| MA-3 | RBI cuts repo rate by 25 bps | Real estate, autos, NBFCs, capital goods gain; banks mixed (NIM); rate-sensitive consumer; yields down |
| MA-G | Generic fallback | Balanced, cautious tone, many "uncertain" entries — shows honesty for unknown inputs |

Each scenario includes: event JSON, 6–10 active channels, macro table, 12–15 sector scores, **≈25–30 companies across all five buckets** (at least 2 "Massive Gain" and 2 "High Danger"), 3 uncertain entries, 3 scenarios, timeline, watch-list, 2–3 analogues, assumptions.

### 12.3 Company scenarios (Mode B) — fully written
| ID | Company + Event | Plan highlights |
|---|---|---|
| MB-1 | Asian Paints + crude to $110 | Defend: input hedging, pricing pass-through, supplier diversification; Capitalize: share gain from weaker rivals, premium mix |
| MB-2 | TCS + US tariffs / weaker rupee | Defend: onshore delivery mix, client contracts; Capitalize: rupee tailwind, vendor consolidation deals |
| MB-3 | IndiGo + crude to $110 | Defend: fuel hedging, fare/yield mgmt, route pruning; Capitalize: fleet efficiency, weaker-rival capacity gaps |
| MB-4 | HDFC Bank + RBI rate cut | Defend: NIM management, deposit mix; Capitalize: credit growth, retail/MSME push |
| MB-T | Template variants | Auto-generated for other companies from exposure tags |

Each includes the full 15 report sections, a 3-column plan with 4–6 action cards per column per track, 8–10 KPIs, 4–5 trigger points, peers (3–5), 10 sample news headlines with sentiment, and 1D/1W/1M sample charts.

### 12.4 Other content
Sector matrix (all sectors × ~12 channels), 10–15 sample exposure profiles (others minimal), 6–8 history reports, 4 sample keys, 6 sample free-model names (labelled sample), data-status numbers, Help content, glossary (≥ 30 terms), 6–8 historical analogues.

### 12.5 Writing guidelines for mock content
- Believable, specific, cautious; avoid certainty words ("will definitely").
- Use ranges and confidence levels.
- Keep each company reason to 2–3 sentences; each action card to ≤ 40 words.
- Flag every number as sample in the appendix.
- Keep Indian number formats (₹ crore).

---

## 13. Phases, Tasks and Acceptance Criteria

Legend: `[ ]` todo, `[~]` in progress, `[x]` done.

### Phase M0 — Setup and Decisions (0.5–1 day)
- [ ] M0-T1 Confirm stack (React+Vite+Tailwind) or choose single-file HTML alternative; log decision
- [ ] M0-T2 Create repo, scaffold Vite app, install Tailwind, Recharts, lucide, React Router, Framer Motion
- [ ] M0-T3 Set up folders (Section 10), ESLint/Prettier, hash routing
- [ ] M0-T4 Copy this plan to `MOCK-UI-MASTERPLAN.md`; create `PROGRESS.md`
**Done when:** `npm run dev` shows a blank app with routing to placeholder pages.

### Phase M1 — Design System and Layout Shell (1–2 days)
- [ ] M1-T1 Tokens (colours, bucket colours, typography, spacing), light/dark theme with toggle
- [ ] M1-T2 TopBar, DemoBanner, MacroTicker (mock data), Footer, mobile tab bar
- [ ] M1-T3 Base components: Button, Card, Badge (BucketBadge), Chip, Tabs, Modal, Drawer, Toast, Skeleton, EmptyState, ErrorState
- [ ] M1-T4 Print stylesheet baseline
- [ ] M1-T5 A hidden `/styleguide` page showing every component (for review)
**Done when:** the style guide page looks consistent in light/dark and at 360px.

### Phase M2 — Mock Data Foundation (2–3 days, can run alongside M1)
- [ ] M2-T1 TypeScript types mirroring Section 11
- [ ] M2-T2 `universe.json` (≈50 companies), `sectors.json`, `channels.json`, `macro.json`
- [ ] M2-T3 `sectorMatrix.json` and 10–15 sample exposure profiles
- [ ] M2-T4 Market scenarios MA-1, MA-2, MA-3, MA-G (full JSON)
- [ ] M2-T5 Company scenarios MB-1 … MB-4 + template-variant rules
- [ ] M2-T6 `reportsHistory.json`, `keys.json`, `models.json`, `dataStatus.json`, `helpContent.json`
- [ ] M2-T7 `mockApi.ts` with async functions (with artificial latency) for every dataset
- [ ] M2-T8 Data validation script (checks all JSON against types, bucket thresholds consistent with scores, symbols exist in universe)
**Done when:** the validation script passes and every scenario has all required sections populated.

### Phase M3 — Home, Mode A Input and Confirmation (2 days)
- [ ] M3-T1 Home page (S1)
- [ ] M3-T2 Mode A input page (S2) with depth selector, sample chips, validation
- [ ] M3-T3 Scenario matcher (Section 8.2) + generic fallback notice
- [ ] M3-T4 Confirmation page (S3) with editable parsed-event fields and channel chips
**Done when:** typing or choosing a sample leads to a correct, editable confirmation page.

### Phase M4 — Run Simulator and Gateway Feed (2–3 days)
- [ ] M4-T1 `runSimulator` event stream with speed control
- [ ] M4-T2 PipelineStepper + progress + elapsed/ETA
- [ ] M4-T3 GatewayFeed with scripted key-rotation/model-fallback/cache events
- [ ] M4-T4 Failure injection (error at step N, slow run)
- [ ] M4-T5 All-keys-exhausted → Resume-later screen + resume logic
- [ ] M4-T6 Demo-controls drawer wired to simulator
**Done when:** journeys J4 and J5 work end to end.

### Phase M5 — Mode A Report (4–6 days; the biggest phase)
- [ ] M5-T1 ReportShell with sticky TOC, section anchors, print button
- [ ] M5-T2 Summary, verdict box, event, channels, macro tables
- [ ] M5-T3 Sector heatmap (interactive, filters company tables)
- [ ] M5-T4 Company bucket sections, CompanyTable with sort/filter/search
- [ ] M5-T5 CompanyDrawer with full reasoning and "Run Mode B" link
- [ ] M5-T6 Uncertain list, scenarios, timeline, watch-list, analogues, assumptions, appendix
- [ ] M5-T7 Typing/streaming effect for executive summary, skeleton loading
- [ ] M5-T8 Print/PDF layout polish; mobile layout polish
**Done when:** MA-1, MA-2, MA-3 reports render completely, print cleanly, and journeys J1, J8, J9 pass.

### Phase M6 — Mode B Input, Confirmation and Report (4–6 days)
- [ ] M6-T1 Company search/autocomplete + snapshot card (S6)
- [ ] M6-T2 Confirmation with "channels touching this company" (S7)
- [ ] M6-T3 Report header, at-a-glance box, event/channels/snapshot sections
- [ ] M6-T4 Impact-by-dimension table with bars and expandable text
- [ ] M6-T5 Resilience section (ratios table, radar, runway sentence)
- [ ] M6-T6 Market view (1D/1W/1M mini charts, priced-in note) + news sentiment table
- [ ] M6-T7 Peer comparison table
- [ ] M6-T8 PlanTabs (Defend/Capitalize) with three time columns, ActionCards, "considered" checkboxes, progress counter
- [ ] M6-T9 KPIs, trigger points, plan risks, scenarios, analogues, appendix
- [ ] M6-T10 Template-variant generator so any universe company yields a plausible report
**Done when:** MB-1…MB-4 render fully; a random other company renders a templated variant; journeys J2, J3 pass.

### Phase M7 — Supporting Pages (2–3 days)
- [ ] M7-T1 Reports history (S9) with search/filter/save/delete (localStorage)
- [ ] M7-T2 Knowledge base: sector matrix grid + company profile list/detail (S10)
- [ ] M7-T3 Settings with Keys panel, models list, theme, reset (S11)
- [ ] M7-T4 Data status page with simulated refresh (S12)
- [ ] M7-T5 Help page with tabs, FAQ, glossary, disclaimer (S13)
- [ ] M7-T6 404 and global error boundary; all empty/error states (S14)
**Done when:** every route in the sitemap works and has no placeholder text.

### Phase M8 — Polish, Accessibility and QA (2–3 days)
- [ ] M8-T1 Responsive pass at 360/768/1024/1280 for every page
- [ ] M8-T2 Accessibility pass (keyboard, focus, ARIA, contrast, reduced motion)
- [ ] M8-T3 Copy review: consistency of tone, no overclaiming, demo labels everywhere
- [ ] M8-T4 Performance pass (code-splitting routes, lazy charts; target Lighthouse ≥ 90 on Perf/A11y)
- [ ] M8-T5 Cross-browser check (Chrome, Firefox, Safari, mobile Chrome/Safari)
- [ ] M8-T6 Run all 10 journeys (Section 7) and fix defects
- [ ] M8-T7 Unit tests for scenarioMatcher, simulator, formatters, data validation
**Done when:** QA checklist (Section 15) is fully ticked.

### Phase M9 — Documentation, Hosting and Handoff (1–2 days)
- [ ] M9-T1 Write `MOCK-GUIDE.md` (below)
- [ ] M9-T2 Deploy free (GitHub Pages / Netlify / Cloudflare Pages) and verify hash routing and refresh behaviour
- [ ] M9-T3 Optional "shareable build": single self-contained HTML file for emailing/offline demo
- [ ] M9-T4 Record a 2–3 minute screen-capture demo (free tools) following the demo script
- [ ] M9-T5 Feedback form template (what to ask reviewers) and a list of change requests
- [ ] M9-T6 "Backend swap guide": map each `mockApi` function to the real endpoint it will call
**Done when:** a stranger can open the link, follow the demo script, and give structured feedback.

### Phase M10 — Feedback and Iteration (open-ended)
- [ ] M10-T1 Collect feedback from approver/users
- [ ] M10-T2 Prioritise changes; update this plan and the product master plan
- [ ] M10-T3 Freeze UI v1 and convert to real frontend by implementing the backend swap

**Estimated total:** about 3–4 weeks part-time (about 2 weeks full-time). Phases M1 and M2 can overlap; M5 and M6 are the heaviest.

---

## 14. MOCK-GUIDE.md (required deliverable) — must contain
1. What the mock is and is not (sample data disclaimer)
2. How to open it (link, or run locally: Node version, `npm install`, `npm run dev`; or open the single HTML file)
3. A guided **demo script** (5-minute tour): Home → sample event → confirm → run (turn on rate-limit demo) → report → drawer → Mode B → Defend/Capitalize → history → settings keys → help
4. Where things live (folder map) and which file is the single data entry point
5. How to **edit content**: add a company, change a score, add a scenario, edit help text, with a worked example
6. How the scenario matcher works and how to add keywords
7. How to use the demo-controls drawer (all toggles explained)
8. How to print/export a report
9. How to deploy for free (steps for one host)
10. Known limitations of the mock
11. How the mock maps to the real product (backend swap table)
12. Feedback instructions for reviewers

---

## 15. QA Checklist
- [ ] Every route loads on desktop and 360px mobile
- [ ] All 10 journeys pass
- [ ] Bucket colours + icons + labels consistent everywhere
- [ ] Demo banner visible on all report pages and prints
- [ ] No lorem ipsum; no dead buttons (every button does something or says "coming in real version")
- [ ] Numbers consistent between summary, tables and drawers (e.g., bucket counts match the lists)
- [ ] Scores map to the correct buckets per thresholds (≤ −3.5, −3.5…−1.5, −1.5…+1.5, +1.5…+3.5, ≥ +3.5)
- [ ] Light/dark both readable; print is clean
- [ ] Keyboard-only run-through works
- [ ] Refresh on any route works on the hosted site
- [ ] Lighthouse targets met

---

## 16. Demo Script (for the approval presentation, ~5 minutes)
1. **Home (30s):** "You give it an event; it tells you who wins and who loses — and what a company should do."
2. **Mode A (90s):** click *Crude spikes to $110* → confirm → run; point out pipeline, key rotation feed → report: heatmap, buckets, drawer for one High Danger and one Massive Gain company.
3. **Mode B (90s):** from drawer → Asian Paints → dimensions, resilience → Defend/Capitalize plan with time columns.
4. **Trust and limits (60s):** show confidence, uncertain list, assumptions, Settings → keys (free-tier reality), Knowledge → sector matrix (how grounding works).
5. **Ask (30s):** feedback prompts — what is missing, what is confusing, which sections matter most — and approval to build the real engine.

---

## 17. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Viewers mistake the mock for real analysis | High | Persistent demo banner, sample labels, disclaimer, watermark on print |
| Mock sets unrealistic expectations of accuracy | High | Show confidence/uncertainty/limitations prominently; mention back-test plan |
| Content writing takes longer than coding | High | Write 3+4 full scenarios only; template variants for the rest |
| Scope creep (adding fake features) | Med | Phase gates; anything not in sitemap goes to M10 |
| Mock diverges from real schemas | Med | Types mirror backend schemas; log every field change |
| Inconsistent numbers across sections | Med | Single scenario JSON feeds all views; validation script |
| Hosting quirks with routing | Low | Hash routing; test refresh |
| Performance with big JSON | Low | Lazy-load scenario files per route |

---

## 18. Legal / Responsible-Use Note for the Mock
All companies named appear only to illustrate how the tool would work. Scores, reasons, numbers and plans in the mock are **fictional/illustrative** and must not be used for investment decisions. Show this on the Help page, in the footer, and in every report.

---

## 19. Success Criteria for the Mock
- A first-time viewer understands both modes within 2 minutes.
- Reviewers can name at least 3 concrete changes they'd want (proves the mock is concrete enough to critique).
- The approver can say yes/no/modify on building the real engine.
- The mock's data contract needs **no** structural changes when the backend arrives (only the `mockApi` swap).

---

## 20. Glossary (mock-specific)
**Scenario file** — a JSON file holding a complete pre-written report. **Run simulator** — code that fakes the analysis pipeline with timed steps. **Gateway feed** — the on-screen log imitating LLM calls and key rotation. **Template variant** — an auto-built plausible report for companies without a hand-written scenario. **Demo controls** — toggles that force errors/limits to show edge cases.

---

## 21. Progress Tracker (update every session)

| Phase | Status | % | Last updated | Notes / blockers |
|---|---|---|---|---|
| M0 Setup and decisions | Complete | 100% | Oct 22, 2026 | Vite + React + Tailwind + Hash routing + TS |
| M1 Design system + shell | Complete | 100% | Oct 22, 2026 | Colors, fonts, layout, Demo banner, macro ticker |
| M2 Mock data foundation | Complete | 100% | Oct 22, 2026 | ~50 universe companies, 7 scenarios, 10 profiles, validation script |
| M3 Home + Mode A input/confirm | Complete | 100% | Oct 22, 2026 | Dynamic scenario matching (MA-1 to MA-G), parameters |
| M4 Run simulator + gateway feed | Complete | 100% | Oct 22, 2026 | Timed steps, pause/resume, key switching, rate limits |
| M5 Mode A report | Complete | 100% | Oct 22, 2026 | Heatmap, Company table, drawer, Mode B CTA, auto-save |
| M6 Mode B flow + report | Complete | 100% | Oct 22, 2026 | 13 dimensions, Defend/Capitalize plan, considered tracking |
| M7 Supporting pages | Complete | 100% | Oct 22, 2026 | Reports history, dynamic sector matrix + rationale drawer, profiles |
| M8 Polish + QA | Complete | 100% | Oct 22, 2026 | End-to-end browser subagent verified, 18 automated tests pass |
| M9 Docs + hosting + handoff | Complete | 100% | Oct 22, 2026 | GitHub Pages ready (hash routing), demo script, PROGRESS.md |
| M10 Feedback + iteration | Active | 100% | Oct 22, 2026 | Prototype ready for stakeholder review and presentation |

**Current task:** Complete — 100% prototype readiness achieved across all journeys (J1–J10)
**AI tool currently in use:** Antigravity (Google DeepMind)
**Last session summary:** Completed dynamic template variant generation, dynamic company profile loading with fallback synthesis, sector matrix with interactive rationale drawer, demo controls wiring, local storage persistence, automated test suite (18/18 passing), and end-to-end browser journey verification.

---

## 22. Decisions Log

| Date | Decision | Reason |
|---|---|---|
| Oct 22, 2026 | Build a frontend-only clickable mock before any backend | Validate idea and get approval cheaply |
| Oct 22, 2026 | All data pre-written JSON; one `mockApi` entry point | Easy later swap to real backend |
| Oct 22, 2026 | Default stack: React + Vite + Tailwind + Recharts, hash routing, free static hosting | Free, fast, shareable |
| Oct 22, 2026 | Mock mirrors real JSON schemas | Keep mock and product aligned |
| Oct 22, 2026 | 3 market + 4 company full scenarios; template variants for the rest | Balance realism vs effort |
| Oct 22, 2026 | Persistent demo banner and sample-data labels | Avoid misleading viewers |

---

## 23. First Message to Give Any AI to Start Building (copy-paste)

> I'm building a **frontend-only mock** of the "India Event-Impact Intelligence Tool". I've pasted the mock-UI master plan, progress tracker and decisions log. Follow the plan exactly: no backend, no real API calls, everything free, all data from local JSON files via a single `mockApi` module, demo banner everywhere. Start with task **M0-T1** (or the first unchecked task). For each task: (1) restate the goal, (2) list files to create/change with full code, (3) give the command or manual check to verify it, (4) tell me what to tick in the tracker and what comes next. Ask before changing any logged decision.
