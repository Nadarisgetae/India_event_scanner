import assert from 'node:assert';
import { mockApi } from '../api/mockApi';
import { getStoredReports, saveStoredReport, deleteStoredReport, getConsideredActions, toggleConsideredAction } from '../utils/storage';
import { getDemoSettings, saveDemoSettings, resetDemoSettings } from '../utils/demoSettings';
import type { SavedReport } from '../types';

async function runAllTests() {
  console.log('🧪 Starting Antigravity Mock UI Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  async function testAsync(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ ${name}:`, err.message);
      failed++;
    }
  }

  // Group 1: Scenario Matching Tests
  console.log('1. Scenario Matching:');
  await testAsync('Crude shock matches MA-1', async () => {
    const id = await mockApi.matchMarketScenario('Brent crude surges past $90/bbl due to Strait of Hormuz tensions');
    assert.strictEqual(id, 'MA-1');
  });

  await testAsync('Tariff event matches MA-2', async () => {
    const id = await mockApi.matchMarketScenario('US announces 25% reciprocal tariff on Indian engineering and textiles');
    assert.strictEqual(id, 'MA-2');
  });

  await testAsync('RBI rate cut matches MA-3', async () => {
    const id = await mockApi.matchMarketScenario('RBI MPC cuts repo rate by 50 bps in surprise monetary policy easing');
    assert.strictEqual(id, 'MA-3');
  });

  await testAsync('Generic shock matches MA-G', async () => {
    const id = await mockApi.matchMarketScenario('Global satellite communications constellation disruption');
    assert.strictEqual(id, 'MA-G');
  });

  await testAsync('Mode B matching for Asian Paints returns MB-1', async () => {
    const id = await mockApi.matchCompanyScenario('ASIANPAINT', 'Brent crude surge');
    assert.strictEqual(id, 'MB-1');
  });

  await testAsync('Mode B matching for TCS returns MB-2', async () => {
    const id = await mockApi.matchCompanyScenario('TCS', 'US tariff hike');
    assert.strictEqual(id, 'MB-2');
  });

  await testAsync('Mode B matching for IndiGo returns MB-3', async () => {
    const id = await mockApi.matchCompanyScenario('INDIGO', 'Fuel price jump');
    assert.strictEqual(id, 'MB-3');
  });

  await testAsync('Mode B matching for HDFC Bank returns MB-4', async () => {
    const id = await mockApi.matchCompanyScenario('HDFCBANK', 'RBI rate cut');
    assert.strictEqual(id, 'MB-4');
  });

  await testAsync('Mode B matching for Reliance returns dynamic variant MB-RELIANCE', async () => {
    const id = await mockApi.matchCompanyScenario('RELIANCE', 'Crude volatility');
    assert.strictEqual(id, 'MB-RELIANCE');
  });

  // Group 2: Dynamic Template Engine & Report Synthesis
  console.log('\n2. Dynamic Report Synthesis:');
  await testAsync('Synthesizes valid company report for RELIANCE', async () => {
    const report = await mockApi.getCompanyScenario('MB-RELIANCE');
    assert.ok(report, 'Report should not be null');
    assert.strictEqual(report.company.symbol, 'RELIANCE');
    assert.ok(report.dimensions.length >= 6, 'Should have at least 6 impact dimensions');
    assert.ok(report.strategy.immediate_0_30d.length > 0, 'Should have immediate actions');
    assert.ok(report.resilience.score > 0, 'Should have positive resilience score');
    assert.ok(report.peers.length > 0, 'Should generate peer comparison');
  });

  await testAsync('Synthesizes valid company report for ZOMATO', async () => {
    const report = await mockApi.getCompanyScenario('MB-ZOMATO');
    assert.ok(report, 'Report should not be null');
    assert.strictEqual(report.company.symbol, 'ZOMATO');
    assert.ok(report.market_view.technicals.length > 0, 'Should generate technical views');
  });

  // Group 3: Exposure Profiles & Universe Coverage
  console.log('\n3. Exposure Profiles & Universe:');
  await testAsync('Returns verified profile for ASIANPAINT', async () => {
    const profile = await mockApi.getExposureProfile('ASIANPAINT');
    assert.ok(profile, 'Asian Paints profile should exist');
    assert.strictEqual(profile.verification, 'human-verified');
  });

  await testAsync('Synthesizes fallback profile for universe company without static file', async () => {
    const profile = await mockApi.getExposureProfile('LT');
    assert.ok(profile, 'Larsen & Toubro profile should be synthesized');
    assert.strictEqual(profile.symbol, 'LT');
    assert.strictEqual(profile.verification, 'llm-draft');
  });

  await testAsync('Universe has ~50+ Indian companies across large/mid/small cap', async () => {
    const universe = await mockApi.getUniverse();
    assert.ok(universe.length >= 48, `Universe should have ~50+ companies, found ${universe.length}`);
  });

  // Group 4: Local Storage & Mock Settings
  console.log('\n4. Demo Settings & Local Storage:');
  await testAsync('Demo settings defaults are valid', () => {
    const settings = getDemoSettings();
    assert.ok(['1x', '2x', '5x', 'instant'].includes(settings.simSpeed));
    assert.strictEqual(typeof settings.simulateRateLimit, 'boolean');
  });

  await testAsync('Demo settings save and reset cycle works', () => {
    saveDemoSettings({ simSpeed: 'instant', simulateRateLimit: true });
    let current = getDemoSettings();
    assert.strictEqual(current.simSpeed, 'instant');
    assert.strictEqual(current.simulateRateLimit, true);

    resetDemoSettings();
    current = getDemoSettings();
    assert.strictEqual(current.simSpeed, '1x');
    assert.strictEqual(current.simulateRateLimit, false);
  });

  await testAsync('Storage tracks considered initiatives correctly', () => {
    const scenarioKey = 'MB-TEST';
    const actionKey = 'action-1';

    // Toggle on
    let state = toggleConsideredAction(scenarioKey, actionKey);
    assert.strictEqual(state[actionKey], true);
    assert.strictEqual(getConsideredActions(scenarioKey)[actionKey], true);

    // Toggle off
    state = toggleConsideredAction(scenarioKey, actionKey);
    assert.strictEqual(state[actionKey], false);
    assert.strictEqual(getConsideredActions(scenarioKey)[actionKey], false);
  });

  await testAsync('Storage saves and retrieves report history', () => {
    const dummyReport: SavedReport = {
      id: 'test-report-01',
      type: 'market',
      title: 'Test Crude Impact Report',
      date: new Date().toISOString(),
      depth: 'standard',
      bucket_counts: {
        danger: 2,
        negative: 5,
        neutral: 10,
        positive: 4,
        gain: 2,
      },
    };

    saveStoredReport(dummyReport);
    const stored = getStoredReports();
    assert.ok(stored.some((r) => r.id === 'test-report-01'));

    deleteStoredReport('test-report-01');
    const afterDelete = getStoredReports();
    assert.ok(!afterDelete.some((r) => r.id === 'test-report-01'));
  });

  console.log(`\n==========================================`);
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  console.log(`==========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
