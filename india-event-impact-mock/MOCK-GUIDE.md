# India Event-Impact Mock UI — MOCK-GUIDE.md

## 1. What This Mock Is (and Is Not)

**This is a frontend-only clickable prototype** — a static web app that simulates the full "India Event-Impact Intelligence Tool" experience.

| ✅ What It Does | ❌ What It Does Not |
|----------------|---------------------|
| Lets you click through Mode A (Event → Market Report) | Call real LLMs or APIs |
| Lets you click through Mode B (Company + Event → Defend/Capitalize Plan) | Fetch real prices, news, or fundamentals |
| Shows realistic sample data for 3 market + 4 company scenarios | Produce genuine investment analysis |
| Simulates pipeline steps, key rotation, errors, "resume later" | Save data to a server |
| Works offline / on GitHub Pages | Require any backend |

**All numbers, scores, reasoning, and plans are fictional/sample data.** The persistent "DEMO — sample data, not real analysis" banner reminds you of this on every page and printed report.

---

## 2. How to Open / Run

### Option A: Hosted (Recommended for Reviewers)
Open the GitHub Pages URL: `https://<your-username>.github.io/india-event-impact-mock/`

### Option B: Local Development
```bash
# Prerequisites
# - Node.js 20+
# - npm 10+

cd india-event-impact-mock
npm install
npm run dev
```
Then open `http://localhost:5173/india-event-impact-mock/`

### Option C: Production Build Preview
```bash
npm run build
npm run preview
```

---

## 3. Guided Demo Script (5 Minutes)

Follow this exact path for the approval presentation:

| Step | Action | What to Point Out |
|------|--------|-------------------|
| **1. Home (30s)** | Land on `/` | Hero, two big mode cards, sample event chips, recent reports, macro snapshot |
| **2. Market Impact (90s)** | Click **"Crude oil spikes to $110"** → **Confirm** → **Run Analysis** | Parsed event confirmation, transmission channels, depth selector. On run page: pipeline stepper, gateway feed with key rotation (batch 3/6 → rate limit → cooldown → key switch), progress bar. Report auto-opens. |
| **3. Market Report (60s)** | Scroll through report | Executive summary, verdict box, sector heatmap, **5 bucket tabs** (Danger/Negative/Neutral/Positive/Gain) with sortable tables, scenarios, timeline, watch-list. Click a company row → **drawer opens** with full reasoning. |
| **4. Drill to Company (60s)** | In drawer, click **"Run Mode B for this company"** | Pre-filled Asian Paints + Crude. Confirm → Run. Report opens with **At a Glance**, 13-dimension table, resilience radar, market view (1D/1W/1M tabs + news), **Defend / Capitalize tabs** with 3 time columns each, KPIs, triggers, plan scenarios. |
| **5. Trust & Limits (30s)** | Visit **Settings → Keys**, **Knowledge → Sector Matrix** | Key pool status, rotation rules. Sector matrix shows priors used by engine. Company profiles show verification status (human-verified vs LLM-draft). |
| **6. Ask (30s)** | Collect feedback | "What's missing? What's confusing? Which sections matter most? Approve building real engine?" |

---

## 4. Where Things Live (Folder Map)

