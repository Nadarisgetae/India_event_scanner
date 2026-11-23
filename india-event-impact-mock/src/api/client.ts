/**
 * Live Python FastAPI Backend Client for India Event Scanner
 * Points to http://localhost:8000/api/v1
 */

const API_BASE = (typeof window !== 'undefined')
  ? (window.location.port === '5173' ? 'http://localhost:8000/api/v1' : '/api/v1')
  : 'http://localhost:8000/api/v1';

const WS_BASE = (typeof window !== 'undefined' && window.location.port === '5173')
  ? 'ws://localhost:8000/api/v1'
  : (typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/v1` : 'ws://localhost:8000/api/v1');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }
  return res.json();
}

export const apiClient = {
  // --- Universe & Knowledge Base ---
  async fetchUniverse(search?: string) {
    const url = search ? `${API_BASE}/universe?search=${encodeURIComponent(search)}` : `${API_BASE}/universe`;
    const data = await handleResponse<{ count: number; companies: any[] }>(await fetch(url));
    return data.companies;
  },

  async fetchMacroSnapshot() {
    return handleResponse<any>(await fetch(`${API_BASE}/macro/snapshot`));
  },

  async fetchSectorMatrix() {
    const data = await handleResponse<{ matrix: Record<string, Record<string, any>> }>(await fetch(`${API_BASE}/sectors/matrix`));
    // Transform dict matrix to SectorMatrixCell[] array expected by UI
    const cells: any[] = [];
    for (const [sector, channels] of Object.entries(data.matrix)) {
      for (const [channel, info] of Object.entries(channels)) {
        cells.push({
          sector,
          channel,
          sensitivity: info.sensitivity,
          reasoning: info.reasoning
        });
      }
    }
    return cells;
  },

  async fetchChannels() {
    const data = await handleResponse<{ channels: any[] }>(await fetch(`${API_BASE}/channels`));
    return data.channels;
  },

  async fetchLevers(strategy?: string) {
    const url = strategy ? `${API_BASE}/levers?strategy=${encodeURIComponent(strategy)}` : `${API_BASE}/levers`;
    const data = await handleResponse<{ levers: any[] }>(await fetch(url));
    return data.levers;
  },

  async fetchPastEvents(category?: string) {
    const url = category ? `${API_BASE}/past-events?category=${encodeURIComponent(category)}` : `${API_BASE}/past-events`;
    const data = await handleResponse<{ count: number; events: any[] }>(await fetch(url));
    return data.events;
  },

  async fetchCompanyProfile(symbol: string) {
    return handleResponse<any>(await fetch(`${API_BASE}/companies/${encodeURIComponent(symbol)}/profile`));
  },

  async fetchCompanyRatios(symbol: string) {
    return handleResponse<any>(await fetch(`${API_BASE}/companies/${encodeURIComponent(symbol)}/ratios`));
  },

  // --- Reports CRUD ---
  async fetchReports(limit: number = 50) {
    const data = await handleResponse<{ count: number; reports: any[] }>(await fetch(`${API_BASE}/reports?limit=${limit}`));
    return data.reports;
  },

  async fetchReportById(reportId: string) {
    const data = await handleResponse<{ id: string; type: string; title: string; data: any }>(await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}`));
    return data.data;
  },

  async deleteReport(reportId: string) {
    return handleResponse<{ status: string; report_id: string }>(await fetch(`${API_BASE}/reports/${encodeURIComponent(reportId)}`, {
      method: 'DELETE'
    }));
  },

  // --- Real-Time Execution ---
  async runMarketAnalysis(payload: {
    event_text: string;
    category?: string;
    time_horizon?: string;
    depth?: string;
    synchronous?: boolean;
  }) {
    return handleResponse<{ run_id: string; report_id?: string; report?: any }>(await fetch(`${API_BASE}/analyze/market`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },

  async runCompanyAnalysis(payload: {
    symbol: string;
    event_text: string;
    category?: string;
    depth?: string;
    synchronous?: boolean;
  }) {
    return handleResponse<{ run_id: string; report_id?: string; report?: any }>(await fetch(`${API_BASE}/analyze/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },

  // --- Portfolio Stress-Testing ---
  async parsePortfolioCSV(csv_text: string) {
    return handleResponse<any[]>(await fetch(`${API_BASE}/portfolio/parse-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csv_text })
    }));
  },

  async analyzePortfolio(payload: {
    holdings: any[];
    event_text: string;
    portfolio_name?: string;
  }) {
    return handleResponse<any>(await fetch(`${API_BASE}/portfolio/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }));
  },

  // --- Exchange Filings Watcher ---
  async fetchFilings(exchange?: string, highImpactOnly?: boolean) {
    const params = new URLSearchParams();
    if (exchange) params.append('exchange', exchange);
    if (highImpactOnly) params.append('high_impact_only', 'true');
    const url = `${API_BASE}/filings/recent?${params.toString()}`;
    return handleResponse<{ count: number; high_impact_count: number; announcements: any[] }>(await fetch(url));
  },

  // --- System ---
  async fetchKeyStats() {
    const data = await handleResponse<{ active_keys_count: number; keys: any[] }>(await fetch(`${API_BASE}/system/keys`));
    return data.keys;
  },

  async fetchDataStatus() {
    return handleResponse<any>(await fetch(`${API_BASE}/system/data-status`));
  },

  // --- WebSocket Streaming ---
  connectRunStream(runId: string, onEvent: (msg: any) => void, onError?: (err: any) => void) {
    const wsUrl = `${WS_BASE}/runs/${encodeURIComponent(runId)}/stream`;
    try {
      const ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          onEvent(parsed);
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      };
      if (onError) {
        ws.onerror = onError;
      }
      return ws;
    } catch (e) {
      if (onError) onError(e);
      return null;
    }
  }
};
