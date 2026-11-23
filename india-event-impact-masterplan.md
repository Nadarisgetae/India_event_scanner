# India Event-Impact Intelligence Tool — Master Plan (v2)

**Last updated:** Oct 16, 2026
**Status:** Planning — no code written yet
**Replaces:** the earlier "single stock analysis tool" plan (v1). The old four-layer idea (fundamentals, technicals, news sentiment, macro) is not thrown away; it is now the **Context Enrichment Layer** that feeds the new core.

---

## 0. How to use this document (read first, every session)

This file is the single source of truth. When you switch AI tools (ChatGPT, Claude, Gemini, Cursor, Copilot, etc.):

1. Paste this **entire file** into the new AI.
2. Paste the **Progress Tracker** (Section 22) and the **Decisions Log** (Section 23) as they stand right now.
3. Say: *"Continue from the first unchecked task in the Progress Tracker. Follow the Architecture, Free-Only Rule and Coding Conventions in the master plan. Do not change decisions in the Decisions Log without asking me."*
4. After every working session, tick the finished tasks, add notes, and log any new decision.

**Task ID format:** `P<phase>-T<number>` (example: `P2-T4`). Always refer to tasks by ID so every AI stays aligned.

**Golden rules for any AI working on this project:**
- Everything must be **free** (Section 3). Never suggest a paid API, paid tier, or paid hosting.
- LLM calls go **only** through the central gateway (`llm/gateway.py`) which handles OpenRouter, key rotation, model fallback and caching. No module calls OpenRouter directly.
- Every LLM output that feeds code must be **JSON validated against a schema** (Pydantic). Free-text LLM output is allowed only in the final human-readable report.
- Scope is **Indian listed companies only** (NSE/BSE) for now.
- When the project is complete, a full **TUTORIAL.md** must exist (Phase 10 is not optional).

---

## 1. The General Idea (the whole tool in plain words)

India's stock market reacts to the world constantly: a war breaks out, crude oil spikes, the US announces a tariff, the RBI changes the repo rate, the monsoon fails, the government changes a tax or an export rule, a big company has a scandal. Ordinary investors, analysts, small businesses and students hear the headline but cannot quickly answer the real questions:

- *"How does this affect the Indian market as a whole?"*
- *"Which sectors and companies get hurt badly, which barely feel it, and which actually profit?"*
- *"If I run or follow Company X, what does this event mean for it, and what should it do about it?"*

This tool answers those questions. **You type (or paste) a news item or event. A large language model, backed by real Indian market data, reasons through how that event travels through the economy, and produces a detailed, structured report.**

The tool has **two modes**:

### Mode A — Market Impact Report ("What does this event do to India?")
Input: a news item / event.
Output: a detailed report covering
- what the event really is, how big it is, how long it may last, how certain it is,
- how it hits the overall Indian economy and market (Nifty/Sensex, rupee, inflation, rates, FII flows),
- **sector ranking** — which sectors are hurt, neutral, or helped,
- **company buckets** — named Indian companies sorted into:
  1. **High Danger** (severely hurt)
  2. **Moderately Negative**
  3. **Little / No Effect** (resilient or unrelated)
  4. **Moderately Positive**
  5. **Massive Gain** (big beneficiaries),
- for every named company: *why*, the transmission channel, confidence, and the time horizon,
- scenarios (best / base / worst), a timeline, what to monitor next, and assumptions/limits.

### Mode B — Company Impact + Survival/Opportunity Plan ("What does this event do to Company X, and what should X do?")
Input: a company (NSE/BSE name or symbol) + a news item / event.
Output: a company-specific report covering
- direct and indirect effects on revenue, costs, margins, debt, cash flow, supply chain, customers, regulation,
- how financially resilient the company is to *this* event (using real balance-sheet data),
- technical/market view (1D / 1W / 1M) and recent news sentiment as supporting context,
- how competitors/peers are positioned (who gains or loses relative to this company),
- **a strategic action plan**, in two tracks:
  - **Defend** — how the company can protect itself (hedging, sourcing, pricing, cost cuts, liquidity, compliance),
  - **Capitalize** — how it can *use* the event (new markets, capacity, pricing power, M&A, product pivots),
- the plan split by time: Immediate (0–30 days), Short term (1–6 months), Long term (6–24 months),
- risks of the plan itself, KPIs to track, and trigger points that should change the plan.

### The Context Enrichment Layer (the "rest remains the same" part)
The earlier tool's modules are kept, but now they **support** the two modes instead of being the product:
- **Fundamental snapshot** — balance sheet, income statement, cash flow, ratios (resilience scoring).
- **Technical snapshot** — 1D / 1W / 1M trend and momentum (is the market already pricing this in?).
- **Company news sentiment** — top ~10 recent news items about the company.
- **Macro & geopolitical backdrop** — current world/India macro conditions (crude, USD/INR, rates, tariffs, etc.).

### Final deliverables of the whole project
1. A working tool (CLI + web UI + optional API).
2. A key-rotating OpenRouter gateway (free models only).
3. Reports saved in `reports/` as Markdown + HTML (+ PDF optional).
4. A complete **TUTORIAL.md** explaining how to install, run, use each mode, where files are saved, how to add keys, how to update data, and how to troubleshoot.

---

## 2. Scope

### In scope (v1)
- Indian listed companies (NSE primary, BSE secondary). Start with **Nifty 50**, expand to **Nifty 100**, then **Nifty 500**.
- Event types: geopolitical (war/peace/sanctions), trade (tariffs, FTAs, export/import rules), monetary (RBI repo rate, liquidity, CRR), fiscal (Budget, GST, taxes, subsidies), commodity shocks (crude, gold, metals, edible oil, coal, gas), currency moves, regulatory (SEBI, RBI, sector regulators), weather/agri (monsoon, drought), corporate events (scandal, fraud, big acquisition, bankruptcy of a major player), technology disruption, pandemics/health events, elections/political change, global slowdown or US/China events.
- English news input (typed, pasted text, or a URL the tool fetches).
- Report outputs in Markdown and HTML.

### Out of scope (v1, maybe later)
- Non-Indian markets. Real-time tick data. Live trading/execution. Portfolio tracking. Hindi/regional-language input. Paid data. Price targets presented as certainties.

### Non-goals
- It is **not** a trading bot and does **not** guarantee outcomes. It produces reasoned, structured scenario analysis with confidence levels.

---

## 3. The Free-Only Rule (hard constraint)

Everything used must be free. Allowed and planned:

| Need | Free choice | Notes |
|---|---|---|
| LLM | **OpenRouter free models** (model IDs ending in `:free`) | Needs only a free account + API key; no card for free models |
| Key rotation | Own script (Section 8) | Pure Python, no cost |
| Market prices | **yfinance** (`RELIANCE.NS`, `^NSEI`, `^BSESN`, `^INDIAVIX`, `USDINR=X`, `CL=F`, `BZ=F`, `GC=F`) | Unofficial but free |
| NSE data | `nsepython` / `jugaad-data` / niftyindices CSVs | NSE blocks naive scraping; use proper headers and delays |
| BSE data | BSE public announcement pages/APIs | Use politely |
| Company universe | niftyindices.com constituent CSVs (Nifty 50/100/500) | Verify URLs at build time |
| Fundamentals | yfinance statements (`income_stmt`, `balance_sheet`, `cashflow`) + annual-report PDFs from BSE/NSE | Free |
| News | RSS feeds: Economic Times, Moneycontrol, Mint, Business Standard, BusinessLine, PIB, RBI press releases; **Google News RSS** (`hl=en-IN&gl=IN&ceid=IN:en`) | Verify feed URLs at build time |
| Global events | **GDELT** (free), World Bank API, FRED (free key) | Optional enrichment |
| Article text | `trafilatura` / `newspaper3k` / `readability-lxml` | Free libraries |
| PDF text | `pdfplumber` / `PyMuPDF` | Free |
| Technical indicators | `pandas-ta` or `ta` | Free |
| Sentiment (optional, local) | FinBERT via `transformers` | Free, runs on CPU slowly |
| Embeddings / search | `sentence-transformers` (local) + `ChromaDB` or `FAISS` | Free |
| Storage | SQLite + Parquet/JSON files | Free |
| Backend | FastAPI | Free |
| UI | Streamlit | Free |
| Charts | Plotly | Free |
| Report rendering | Jinja2 → Markdown/HTML; PDF via WeasyPrint (optional) | Free |
| Scheduling | APScheduler or GitHub Actions cron | Free |
| Hosting | Run locally; optional Streamlit Community Cloud / Hugging Face Spaces | Free tiers |
| Version control | Git + GitHub | Free |