```
india-event-impact-mock/
├─ public/                    # Static assets (favicon, etc.)
├─ src/
│  ├─ api/
│  │  └─ mockApi.ts          # 🔑 SINGLE DATA ENTRY POINT — swap this for real backend
│  ├─ components/            # 15 reusable UI components
│  │  ├─ Button, Card, Badge, Chip, Modal, Drawer, Toast, Tabs, Skeleton, EmptyState, ErrorState
│  │  ├─ TopBar, DemoBanner, MacroTicker, Footer, MobileTabBar, Layout
│  │  └─ index.ts            # Barrel exports
│  ├─ data/                  # 📦 All mock data (JSON)
│  │  ├─ universe.json       # ~50 Nifty companies
│  │  ├─ sectors.json, channels.json, macro.json
│  │  ├─ sectorMatrix.json   # 23 sectors × 12 channels
│  │  ├─ templateVariants.json # Auto-generation rules for Mode B
│  │  ├─ profiles/           # 4 exposure profiles (ASIANPAINT, TCS, INDIGO, HDFCBANK)
│  │  ├─ scenarios/
│  │  │  ├─ market/          # MA-1 (Crude), MA-2 (Tariffs), MA-3 (Rate cut), MA-G (Generic)
│  │  │  └─ company/         # MB-1..MB-4 (Asian Paints, TCS, IndiGo, HDFC Bank)
│  │  ├─ reportsHistory.json # 7 pre-saved reports
│  │  ├─ keys.json, models.json, dataStatus.json, helpContent.json
│  ├─ pages/                 # 14 page components (Home, MarketInput, MarketConfirm, MarketRun, MarketReport, CompanyInput, CompanyConfirm, CompanyRun, CompanyReport, ReportsHistory, KnowledgeSectors, KnowledgeCompanies, CompanyProfile, Settings, DataStatus, Help, StyleGuide, NotFound)
│  ├─ routes.tsx             # React Router config (all routes)
│  ├─ simulator/
│  │  └─ runSimulator.ts     # Pipeline + gateway feed simulation
│  ├─ types/index.ts         # TypeScript types mirroring backend Pydantic schemas
│  └─ index.css              # Design tokens + print styles + dark mode
├─ MOCK-UI-MASTERPLAN.md     # Full specification
├─ MOCK-GUIDE.md             # This file
├─ package.json
├─ tsconfig.app.json
├─ vite.config.ts
└─ README.md
```

---

## 5. How to Edit Content

### Add a Company to Universe
Edit `src/data/universe.json`:
```json
{
  "symbol": "NEWCO",
  "name": "New Company Ltd",
  "sector": "Consumer Durables",
  "market_cap_bucket": "mid",
  "price_series": [100, 105, 110, 108, 112],
  "resilience_band": "medium",
  "tags": ["domestic_focused", "pricing_power"]
}
```

### Change a Score in a Scenario
Edit `src/data/scenarios/market/MA-1.json`, find the company in `companies[]`, change `impact_score` and `bucket`.

### Add a New Market Scenario
1. Create `src/data/scenarios/market/MA-4.json` (copy structure from MA-1)
2. Add `"MA-4": MA4` to `MARKET_SCENARIOS` in `mockApi.ts`
3. Add keywords to `matchMarketScenario()` in `mockApi.ts`

### Edit Help Text / Glossary
Edit `src/data/helpContent.json` — all help tab content lives here.

### How Scenario Matcher Works
`mockApi.ts` → `matchMarketScenario(eventText)`:
1. Normalizes input (lowercase, strip punctuation)
2. Scores against 3 keyword sets:
   - **Crude**: `crude, oil, brent, opec`
   - **Tariffs**: `tariff, duty, trade war, export`
   - **Rates**: `repo, rbi, rate cut, rate hike`
3. Highest score ≥ 2 → that scenario; else **MA-G (Generic)** with visible notice.

For Mode B: `matchCompanyScenario(companySymbol, eventText)` → looks up `COMPANY_SCENARIO_MAP` for hand-written variant, else uses `templateVariants.json` rules.

---

## 6. Demo Controls (Settings → Demo Controls)

| Toggle | Effect |
|--------|--------|
| **Simulate Rate Limit** | At batch 3/6, shows `Key 3: rate limited (429) → cooldown 60s → switched to Key 1` |
| **Simulate All Keys Exhausted** | Run pauses at scoring step → "Resume Later" screen with partial results |
| **Simulate Slow Run** | 5× step durations |
| **Simulate Error at Step N** | Injects error at chosen pipeline step with Retry button |
| **Speed (1×/2×/5×/Instant)** | Adjusts simulator timing |

---

## 7. How to Print / Export a Report

1. Open any report (`/market/report/MA-1` or `/company/report/MB-1`)
2. Click **"Print / PDF"** button (or `Ctrl+P`)
3. Browser print dialog opens with **clean A4 layout**:
   - No nav, ticker, demo banner (except small watermark)
   - Page breaks before major sections
   - URLs shown for links
   - Bucket colours preserved (`print-color-adjust: exact`)

---

## 8. Deploy for Free (GitHub Pages)

```bash
# 1. Build
npm run build

# 2. Deploy dist/ to GitHub Pages
# Option A: GitHub Actions (recommended)
# Create .github/workflows/deploy.yml:
#   name: Deploy to GitHub Pages
#   on: push to main
#   jobs:
#     deploy:
#       runs-on: ubuntu-latest
#       steps:
#         - uses: actions/checkout@v4
#         - uses: actions/setup-node@v4
#         - run: npm ci && npm run build
#         - uses: peaceiris/actions-gh-pages@v3
#           with: { github_token: ${{ secrets.GITHUB_TOKEN }}, publish_dir: ./dist }

# Option B: Manual (gh-pages branch)
npx gh-pages -d dist
```

**Important:** `vite.config.ts` has `base: '/india-event-impact-mock/'` for GitHub Pages subpath routing. Hash routing in React Router handles refresh correctly.

---

## 9. Known Limitations of the Mock

| Limitation | Impact |
|------------|--------|
| No real LLM calls | All "analysis" is pre-written JSON |
| Scenario matching is keyword-only | Typing "oil up" → Crude scenario; "trade war" → Tariff scenario |
| Only 3 market + 4 company hand-written scenarios | Other inputs fall back to Generic (MA-G) or Template (MB-T) |
| Template variants are rule-based, not LLM-generated | Less nuanced than real engine would be |
| No authentication / user accounts | Reports saved to `localStorage` only (cleared on cache clear) |
| Charts are placeholders | Recharts integration pending real data |
| No back-testing / validation | Scores not calibrated against historical outcomes |

---

## 10. How the Mock Maps to Real Product (Backend Swap Guide)

| Mock (`mockApi.ts`) | Real Backend Endpoint |
|---------------------|----------------------|
| `getUniverse()` | `GET /api/v1/universe` |
| `searchCompanies(q)` | `GET /api/v1/companies?q=` |
| `getMarketScenario(id)` | `GET /api/v1/reports/market/:id` |
| `getCompanyScenario(id)` | `GET /api/v1/reports/company/:id` |
| `matchMarketScenario(text)` | `POST /api/v1/analyze/market` (returns run_id) |
| `matchCompanyScenario(symbol, text)` | `POST /api/v1/analyze/company` (returns run_id) |
| `getExposureProfile(symbol)` | `GET /api/v1/knowledge/companies/:symbol` |
| `getSectorMatrix()` | `GET /api/v1/knowledge/sectors/matrix` |
| `getKeys()` | `GET /api/v1/admin/keys` |
| `testKey(alias)` | `POST /api/v1/admin/keys/test` |
| `getDataStatus()` | `GET /api/v1/admin/data-status` |
| `runSimulator(mode, scenarioId, opts)` | **WebSocket** `/api/v1/runs/:id/stream` (emits step_started, gateway_event, step_done, completed) |

**The real backend would:**
- Replace `mockApi.ts` entirely
- Keep the same TypeScript types (`src/types/index.ts`)
- Return the same JSON shapes from the scenario files
- Stream pipeline events via WebSocket instead of simulated `runSimulator`

---

## 11. Feedback Instructions for Reviewers

Please test the mock and send feedback on:

1. **Clarity**: Can you understand both modes within 2 minutes?
2. **Completeness**: Name 3 concrete changes you'd want (proves mock is concrete enough)
3. **Priority**: Which report sections matter most? Which can be cut?
4. **Trust**: Do confidence/uncertainty/limitations feel honest?
5. **Mobile**: Test at 360px width — any broken layouts?
6. **Print**: Try `Ctrl+P` on a report — clean enough for PDF sharing?

**Send feedback to:** [your-email@domain.com] or GitHub Issues.

---

## 12. Quick Commands Reference

```bash
# Development
npm run dev          # Start dev server (localhost:5173)
npm run build        # Production build → dist/
npm run preview      # Preview production build locally

# Validation
npx tsx src/scripts/validateData.ts  # Validates all JSON against types

# Deploy
npm run build && npx gh-pages -d dist  # Manual GitHub Pages deploy

# Lint/Type-check
npx tsc --noEmit
```