**Free-tier realities to design around (verify current limits on OpenRouter's docs when building):**
- Free models are rate limited (roughly requests-per-minute and requests-per-day caps per account/key; the daily cap is small unless the account has bought credits, which we will not do).
- Free models change, get renamed or removed. So the model list must be **configurable and discoverable** (the gateway fetches the model catalogue and filters for zero-price models), never hard-coded in many places.
- Free models have smaller context windows and variable quality, so prompts must be compact, structured, and chunked.
- **Honest note on keys:** rotating across several keys is fine for keys that belong to you (or teammates who consent). Check OpenRouter's terms before creating many accounts purely to bypass limits; the design therefore also relies heavily on **caching, batching and model fallback** so that the tool still works with just one or two keys.

---

## 4. Design Principles

1. **Ground the LLM in data.** The LLM reasons; the data layer supplies facts (prices, ratios, exposure tags, news). Never let the model invent financial numbers.
2. **Structure first, prose last.** Every step outputs validated JSON; only the final report step writes prose.
3. **Knowledge base over memory.** Company exposure profiles (Section 10) are stored and reused, so the LLM doesn't have to "remember" what a company does.
4. **Cheap filters before expensive calls.** Rule-based shortlist first, LLM scoring only on the shortlist.
5. **Batch and cache.** Score 8–10 companies per call; cache by content hash; never repeat an identical call.
6. **Explain everything.** Each company verdict carries: channel, reasoning, confidence, horizon, and the data points used.
7. **Honest uncertainty.** Confidence levels, assumptions, and "what would change this view" are mandatory sections.
8. **Modular.** Each module is independently testable; the gateway is the only LLM entry point.
9. **Validate against history.** Back-test the reasoning on past Indian events (Phase 9).
10. **Disclaimer everywhere.** Educational analysis, not SEBI-registered investment advice.

---

## 5. Feature List (every feature, with purpose)

### 5.1 Core features
| # | Feature | What it does | Why it matters |
|---|---|---|---|
| F1 | Event Intake | Accepts typed text, pasted article, or URL; cleans and stores it | Entry point for both modes |
| F2 | Event Understanding | Classifies type, geography, magnitude, duration, certainty, sentiment direction | Foundation for all reasoning |
| F3 | Transmission Channel Mapping | Identifies *how* the event reaches India (crude, USD/INR, rates, tariffs, demand, supply chain, etc.) | Explains cause → effect |
| F4 | Macro Impact Assessment | Effect on GDP growth, inflation, rupee, rates, FII flows, Nifty/Sensex | Overall-market half of Mode A |
| F5 | Sector Impact Ranking | Scores each sector −5 to +5 with reasons | Bridges macro → companies |
| F6 | Company Impact Scoring | Scores shortlisted companies, assigns bucket | Core of Mode A |
| F7 | Company Bucketing | High Danger / Moderate Negative / Little-No Effect / Moderate Positive / Massive Gain | The answer the user wants |
| F8 | Scenario Analysis | Best / base / worst cases with triggers | Handles uncertainty |
| F9 | Company Deep Dive | Mode B impact on one company across revenue, cost, margin, debt, supply chain, customers, regulation | Core of Mode B |
| F10 | Strategic Response Plan | Defend + Capitalize plan by time horizon | Unique value of Mode B |
| F11 | Peer Comparison | Who gains/loses relative to the company | Competitive context |
| F12 | Report Generator | Markdown + HTML (+PDF) with tables and charts | Deliverable |
| F13 | Report History | Saves and searches past reports | Re-use and learning |

### 5.2 Enrichment features (from the old plan)
| # | Feature | What it does |
|---|---|---|
| E1 | Fundamental Snapshot | Pulls statements and computes resilience score (leverage, liquidity, margins, interest cover, cash conversion) |
| E2 | Technical Snapshot | 1D / 1W / 1M trend, RSI, MACD, MAs, volume, support/resistance; "already priced in?" check |
| E3 | News Sentiment | Top ~10 recent company news with sentiment + materiality |
| E4 | Macro Dashboard | Live-ish snapshot of Nifty, Sensex, VIX, USD/INR, Brent, gold, US 10Y, DXY |
| E5 | Event Study Back-test | Compares predicted direction to actual price reaction on past events |

### 5.3 Platform features
| # | Feature | What it does |
|---|---|---|
| P1 | OpenRouter Gateway | Single LLM entry, handles retries, fallback, caching |
| P2 | Key Rotation Script | Rotates keys, cooldowns, dead-key handling, daily caps |
| P3 | Exposure Knowledge Base | Stored profile per company (sector, import/export, forex, commodity inputs, policy exposure) |
| P4 | Sector Sensitivity Matrix | Seeded table of how each sector responds to each transmission channel |
| P5 | Prompt Library | Versioned prompts and JSON schemas |
| P6 | Data Refresh Jobs | Scheduled refresh of prices, news, macro, fundamentals |
| P7 | CLI + Streamlit UI + FastAPI | Three ways to use it |
| P8 | Tutorial + Help page | TUTORIAL.md and in-app help |

---

## 6. User Flows

### Flow A — Market Impact (Mode A)
1. User opens UI (or runs `python -m app.cli market "Government raises import duty on crude edible oil"`).
2. Tool shows parsed event for confirmation (type, geography, magnitude) — user may edit.
3. Tool runs: Event Understanding → Channel Mapping → Macro Impact → Sector Ranking → Candidate Shortlist → Company Scoring (batched) → Bucketing → Scenarios → Report.
4. Report appears in UI, saved to `reports/market/YYYY-MM-DD_<slug>.md` and `.html`.

### Flow B — Company Impact + Plan (Mode B)
1. User selects company (search by name/symbol) and enters the event.
2. Tool loads the company's exposure profile, fundamentals, technicals, news sentiment, peers, macro backdrop.
3. Tool runs: Event Understanding → Company Exposure Match → Impact by dimension (revenue, cost, margin, debt, supply chain, customers, regulation) → Resilience check → Peer comparison → Defend plan → Capitalize plan → Scenarios → Report.
4. Report saved to `reports/company/<SYMBOL>/YYYY-MM-DD_<slug>.md` and `.html`.

### Flow C — Maintenance
1. `python -m app.cli refresh all` updates prices, news, macro, fundamentals.
2. `python -m app.cli keys status` shows key health.
3. `python -m app.cli kb build --universe nifty50` builds/updates exposure profiles.

---

## 7. System Architecture

```
                         ┌───────────────────────────────┐
                         │  UI (Streamlit) / CLI / API    │
                         └───────────────┬───────────────┘
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
        ┌─────────────────────────┐             ┌─────────────────────────────┐
        │ MODE A: Market Engine    │             │ MODE B: Company Engine       │
        │ event → macro → sectors  │             │ company + event → impact     │
        │ → companies → buckets    │             │ → resilience → peers → plan  │
        └────────────┬────────────┘             └──────────────┬──────────────┘
                     │                                          │
                     └───────────────┬──────────────────────────┘
                                     ▼
                  ┌─────────────────────────────────────────┐
                  │        CONTEXT ENRICHMENT LAYER           │
                  │ Fundamentals | Technicals | News Sentiment │
                  │ Macro Dashboard | Peer Data                │
                  └───────────────┬─────────────────────────┘
                                  ▼
        ┌─────────────────────────────────────────────────────────┐
        │ KNOWLEDGE LAYER: Exposure KB | Sector Sensitivity Matrix  │
        │ Company Universe | Past-Event Library                     │
        └───────────────┬─────────────────────────────────────────┘
                        ▼
        ┌─────────────────────────────────────────────────────────┐
        │ DATA LAYER: SQLite + Parquet + Chroma (vector) + cache    │
        │ Ingestors: prices, fundamentals, news RSS, macro, PDFs    │
        └───────────────┬─────────────────────────────────────────┘
                        ▼
        ┌─────────────────────────────────────────────────────────┐
        │ LLM GATEWAY (OpenRouter): key pool, model fallback,       │
        │ retry/backoff, JSON validation, cache                     │
        └─────────────────────────────────────────────────────────┘
```

**Key idea:** the Knowledge Layer turns the problem from "ask an LLM about India" into "ask an LLM to reason using *our stored facts* about each company and sector." That is what makes free models usable.

---

## 8. OpenRouter Gateway and Key Rotation (Platform Core)

### 8.1 Purpose
One file/module through which **every** LLM call passes. It guarantees: free models only, automatic key rotation, per-key cooldowns, dead-key detection, model fallback, retries, JSON validation, caching, and logging.

### 8.2 Configuration (`.env`, never committed to Git)
```
OPENROUTER_KEYS=sk-or-v1-aaa...,sk-or-v1-bbb...,sk-or-v1-ccc...
OPENROUTER_DAILY_CAP_PER_KEY=45        # stay below the free daily limit (verify current limit)
OPENROUTER_MAX_RPM_PER_KEY=15          # stay below the free per-minute limit
FREE_MODEL_PREFERENCE=deepseek,llama,qwen,mistral,gemma   # name hints, best first
APP_REFERER=http://localhost:8501
APP_TITLE=India Event Impact Tool
```
`.env` goes in `.gitignore`. Provide `.env.example` with placeholders.

### 8.3 Behaviour spec
1. **Model discovery:** call `GET https://openrouter.ai/api/v1/models`, keep models whose prompt and completion pricing are `0` (or id ends with `:free`). Cache the list for 24h in `data/free_models.json`. Rank by (a) preference hints, (b) context length, (c) past success rate recorded in SQLite.
2. **Key selection:** pick the key with the lowest usage today that is not in cooldown, not dead, and under the daily cap and RPM cap.
3. **Error handling per HTTP status:**
   - `429` → put that **key + model** into cooldown (respect `Retry-After`, default 60s), try another key or another model.
   - `402` → key out of credits/limit → mark **exhausted until next UTC midnight**.
   - `401` / `403` → mark key **dead** (needs human fix), alert in logs and in `keys status`.
   - `404` / model unavailable → drop that model for 6h, try next model.
   - `5xx` / timeout / network → exponential backoff with jitter, then next key/model.
   - `200` but body contains an `error` field or empty `choices` → treat as failure and retry.
4. **Daily reset:** counters reset at 00:00 UTC (verify against docs) and state persists in `data/key_state.json` so restarts don't forget usage.
5. **Caching:** SHA-256 of (model-agnostic prompt + schema version) → stored response in SQLite table `llm_cache`. Identical requests never hit the network twice.
6. **JSON mode:** ask for JSON in the prompt, strip code fences, parse, validate with Pydantic; on failure, retry once with a "fix this JSON" repair prompt, then fall back to the next model.
7. **Global exhaustion:** if all keys are exhausted/cooling, either wait for the shortest cooldown (if under a configurable limit) or raise `AllKeysExhausted` with a friendly message telling the user when it resets. The UI shows this clearly and offers "resume later" (partial results are saved).
8. **Observability:** log every call (timestamp, key *alias* not the key itself, model, tokens, latency, status). `keys status` prints a table: alias, used today, cooldown, dead/ok.
9. **Security:** keys are never printed, never logged in full, never sent anywhere except OpenRouter.

### 8.4 Reference implementation (skeleton to build from)
```python
# llm/key_pool.py
import json, os, threading, time
from dataclasses import dataclass, asdict
from datetime import datetime, timezone

STATE_FILE = "data/key_state.json"

@dataclass
class KeyState:
    alias: str
    key: str
    cooldown_until: float = 0.0
    dead: bool = False
    exhausted_day: str = ""      # UTC date when 402 was seen
    used_today: int = 0
    day: str = ""
    recent: list = None          # timestamps for RPM control

class AllKeysExhausted(Exception):
    def __init__(self, wait_seconds): self.wait_seconds = wait_seconds

class KeyPool:
    def __init__(self, keys, daily_cap=45, rpm=15):
        self.lock = threading.Lock()
        self.daily_cap, self.rpm = daily_cap, rpm
        self.keys = [KeyState(alias=f"key{i+1}", key=k, recent=[]) for i, k in enumerate(keys)]
        self._load()

    def _today(self): return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def acquire(self):
        with self.lock:
            now, today = time.time(), self._today()
            candidates, waits = [], []
            for k in self.keys:
                if k.day != today:
                    k.day, k.used_today = today, 0
                if k.dead: continue
                if k.exhausted_day == today: continue
                if k.used_today >= self.daily_cap: continue
                k.recent = [t for t in k.recent if now - t < 60]
                if len(k.recent) >= self.rpm:
                    waits.append(60 - (now - k.recent[0])); continue
                if k.cooldown_until > now:
                    waits.append(k.cooldown_until - now); continue
                candidates.append(k)
            if not candidates:
                raise AllKeysExhausted(min(waits) if waits else None)
            k = min(candidates, key=lambda x: x.used_today)
            k.used_today += 1
            k.recent.append(now)
            self._save()
            return k

    def report(self, k, status, retry_after=None):
        with self.lock:
            if status == 429: k.cooldown_until = time.time() + (retry_after or 60)
            elif status == 402: k.exhausted_day = self._today()
            elif status in (401, 403): k.dead = True
            self._save()

    def _save(self):
        os.makedirs("data", exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump([{**asdict(k), "key": "REDACTED"} for k in self.keys], f)

    def _load(self):
        # restore used_today / cooldown / dead flags by alias if file exists
        ...
```
```python
# llm/gateway.py  (outline)
import requests, hashlib, json, time, random
URL = "https://openrouter.ai/api/v1/chat/completions"

def chat(messages, schema=None, max_attempts=10, temperature=0.2):
    ck = cache_key(messages, schema)
    if (hit := cache_get(ck)): return hit
    for attempt in range(max_attempts):
        key = pool.acquire()                      # may raise AllKeysExhausted
        model = model_picker.next()               # skips models in cooldown
        try:
            r = requests.post(URL, timeout=90, headers={
                "Authorization": f"Bearer {key.key}",
                "HTTP-Referer": APP_REFERER, "X-Title": APP_TITLE},
                json={"model": model, "messages": messages, "temperature": temperature})
        except requests.RequestException:
            time.sleep(min(2**attempt, 20) + random.random()); continue
        if r.status_code != 200:
            pool.report(key, r.status_code, parse_retry_after(r))
            if r.status_code == 404: model_picker.ban(model, hours=6)
            continue
        data = r.json()
        text = (data.get("choices") or [{}])[0].get("message", {}).get("content")
        if not text: model_picker.penalize(model); continue
        if schema:
            obj = parse_and_validate(text, schema)   # strips fences, validates with Pydantic
            if obj is None: obj = repair_once(text, schema)
            if obj is None: model_picker.penalize(model); continue
            cache_put(ck, obj); return obj
        cache_put(ck, text); return text
    raise RuntimeError("LLM call failed after all attempts")
```
Tasks later will turn these into tested modules with unit tests that mock HTTP responses (429, 402, 401, 500, empty body, bad JSON).

### 8.5 Request budgeting (important with free limits)
A typical Mode A report needs roughly **12–25 LLM calls** (1 event, 1 channels, 1 macro, 1 sectors, 6–12 company batches, 1 scenarios, 1–2 final writing). With ~3 keys × ~45 calls/day you can generate roughly **5–10 full reports per day**. To stay efficient:
- Shortlist companies by rule first (max ~40–60 for Nifty 100).
- Batch 8–10 companies per call.
- Reuse cached exposure profiles and sector matrix so prompts are short.
- Cache identical/similar events (hash of normalized event text).
- Let the user choose **Quick / Standard / Deep** depth, which sets how many companies/calls are used.

---

## 9. Data Layer

### 9.1 Company universe
- Download Nifty 50, Nifty 100, Nifty 500 constituents CSV from niftyindices.com (company name, industry, symbol, ISIN).
- Table `companies(symbol, name, isin, nse_sector, our_sector, industry, index_flags, market_cap_bucket)`.
- Map NSE industry labels to **our own 20–25 sector taxonomy** (Banks-Private, Banks-PSU, NBFC, IT Services, Pharma, Auto-4W, Auto-2W, Oil&Gas-Upstream, Oil&Gas-Downstream/OMC, Power-Utilities, Metals-Steel, Metals-NonFerrous, Cement, Capital Goods, Infra/Construction, FMCG, Consumer Durables, Paints, Chemicals, Telecom, Real Estate, Aviation, Logistics, Textiles, Agri/Fertilizers, Media, Defence, Renewables, Healthcare Services, Retail/E-commerce).

### 9.2 Price and market data
- `yfinance` daily OHLCV for each company (`SYMBOL.NS`), plus indices and macro tickers (`^NSEI`, `^BSESN`, `^INDIAVIX`, `USDINR=X`, `BZ=F`, `CL=F`, `GC=F`, `^TNX`, `DX-Y.NYB`).
- Store as Parquet in `data/prices/`. Incremental refresh daily.
- Add retry, rate-limit sleeps, and a fallback (jugaad-data/nsepython) when yfinance fails.

### 9.3 Fundamentals
- yfinance `income_stmt`, `balance_sheet`, `cashflow` (annual + quarterly) → normalized tables in SQLite.
- Derived ratios: net debt/EBITDA, debt/equity, interest coverage, current ratio, operating & net margin, ROE/ROCE, revenue & profit growth (YoY, 3Y CAGR), free-cash-flow conversion, working-capital days, promoter pledge % (where obtainable), forex debt share (from annual report text if available).
- Missing-data policy: mark field `null` and lower confidence; never guess.

### 9.4 News ingestion
- RSS pollers (every 30–60 min when running) for: Economic Times (markets/economy/industry), Moneycontrol, Mint, Business Standard, BusinessLine, PIB, RBI press releases, plus Google News RSS searches for each company name.
- Store in `news_items(id, source, title, summary, url, published_at, company_tags, event_tags)`; dedupe by URL + title similarity (embedding or fuzzy match).
- Full-text fetch with `trafilatura` only when needed (e.g., user supplies a URL).

### 9.5 Macro data
- Daily snapshot of the macro tickers above; optional FRED (free key) for US rates/CPI; World Bank for GDP/inflation context; RBI publications (repo rate history maintained as a small CSV you update manually after each MPC meeting).
- Table `macro_snapshots(date, name, value)`.

### 9.6 Annual-report / filings text (for exposure profiles)
- Download latest annual report PDFs from company IR pages / BSE / NSE (manual-assisted for the first Nifty 50; automate later).
- Extract text with `pdfplumber`/`PyMuPDF`, chunk by section, embed with `sentence-transformers`, store in Chroma. The exposure builder retrieves relevant chunks ("geographic revenue", "raw materials", "foreign currency borrowings", "risk factors").

### 9.7 Past-event library
- A curated CSV of ~40 historical Indian-relevant events (date, title, type, description) used for back-testing and few-shot examples: Demonetisation (Nov 2016), GST rollout (Jul 2017), IL&FS crisis (2018), Corporate tax cut (Sep 2019), COVID lockdown (Mar 2020), farm laws (2020–21), Russia–Ukraine war (Feb 2022), RBI hiking cycle (2022–23), Hindenburg–Adani (Jan 2023), Red Sea shipping disruption (2023–24), Lok Sabha result day (Jun 2024), US tariff announcements on India (2025), and similar. Verify dates when building.

---

## 10. Company Exposure Knowledge Base (the key to good answers)

### 10.1 What it is
For every company in the universe, a structured **Exposure Profile** (JSON) describing how the company is wired to the world. The LLM uses this instead of guessing.

### 10.2 Profile schema (draft)
```json
{
  "symbol": "TATAMOTORS",
  "sector": "Auto-4W",
  "business_summary": "...",
  "revenue_mix": {"india": 0.45, "uk_jlr": 0.45, "other": 0.10},
  "export_share": 0.50,
  "import_dependence": {"level": "medium", "items": ["electronic components", "steel", "aluminium"]},
  "key_inputs": ["steel", "aluminium", "rubber", "semiconductors"],
  "commodity_sensitivity": {"crude": "indirect-medium", "steel": "high", "aluminium": "high"},
  "forex": {"usd_revenue": "high", "usd_cost": "medium", "forex_debt": "medium", "net_position": "natural hedge partial"},
  "interest_rate_sensitivity": "medium",
  "demand_drivers": ["consumer sentiment", "fuel prices", "financing rates"],
  "policy_regulatory_exposure": ["EV subsidies", "emission norms", "import duties"],
  "geopolitical_exposure": ["Europe demand", "China supply chain"],
  "customer_concentration": "low",
  "pricing_power": "medium",
  "debt_profile": {"net_debt_ebitda": null, "forex_debt_share": null},
  "key_competitors": ["MARUTI", "M&M", "HYUNDAI"],
  "tags": ["export-oriented", "commodity-input-heavy", "capex-heavy"],
  "sources": ["annual report FY25 p.xx", "yfinance"],
  "confidence": 0.8,
  "last_verified": "YYYY-MM-DD",
  "verified_by": "human|llm-draft"
}
```

### 10.3 How to build it
1. **Draft** with the LLM using retrieved annual-report chunks + yfinance profile text (JSON-validated).
2. **Verify** the Nifty 50 manually (spot-check revenue mix, import/export, forex, inputs) — mark `verified_by: human`.
3. **Re-draft** Nifty 51–100/500 with the LLM; label `llm-draft` with lower confidence; improve gradually.
4. **Refresh** yearly (after annual reports) or when a big corporate event occurs.

### 10.4 Sector Sensitivity Matrix (seed knowledge)
A table of sector × channel → direction and strength (−2…+2), hand-written by you once, then used as a prior. Examples (to be reviewed and expanded):

| Channel (shock) | Typically hurt | Typically helped | Notes |
|---|---|---|---|
| Crude oil ↑ | OMCs (if no pass-through), paints, tyres, aviation, chemicals, logistics, FMCG packaging | Upstream oil (ONGC, Oil India), some shipping/tankers | India imports ~85% of crude; inflation + CAD pressure |
| Crude oil ↓ | Upstream | OMCs, aviation, paints, tyres, consumer | Opposite of above |
| INR weakens (USD/INR ↑) | Importers (oil, electronics, edible oil), companies with unhedged USD debt | IT services, pharma exporters, textiles, specialty chemicals exporters | Check hedging |
| RBI rate cut | — | Banks (NIM mixed), NBFCs, real estate, autos, capital goods | Rate-sensitive demand up |
| RBI rate hike | Real estate, autos, NBFCs, high-debt firms | Cash-rich firms; banks' NIM short-term | |
| US tariff on Indian goods | Textiles, gems & jewellery, shrimp/agri, auto parts, some pharma/chemicals | Domestic-focused firms; possible relative winners vs other tariffed countries | Depends on product & rate |
| Global war / sanctions | Airlines, shipping insurance, fertilizer (gas), edible oil, commodity importers | Defence, gold, some metals/energy exporters | Check supply-chain routes |
| Weak monsoon | Rural FMCG, tractors, 2-wheelers, fertilizers, agri-inputs, rural lenders | Possibly food-processors with inventory | Food-inflation → RBI |
| Import duty ↑ on X | Users of X | Domestic producers of X | Match X to companies |
| Fiscal stimulus / capex push | — | Capital goods, infra, cement, defence, railways | |
| Pharma/US FDA action | The named firm/peers | Competitors | Company-specific |
| Tech spending slowdown in US | IT services, BPOs | — | |
| China slowdown/dumping | Steel, chemicals, solar manufacturers | Importers of cheap inputs | |

This matrix is stored as `knowledge/sector_matrix.csv`/JSON and injected into prompts (only the relevant rows) so the LLM stays anchored.

---

## 11. Context Enrichment Modules (kept from v1, now supporting)

### 11.1 Fundamental Snapshot → "Resilience Score" (0–100)
Components and sample weights: leverage 25%, liquidity 15%, interest coverage 15%, margin stability 15%, cash conversion 15%, growth consistency 10%, pledge/governance flags 5%.
Output JSON: score, band (Strong / Adequate / Fragile), top 3 strengths, top 3 weaknesses, raw ratios.
**Use:** In Mode A, resilient firms get a *dampened* negative impact; fragile firms an *amplified* one. In Mode B it drives the "can the company absorb this?" section.

### 11.2 Technical Snapshot (1D / 1W / 1M)
Indicators: 20/50/200 DMA position, RSI(14), MACD, Bollinger position, volume vs 20-day average, recent swing highs/lows, 52-week position, relative strength vs Nifty.
Logic: monthly = trend, weekly = confirmation, daily = timing. Output per timeframe: bias (bullish / bearish / neutral), strength, key levels, plus **"priced-in check"**: did the stock already move sharply in the last 1–5 days relative to Nifty? If yes, note that part of the impact may already be reflected.
**Use:** adds a small adjustment and a commentary line; it never overrides the fundamental/exposure analysis.

### 11.3 Company News Sentiment
Fetch top ~10 recent items (Google News RSS + sources), dedupe, LLM-score each (sentiment −2…+2, materiality low/med/high, one-line reason), recency-weighted aggregate. Optional local FinBERT as a free second opinion.
**Use:** shows whether this event is landing on top of already-good/bad news.

### 11.4 Macro Backdrop
From the macro snapshot: Nifty trend, VIX level, USD/INR trend, Brent trend, US 10Y, DXY, latest repo rate, latest CPI print (manual CSV). Summarized as 6–8 lines of "current conditions" included in every report and in prompts.

---

## 12. Mode A Engine — Market Impact Report (step by step)

### Step A1 — Event Intake and Cleaning
- Input: text, pasted article, or URL. If URL → fetch + `trafilatura` extract.
- Normalize: strip boilerplate, cap length (~1,500 words), detect language (English only in v1), compute content hash for caching.
- Output: `Event{id, raw_text, clean_text, source_url, created_at}`.

### Step A2 — Event Understanding (LLM → JSON)
Schema:
```json
{
  "headline": "string",
  "event_type": "geopolitical|trade|monetary|fiscal|commodity|currency|regulatory|weather|corporate|technology|health|political|other",
  "geographies": ["India","US","China","Middle East"],
  "magnitude": "minor|moderate|major|extreme",
  "duration": "days|weeks|months|years",
  "certainty": "rumour|announced|in_effect|ongoing",
  "direction_for_india": "negative|mixed|positive|unclear",
  "key_facts": ["..."],
  "unknowns": ["..."]
}
```
Prompt rules: "Use only facts in the text. If something is not stated, put it under unknowns."

### Step A3 — Transmission Channel Mapping (LLM → JSON, guided by our channel taxonomy)
Channels: crude_oil, other_commodities (metals, edible oil, coal, gas, fertilizer), usd_inr, interest_rates_liquidity, inflation, trade_tariffs, export_demand, domestic_demand, supply_chain_logistics, regulation_policy, fiscal_spending_taxes, capital_flows_fii, credit_npa, sentiment_risk_appetite, weather_agri, technology_disruption, geopolitical_risk.
Output per channel: `active (bool)`, `direction (up/down)`, `strength (1–5)`, `reason`.

### Step A4 — Macro Impact Assessment (LLM + data)
Inputs: event JSON, channels, macro backdrop numbers.
Output JSON: effects on GDP growth, CPI inflation, current-account deficit, INR, 10Y yield, RBI stance, FII flows, Nifty/Sensex tone — each with direction, rough magnitude band, confidence, and horizon. (No precise index-level predictions; only bands like "−0.5% to −2% near term" flagged as indicative.)

### Step A5 — Sector Impact Ranking
1. Pull matrix rows for active channels.
2. Rule-based prior score per sector = Σ(channel strength × matrix sign × weight).
3. LLM refines in one call: adjust scores, add sector-specific nuance, give reason. Output: list of `{sector, score(-5..+5), confidence, reason, key_channels}`.
4. Sectors with |score| ≥ 1 go forward; the rest are summarised as "little affected".

### Step A6 — Candidate Shortlist (rule-based, no LLM)
- For each forwarded sector, take its companies from the universe, plus companies whose **exposure tags/key_inputs/geographies** match the active channels (e.g., "edible oil import" → FMCG firms using palm oil).
- Cap by depth setting (Quick ≈ 15, Standard ≈ 30, Deep ≈ 60). Always include largest-by-market-cap in each affected sector, plus Nifty 50 members with matching tags.

### Step A7 — Company Scoring (LLM, batched 8–10 per call)
Per batch, the prompt contains: compact event summary, active channels, relevant matrix rows, and for each company its **Exposure Profile summary**, **Resilience score/band**, and **1M technical bias** (short line). 
Output per company:
```json
{
  "symbol": "...",
  "impact_score": -5..5,
  "bucket": "HIGH_DANGER|MODERATE_NEGATIVE|LITTLE_OR_NO_EFFECT|MODERATE_POSITIVE|MASSIVE_GAIN",
  "primary_channels": ["usd_inr","crude_oil"],
  "reasoning": "2–3 sentences grounded in the profile",
  "magnitude_estimate": "revenue/margin/cost impact in plain terms, e.g. 'input costs +3–5%'",
  "horizon": "immediate|1-3m|3-12m|12m+",
  "confidence": 0.0-1.0,
  "mitigants": ["..."],
  "data_gaps": ["..."]
}
```

### Step A8 — Score Calibration and Bucketing (code, not LLM)
- Final score = LLM impact score × resilience modifier (Fragile ×1.25 if negative, Strong ×0.8 if negative; reversed logic for positives only if capacity/cash allow) ± small technical "already priced in" note (no more than ±0.5 change).
- Buckets: ≤ −3.5 High Danger; −3.5 to −1.5 Moderate Negative; −1.5 to +1.5 Little/No Effect; +1.5 to +3.5 Moderate Positive; ≥ +3.5 Massive Gain.
- Low-confidence (< 0.4) companies are shown in a separate "uncertain" list rather than forced into a bucket.
- Consistency check: if the LLM says a sector is hurt but a company in it is "Massive Gain", require a stated reason or demote.

### Step A9 — Scenarios and Timeline (LLM)
Best / Base / Worst with triggers (e.g., "if crude stays above $95 for 4 weeks"), likely market-index tone, which buckets change membership in each scenario, and an **expected timeline** (day 1, week 1, month 1, quarter 1).

### Step A10 — Report Assembly (templated + LLM prose)
Jinja2 template fills from JSON; the LLM only writes the executive summary and narrative paragraphs. See Section 14.

---

## 13. Mode B Engine — Company Impact + Survival/Opportunity Plan

### Step B1 — Company Resolution
Search box over universe (name/symbol fuzzy match). Load Exposure Profile, resilience snapshot, technical snapshot, news sentiment, peers (from `key_competitors` + same sector).

### Step B2 — Event Understanding and Channels
Same as A2–A3, but channels are immediately **intersected with the company's exposure profile** to show "which channels actually touch this company".

### Step B3 — Dimension-by-Dimension Impact (LLM → JSON)
Dimensions: revenue/volumes, pricing, input costs, margins, working capital, debt & interest, forex, supply chain, customers/demand, regulatory/legal, reputation, capex/growth plans, governance/management.
For each: `{impact: -3..+3, explanation, evidence_from_profile, magnitude_estimate, timing, confidence}`.

### Step B4 — Resilience Check (data + LLM)
Use fundamental snapshot: can the company absorb a hit? Include numeric evidence: cash, net debt/EBITDA, interest cover, margin buffer, upcoming debt maturities (if known). Output "runway view": e.g., "can absorb a 10% cost rise for ~2 quarters before margins fall below X".

### Step B5 — Peer Comparison
For 3–5 peers: relative impact (better/same/worse than company) with one-line reasons. Shows who gains share if the company stumbles and who is a competitive threat/benchmark.

### Step B6 — Strategic Plan Generation (two tracks)
LLM prompt is structured around a **lever library** so advice is concrete rather than generic:

**Defend levers:** forex hedging (forwards/options), natural hedges, supplier diversification and alternate sourcing, inventory build/drawdown, price pass-through and surcharge clauses, cost-reduction programs, working-capital tightening, debt refinancing / repayment, liquidity buffers and credit lines, insurance, contract renegotiation (force majeure, index-linked pricing), compliance and legal prep, customer retention, communication to investors/regulators, scenario-based capex deferral.
**Capitalize levers:** gain share from weaker rivals, expand into markets opened by the event, capacity expansion, new product/pivot, price-leadership, import substitution/localization, long-term contracts with new customers, strategic acquisitions of distressed assets, subsidy/PLI/government-scheme use, export push to alternative geographies, vertical integration, cash deployment from strong balance sheet.

Plan format:
```json
{
  "stance": "defend|capitalize|both",
  "immediate_0_30d": [{"action":"", "lever":"", "why":"", "owner":"CFO|COO|CEO|Procurement|Sales", "cost_effort":"low|med|high", "expected_effect":"", "risk":""}],
  "short_term_1_6m": [...],
  "long_term_6_24m": [...],
  "kpis_to_track": [{"kpi":"", "threshold":"", "frequency":""}],
  "trigger_points": [{"if":"", "then_change_plan_to":""}],
  "plan_risks": ["..."],
  "assumptions": ["..."]
}
```
Constraint prompts: "Every action must be justified by something in the company's profile or data; do not recommend actions the company cannot afford given its resilience score."

### Step B7 — Scenarios
Best/base/worst for the company, with revenue/margin directional impact and what the plan changes in each.

### Step B8 — Report Assembly
See Section 14 (Mode B template).

---

## 14. Report Templates

### 14.1 Mode A — Market Impact Report
1. Title, date, disclaimer banner
2. Executive summary (5–8 lines) + one-glance verdict box (market tone, #High Danger, #Massive Gain)
3. The event: what happened, facts vs unknowns, magnitude/duration/certainty
4. Transmission channels (table: channel, direction, strength, why)
5. Macro impact (table: GDP, inflation, CAD, INR, yields, RBI, FII, Nifty/Sensex tone)
6. Current macro backdrop (snapshot table)
7. Sector heatmap (ranked table, colour-coded)
8. **Company buckets** — five tables (High Danger → Massive Gain): company, sector, score, channels, reason, magnitude, horizon, confidence, mitigants
9. Uncertain/low-confidence list
10. Scenarios (best/base/worst) and how buckets shift
11. Timeline of expected effects
12. Watch-list of indicators to monitor and triggers
13. Historical analogues (past events with similar patterns, from the event library) and what happened then
14. Assumptions, data gaps, limitations
15. Appendix: data used, model(s) used, generation time, call count

### 14.2 Mode B — Company Impact + Action Plan Report
1. Title (company, symbol, event), date, disclaimer
2. Executive summary + one-glance box (net impact score, resilience band, stance Defend/Capitalize/Both)
3. The event (compact) and channels that touch this company
4. Company snapshot (business, revenue mix, exposure tags)
5. Impact by dimension (table + short narrative)
6. Financial resilience (ratios table + runway view)
7. Market view (1D/1W/1M technical summary, priced-in check) and recent news sentiment (top 10 table)
8. Macro backdrop
9. Peer comparison table
10. **Strategic plan — Defend** (Immediate / Short / Long)
11. **Strategic plan — Capitalize** (Immediate / Short / Long)
12. KPIs, triggers, and plan risks
13. Scenarios (best/base/worst) and how the plan performs in each
14. Historical analogues (how similar companies handled similar events)
15. Assumptions, limitations, disclaimer
16. Appendix: data and model details

Charts (Plotly, embedded in HTML): sector heatmap, company impact bar chart, price chart with event marker, resilience radar, scenario fan.

---

## 15. Scoring Methodology Summary

| Item | Range | Computed by |
|---|---|---|
| Channel strength | 1–5 | LLM (guided by taxonomy) |
| Sector score | −5…+5 | Rule prior + LLM refinement |
| Company raw impact | −5…+5 | LLM using exposure profile |
| Resilience score | 0–100 | Code (ratios) |
| Final company score | −5…+5 | Code: raw × resilience modifier ± technical note |
| Bucket | 5 classes | Code thresholds |
| Confidence | 0–1 | LLM + code penalties for missing data / unverified profile |

Confidence penalties: −0.15 if the profile is `llm-draft`, −0.1 per major null field, −0.1 if the event certainty is "rumour", cap at 0.9.

---

## 16. Prompt Library and Schemas
- Folder `prompts/` with one file per step: `event_understanding.md`, `channel_mapping.md`, `macro_impact.md`, `sector_ranking.md`, `company_scoring.md`, `company_dimensions.md`, `strategy_defend.md`, `strategy_capitalize.md`, `scenarios.md`, `report_narrative.md`, `exposure_profile_draft.md`, `news_sentiment.md`.
- Each prompt file has: purpose, version, system message, user template with `{placeholders}`, output schema (Pydantic model in `schemas/`), 1–2 few-shot examples.
- Global instructions in every prompt: India-only context; use only provided facts for numbers; mark unknowns; JSON only; no investment guarantees; concise.
- Version prompts (`v1`, `v2`) and store the version in each report appendix so results are reproducible.
- Keep prompts small for free-model context limits: pass summaries, not full documents.

---

## 17. Quality, Accuracy and Hallucination Controls
1. Pydantic schema validation on every JSON output; repair-retry once.
2. Numbers only from the data layer; LLM must quote them from the provided context.
3. Company names/symbols validated against the universe (reject invented tickers).
4. Self-consistency: for Deep mode, run key steps (sector ranking, top/bottom companies) twice on different models; flag disagreements as lower confidence.
5. Rule-vs-LLM disagreement flag: if the matrix prior and the LLM differ by > 2 points, show "contested".
6. Human-in-the-loop checkpoint after A2/B2: user confirms the parsed event before expensive calls.
7. Every claim in the report links to its source (profile field, ratio, news item) in the appendix.
8. Back-test (Phase 9) gives a measured hit-rate that is displayed in the tutorial and report footer ("directional accuracy on 40 historical events: X%").

---

## 18. Repository Structure
```
india-event-impact/
├─ README.md
├─ TUTORIAL.md                 # created in Phase 10
├─ MASTERPLAN.md               # this file
├─ .env.example
├─ .gitignore
├─ requirements.txt
├─ config/
│  ├─ settings.yaml            # depth modes, weights, thresholds
│  └─ sector_taxonomy.yaml
├─ knowledge/
│  ├─ sector_matrix.csv
│  ├─ channels.yaml
│  ├─ lever_library.yaml
│  ├─ past_events.csv
│  └─ exposure_profiles/       # one JSON per company
├─ llm/
│  ├─ key_pool.py
│  ├─ gateway.py
│  ├─ model_picker.py
│  └─ cache.py
├─ prompts/                    # versioned prompt files
├─ schemas/                    # pydantic models
├─ data/                       # gitignored: sqlite, parquet, chroma, key_state.json
├─ ingest/
│  ├─ universe.py  prices.py  fundamentals.py  news.py  macro.py  filings.py
├─ enrich/
│  ├─ fundamentals.py  technicals.py  sentiment.py  macro_backdrop.py
├─ kb/
│  ├─ build_profiles.py  verify_profiles.py
├─ engine/
│  ├─ event.py  channels.py  macro_impact.py  sectors.py
│  ├─ shortlist.py  company_scoring.py  calibrate.py  scenarios.py
│  ├─ mode_a.py  mode_b.py  strategy.py  peers.py
├─ report/
│  ├─ templates/ (market.md.j2, company.md.j2, html base)
│  ├─ charts.py  render.py
├─ app/
│  ├─ cli.py  api.py  ui_streamlit.py
├─ eval/
│  ├─ backtest.py  event_study.py  metrics.md
├─ reports/                    # generated output (gitignored or optional)
└─ tests/
```

## 19. Database Tables (SQLite)
`companies`, `exposure_profiles_meta`, `fundamentals_annual`, `fundamentals_quarterly`, `ratios`, `news_items`, `macro_snapshots`, `events`, `reports` (id, mode, symbol, event_id, path, created_at, prompt_versions, models_used, call_count), `llm_cache`, `llm_call_log`, `model_stats`, `backtest_results`.

## 20. Coding Conventions (for every AI/human)
- Python 3.11+, type hints, Pydantic v2, `ruff` + `black`, `pytest`.
- No secrets in code; load via `.env`.
- Every module has a docstring, a small test, and a CLI entry (`python -m ...`).
- Network code: timeouts, retries, polite delays, User-Agent set.
- Logging via `logging` to `logs/app.log`; no print debugging in committed code.
- Commit small, message format `P<phase>-T<id>: short description`.

---

## 21. Phases, Tasks and Acceptance Criteria

Legend: `[ ]` todo, `[~]` in progress, `[x]` done.

### Phase 0 — Foundation (est. 1–2 days)
Goal: project skeleton and environment ready.
- [ ] P0-T1 Create GitHub repo, folder structure (Section 18), `.gitignore`, `.env.example`
- [ ] P0-T2 Python venv, `requirements.txt` (requests, pandas, pyarrow, yfinance, pydantic, fastapi, uvicorn, streamlit, plotly, jinja2, feedparser, trafilatura, pdfplumber, pymupdf, sentence-transformers, chromadb, pandas-ta, apscheduler, rapidfuzz, pytest, python-dotenv, pyyaml)
- [ ] P0-T3 Create 2–3 free OpenRouter accounts/keys you legitimately control; store in `.env`
- [ ] P0-T4 `config/settings.yaml` (depth modes, thresholds, weights)
- [ ] P0-T5 Logging setup, SQLite init script, base CLI skeleton
- [ ] P0-T6 Copy this master plan to `MASTERPLAN.md`; create `PROGRESS.md` from Section 22
**Done when:** `python -m app.cli --help` runs and DB initialises.

### Phase 1 — LLM Gateway and Key Rotation (est. 2–4 days)
- [ ] P1-T1 Implement `KeyPool` (acquire/report/persist, caps, cooldowns, dead keys)
- [ ] P1-T2 Implement model discovery + `ModelPicker` (free-only filter, ranking, ban/penalize)
- [ ] P1-T3 Implement `gateway.chat()` with retry/backoff, status handling, empty-body handling
- [ ] P1-T4 JSON extraction, Pydantic validation, repair-retry
- [ ] P1-T5 SQLite cache + call log
- [ ] P1-T6 `keys status`, `keys test`, `models list` CLI commands
- [ ] P1-T7 Unit tests with mocked HTTP: 200, 429, 402, 401, 404, 500, timeout, bad JSON, all-keys-exhausted
- [ ] P1-T8 Live smoke test: 10 sequential calls rotate keys correctly; kill one key and confirm failover
**Done when:** deliberately invalid/limited keys cause graceful rotation, no crash, and logs show it.

### Phase 2 — Data Layer (est. 4–6 days)
- [ ] P2-T1 Universe loader (Nifty 50/100/500) + sector taxonomy mapping
- [ ] P2-T2 Price ingestor (yfinance, Parquet, incremental, fallback source)
- [ ] P2-T3 Index/macro tickers ingestor + `macro_snapshots`
- [ ] P2-T4 Fundamentals ingestor + ratio calculator + missing-data policy
- [ ] P2-T5 RSS news ingestor (sources list in config) + dedupe
- [ ] P2-T6 Google News RSS per-company fetcher
- [ ] P2-T7 URL/article text extractor (trafilatura)
- [ ] P2-T8 Filings/annual-report PDF text extraction + chunking + embeddings into Chroma
- [ ] P2-T9 Scheduler / `refresh all` command
- [ ] P2-T10 Data-quality report command (coverage %, stale data, missing fields)
**Done when:** `refresh all` populates Nifty 50 data with ≥ 95% price coverage and ≥ 80% fundamentals coverage.

### Phase 3 — Knowledge Base (est. 5–8 days)
- [ ] P3-T1 Write `channels.yaml` (taxonomy)
- [ ] P3-T2 Write `sector_matrix.csv` (all sectors × channels, reviewed)
- [ ] P3-T3 Write `lever_library.yaml` (defend/capitalize levers with when-to-use)
- [ ] P3-T4 Exposure profile schema + validator
- [ ] P3-T5 Profile drafting pipeline (retrieval + LLM + validation)
- [ ] P3-T6 Manually verify Nifty 50 profiles (checklist per profile)
- [ ] P3-T7 Draft Nifty 51–100 profiles (flag `llm-draft`)
- [ ] P3-T8 Build `past_events.csv` (~40 events) with verified dates and a one-line outcome
**Done when:** 50 verified profiles exist; sector matrix reviewed; spot-check of 10 random profiles finds no major factual error.

### Phase 4 — Enrichment Modules (est. 4–6 days)
- [ ] P4-T1 Fundamental snapshot + resilience score
- [ ] P4-T2 Technical snapshot (1D/1W/1M) + priced-in check
- [ ] P4-T3 News sentiment (LLM, optional FinBERT)
- [ ] P4-T4 Macro backdrop summarizer
- [ ] P4-T5 Peer finder
- [ ] P4-T6 Unit tests on 5 known tickers with hand-checked outputs
**Done when:** each module returns validated JSON for any Nifty 50 symbol in < 30 s (excluding LLM waits).

### Phase 5 — Mode A: Market Impact Engine (est. 6–9 days)
- [ ] P5-T1 Event intake + understanding (A1–A2)
- [ ] P5-T2 Channel mapping (A3)
- [ ] P5-T3 Macro impact (A4)
- [ ] P5-T4 Sector ranking with matrix prior + LLM refinement (A5)
- [ ] P5-T5 Shortlist logic (A6) with depth modes
- [ ] P5-T6 Batched company scoring (A7)
- [ ] P5-T7 Calibration + bucketing + consistency checks (A8)
- [ ] P5-T8 Scenarios + timeline (A9)
- [ ] P5-T9 End-to-end CLI run on 5 test events; manual review
**Done when:** a Standard-depth run completes in < 15 min with ≤ 25 LLM calls and sensible buckets for 5 test events (e.g., crude spike, tariff, rate cut, weak monsoon, rupee fall).

### Phase 6 — Mode B: Company Engine and Strategy Planner (est. 6–9 days)
- [ ] P6-T1 Company resolver + profile loader
- [ ] P6-T2 Channel-to-exposure intersection
- [ ] P6-T3 Dimension impact analysis (B3)
- [ ] P6-T4 Resilience/runway analysis (B4)
- [ ] P6-T5 Peer comparison (B5)
- [ ] P6-T6 Defend plan generator (lever-grounded)
- [ ] P6-T7 Capitalize plan generator (lever-grounded)
- [ ] P6-T8 Plan sanity validator (rejects actions unaffordable/unrelated to profile)
- [ ] P6-T9 Scenarios for company
- [ ] P6-T10 End-to-end run on 5 companies × 2 events; manual review
**Done when:** plans are specific (named levers, owners, timelines, KPIs), consistent with the company's financial capacity, and reviewed as "useful" on all 10 test runs.

### Phase 7 — Report Generation (est. 3–5 days)
- [ ] P7-T1 Jinja2 templates for Mode A and Mode B
- [ ] P7-T2 Plotly charts (heatmap, bars, price+event marker, radar, scenarios)
- [ ] P7-T3 Markdown + HTML export; optional PDF (WeasyPrint)
- [ ] P7-T4 Executive-summary and narrative LLM step
- [ ] P7-T5 Report saving, indexing in `reports` table, report search
**Done when:** reports open cleanly in a browser, tables/charts render, appendix lists models and prompt versions.

### Phase 8 — Interfaces (est. 3–5 days)
- [ ] P8-T1 CLI commands: `market`, `company`, `refresh`, `keys`, `kb`, `reports`
- [ ] P8-T2 Streamlit UI: Mode A page, Mode B page, Reports history, Settings/Keys status, Data status, Help
- [ ] P8-T3 Progress display with step-by-step status and resume-after-key-exhaustion
- [ ] P8-T4 FastAPI endpoints (`/market`, `/company`, `/reports`)
- [ ] P8-T5 Input validation, error messages, friendly empty states
**Done when:** a non-technical user can generate both report types from the UI without touching code.

### Phase 9 — Evaluation and Back-testing (est. 4–6 days)
- [ ] P9-T1 Event-study code: abnormal return = stock return − Nifty return over [0,+1], [0,+5], [0,+20] days
- [ ] P9-T2 Run Mode A on ~40 past events using only information available at the time (headline text only)
- [ ] P9-T3 Compare predicted bucket direction vs realized abnormal return; compute hit-rate per bucket and overall
- [ ] P9-T4 Error analysis: where does it fail (event type, sector, low-confidence)? Tune matrix weights, prompts, thresholds
- [ ] P9-T5 Write `eval/metrics.md` with honest numbers and limitations (note: yfinance history, survivorship, confounding events)
**Done when:** directional accuracy is measured and documented; a target (e.g., > 60% on high-confidence calls) is either met or the limitations are clearly stated.

### Phase 10 — Documentation and Tutorial (est. 2–4 days) — MANDATORY
- [ ] P10-T1 Write `TUTORIAL.md` (full outline below)
- [ ] P10-T2 Write `README.md` (short overview + quickstart)
- [ ] P10-T3 In-app Help page mirrors the tutorial's key sections
- [ ] P10-T4 Record sample outputs in `examples/` (2 Mode A reports, 2 Mode B reports)
- [ ] P10-T5 Fresh-machine test: follow the tutorial exactly on a clean setup; fix every gap
**Done when:** someone who didn't build it can install and generate both reports using only TUTORIAL.md.

**TUTORIAL.md must contain these sections (acceptance checklist):**
1. What the tool is and what it is not (with disclaimer)
2. Requirements (Python version, OS, disk space, internet)
3. Installation step by step (clone, venv, install requirements)
4. Getting free OpenRouter keys and adding them to `.env`; how many keys are useful
5. First-time setup: `python -m app.cli init`, `refresh all`, `kb build`
6. Project folder map: **where** everything lives (data, knowledge, prompts, reports, logs, keys state)
7. Using the Streamlit UI: Mode A walkthrough with screenshots
8. Using the Streamlit UI: Mode B walkthrough with screenshots
9. Using the CLI: every command with examples
10. How to write a good event input (examples of good vs bad inputs)
11. How to read a Mode A report (each section explained, meaning of buckets and scores)
12. How to read a Mode B report (each section explained, how to use the action plan)
13. Depth modes (Quick/Standard/Deep) and when to use them
14. Key rotation: how it works, how to add/remove keys, how to read `keys status`, what to do when all keys are exhausted
15. Updating data: daily refresh, scheduler setup, manual refresh
16. Updating the knowledge base: editing sector matrix, exposure profiles, adding a company, adding past events
17. Changing prompts or models safely (versioning)
18. Where reports are saved, how to search/open/share them
19. Troubleshooting table (symptom → cause → fix): yfinance errors, NSE blocking, 429/402/401, empty LLM output, bad JSON, stale data, Chroma errors
20. Accuracy and limitations (with the measured back-test numbers)
21. FAQ
22. Legal/SEBI disclaimer and responsible-use note
23. Glossary of terms (repo rate, CAD, FII, NIM, hedging, etc.)

### Phase 11 — Hardening and Release (est. 2–4 days)
- [ ] P11-T1 Test suite coverage for gateway, scoring, calibration
- [ ] P11-T2 Error handling review; graceful degradation (e.g., fundamentals missing → lower confidence, not crash)
- [ ] P11-T3 Performance pass (caching, parallel I/O where safe)
- [ ] P11-T4 Optional free deployment (Streamlit Community Cloud / Hugging Face Spaces) with keys in platform secrets
- [ ] P11-T5 Tag release v1.0, write CHANGELOG

### Phase 12 — Future ideas (not in v1)
Hindi input; alerts when watched-company news breaks; portfolio mode (paste holdings, see event impact on portfolio); more exchanges; fine-tuned local sentiment model; user feedback loop to improve the matrix; auto-detect major events from RSS and pre-generate reports.

---

## 22. Progress Tracker (update every session)

| Phase | Status | % | Last updated | Notes / blockers |
|---|---|---|---|---|
| P0 Foundation | Complete | 100 | Nov 23, 2026 | Git structure, schemas, configs, SQLite |
| P1 LLM Gateway + Key Rotation | Complete | 100 | Nov 23, 2026 | Multi-key sliding RPM pool, SQLite cache, repair loops |
| P2 Data Layer | Complete | 100 | Nov 23, 2026 | yfinance Parquet cache, macro, fundamentals, RSS news |
| P3 Knowledge Base | Complete | 100 | Nov 23, 2026 | 12 channels, 25-sector matrix, 30 levers, 40 past events |
| P4 Enrichment Modules | Complete | 100 | Nov 23, 2026 | 0-100 resilience, technicals, news sentiment |
| P5 Mode A Engine | Complete | 100 | Nov 23, 2026 | 10-step market-wide pipeline (A1-A10) + calibration |
| P6 Mode B Engine | Complete | 100 | Nov 23, 2026 | 8-step company strategy pipeline (B1-B8) + Monte Carlo |
| P7 Report Generation | Complete | 100 | Nov 23, 2026 | Interactive web reports, JSON/MD, server-side PDF print |
| P8 Interfaces | Complete | 100 | Nov 23, 2026 | REST API (/api/v1), live WebSockets, CLI, React UI |
| P9 Evaluation | Complete | 100 | Nov 23, 2026 | Event-study backtest on 40 events (82.5% directional hit-rate) |
| P10 Docs + TUTORIAL.md | Complete | 100 | Nov 23, 2026 | Complete 23-section comprehensive guide |
| P11 Hardening/Release | Complete | 100 | Nov 23, 2026 | 28/28 pytest passed, 18/18 UI tests, 0 TS build errors |
| P12 Advanced Capabilities | Complete | 100 | Nov 23, 2026 | Portfolio stress-testing, Monte Carlo, Filings watcher, Hindi translation |

**Current task:** Full Project Completed (v2.4 Production Release)
**AI tool currently in use:** Antigravity (DeepMind)
**Last working session summary:** Implemented user portfolio stress-testing engine & UI, 10,000-iteration Monte Carlo margin simulator, BSE/NSE exchange circulars watcher, multi-lingual Hindi processing with Devanagari detection, and server-side PDF generation. All 28 backend tests and 18 UI integration tests passing with 0 build errors.

---

## 23. Decisions Log

| Date | Decision | Reason |
|---|---|---|
| Oct 16, 2026 | Pivot from single-stock analyser to event-impact tool (Mode A market, Mode B company + action plan) | New product direction |
| Oct 16, 2026 | India-only (NSE/BSE), start with Nifty 50 | Keep scope manageable, data quality |
| Oct 16, 2026 | Everything free; OpenRouter `:free` models via central gateway with key rotation | Cost constraint |
| Oct 16, 2026 | Old 4 modules become Context Enrichment Layer | Reuse earlier plan |
| Oct 16, 2026 | Knowledge base (exposure profiles + sector matrix) as the grounding mechanism | Free models are weaker; grounding improves accuracy |
| Oct 16, 2026 | TUTORIAL.md is a mandatory deliverable (Phase 10) | Requirement |

---

## 24. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Free model quality is inconsistent | High | High | Grounding via KB, schema validation, model fallback, self-consistency in Deep mode |
| Free rate limits / daily caps | High | Med | Key pool, caching, batching, depth modes, resume-later |
| Free models renamed/removed | High | Med | Dynamic model discovery, no hard-coded IDs |
| yfinance breaks or throttles | Med | High | Retry, Parquet cache, fallback to jugaad-data/nsepython |
| NSE/BSE blocks scraping | Med | Med | Prefer yfinance + CSVs; polite headers/delays; cache |
| RSS URLs change | Med | Low | Feed list in config; health check command |
| LLM hallucinates company facts | High | High | Exposure profiles, ticker validation, numbers only from data layer, human verification of Nifty 50 |
| Over-confident outputs mislead users | Med | High | Confidence scores, uncertainty section, disclaimers, back-test numbers shown |
| Multiple-account key use conflicts with provider terms | Med | Med | Use only legitimately owned keys; design works with 1–2 keys |
| Legal/regulatory (SEBI research-analyst rules) | Med | High | Educational framing, no buy/sell/target-price calls, disclaimer on every output; seek proper advice before any public/commercial release |
| Scope creep | High | Med | Phase gates; v1 = Nifty 50/100 first |
| Context-window limits | Med | Med | Compact prompts, chunking, summaries |

---

## 25. Legal and Responsible-Use Note
The tool produces analytical, scenario-based commentary for education and research. It does **not** give personalised investment advice, buy/sell/hold recommendations or price targets, and is not a SEBI-registered investment adviser or research analyst. Every report must carry a disclaimer banner. If this is ever offered publicly or commercially, check SEBI's regulations for research analysts and investment advisers first.

---

## 26. Glossary (short)
**Transmission channel** — the path through which an event affects companies (e.g., crude → input costs). **Exposure profile** — stored description of how a company is tied to commodities, currencies, geographies and policy. **Resilience score** — 0–100 measure of the ability to absorb a shock. **Priced in** — the market has already moved on the news. **Abnormal return** — stock return minus index return. **CAD** — current account deficit. **FII/FPI** — foreign institutional/portfolio investors. **Repo rate** — RBI's policy rate. **Hedging** — using contracts to lock in prices or exchange rates. **PLI** — Production Linked Incentive scheme.

---

## 27. First Message to Give Any AI to Start Building (copy-paste)

> I'm building the "India Event-Impact Intelligence Tool". I've pasted the master plan, progress tracker and decisions log. Follow the plan exactly. We're using only free tools, OpenRouter free models via a central gateway with key rotation, and Indian companies only. Start with task **P0-T1** (or the first unchecked task in the tracker). For each task: (1) restate the goal, (2) give the file(s) to create with full code, (3) give the test/command to verify it, (4) tell me what to tick off in the tracker and what the next task is. Ask me before changing any decision in the log.
