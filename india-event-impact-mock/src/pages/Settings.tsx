import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Badge, Chip, Input } from '@/components';
import { ArrowLeft, Plus, Trash2, Key, Zap, Eye, EyeOff, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import { useToast } from '@/components/Toast';
import { getDemoSettings, saveDemoSettings, resetDemoSettings, type DemoSettings } from '@/utils/demoSettings';

export function Settings() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'keys' | 'models' | 'general' | 'demo'>('keys');
  
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'keys' | 'models' | 'general' | 'demo');
  };
  const [keys, setKeys] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [newKeyAlias, setNewKeyAlias] = useState('');
  const [newKeyModel, setNewKeyModel] = useState('gemini-1.5-flash');
  const [showKey, setShowKey] = useState<string | null>(null);
  const [demoSettings, setDemoSettings] = useState<DemoSettings>(() => getDemoSettings());

  const handleUpdateDemoSettings = (partial: Partial<DemoSettings>) => {
    const updated = saveDemoSettings(partial);
    setDemoSettings(updated);
    addToast({ type: 'success', title: 'Settings updated', message: 'Demo configuration saved' });
  };

  // Load data on mount
  const loadData = async () => {
    try {
      const [keysData, modelsData] = await Promise.all([
        mockApi.getKeys(),
        mockApi.getModels(),
      ]);
      setKeys(keysData);
      setModels(modelsData);
    } catch (e) {
      console.error('Failed to load settings data', e);
    }
  };

  // Simulate load
  if (keys.length === 0) loadData();

  const handleTestKey = async (alias: string) => {
    addToast({ type: 'info', title: 'Testing key...', message: `${alias}`, duration: 2000 });
    const result = await mockApi.testKey(alias);
    if (result.success) {
      addToast({ type: 'success', title: 'Key test passed', message: `${alias} - ${result.latency_ms}ms` });
    } else {
      addToast({ type: 'error', title: 'Key test failed', message: result.error || 'Unknown error' });
    }
  };

  const handleAddKey = async () => {
    if (!newKeyAlias.trim()) return;
    // Mock add
    setKeys(prev => [...prev, {
      alias: newKeyAlias,
      model: newKeyModel,
      status: 'ok',
      used_today: 0,
      cap: 1500,
    }]);
    setNewKeyAlias('');
    addToast({ type: 'success', title: 'Key added (mock)', message: newKeyAlias });
  };

  const handleRemoveKey = (alias: string) => {
    setKeys(prev => prev.filter(k => k.alias !== alias));
    addToast({ type: 'success', title: 'Key removed (mock)', message: alias });
  };

  const handleResetDemo = () => {
    sessionStorage.clear();
    localStorage.removeItem('theme');
    addToast({ type: 'success', title: 'Demo data reset', message: 'All local session data cleared' });
    setTimeout(() => window.location.reload(), 1000);
  };

  const statusColors = {
    ok: 'text-bucket-positive',
    cooling_down: 'text-bucket-negative',
    exhausted: 'text-bucket-danger',
    dead: 'text-text-muted',
  };

  const statusBadges = {
    ok: 'bg-bucket-positive-bg text-bucket-positive',
    cooling_down: 'bg-bucket-negative-bg text-bucket-negative',
    exhausted: 'bg-bucket-danger-bg text-bucket-danger',
    dead: 'bg-surface-2 text-text-muted',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-display text-2xl font-bold text-text">Settings</h1>
          <p className="text-text-muted">Keys, models, depth defaults, and demo controls</p>
        </div>
      </div>

      <Tabs defaultValue="keys" value={activeTab} onChange={handleTabChange} variant="pills" className="mb-6">
        <TabsList aria-label="Settings tabs">
          <TabsTrigger value="keys"><Key className="h-4 w-4 mr-1" /> API Keys</TabsTrigger>
          <TabsTrigger value="models"><Zap className="h-4 w-4 mr-1" /> Models</TabsTrigger>
          <TabsTrigger value="general"><SlidersHorizontal className="h-4 w-4 mr-1" /> General</TabsTrigger>
          <TabsTrigger value="demo"><RefreshCw className="h-4 w-4 mr-1" /> Demo Controls</TabsTrigger>
        </TabsList>

        {/* Keys Panel */}
        <TabsContent value="keys">
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>API Key Pool (Mock)</CardTitle>
              <CardDescription>Free-tier Gemini keys with daily caps. Rotation: rate limit → cooldown → next key. All exhausted → Resume Later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="px-4 py-2">Alias</th>
                      <th className="px-4 py-2">Model</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Used / Cap</th>
                      <th className="px-4 py-2">Cooldown</th>
                      <th className="px-4 py-2">Last Error</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keys.map((key) => (
                      <tr key={key.alias} className="border-b border-border">
                        <td className="px-4 py-3 font-mono">{key.alias}</td>
                        <td className="px-4 py-3"><Badge variant="subtle" size="sm">{key.model}</Badge></td>
                        <td className="px-4 py-3">
                          <Badge variant="subtle" className={statusBadges[key.status as keyof typeof statusBadges] || ''}>
                            {key.status.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-nums">{key.used_today} / {key.cap}</td>
                        <td className="px-4 py-3 text-text-muted">
                          {key.cooldown_until ? new Date(key.cooldown_until).toLocaleTimeString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-text-muted text-sm max-w-xs truncate">{key.last_error || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleTestKey(key.alias)} disabled={key.status !== 'ok'}>
                              <Zap className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveKey(key.alias)} className="text-bucket-danger">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-4 border-t border-border flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Key alias (e.g., Key 5)"
                    value={newKeyAlias}
                    onChange={e => setNewKeyAlias(e.target.value)}
                    label="Alias"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <select value={newKeyModel} onChange={e => setNewKeyModel(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-brand">
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    <option value="gemini-1.5-flash-8b">gemini-1.5-flash-8b</option>
                  </select>
                </div>
                <Button onClick={handleAddKey}><Plus className="h-4 w-4 mr-1" /> Add Key</Button>
              </div>

              <div className="p-4 bg-surface-2 rounded-lg text-sm text-text-muted">
                <strong>Rotation Rules (Mock):</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Each key has a daily call cap (free tier)</li>
                  <li>On 429 (rate limit): key cools down 60s, next key used</li>
                  <li>On model error: fallback to flash model</li>
                  <li>Cache hits reduce call count</li>
                  <li>All keys exhausted → Run pauses, partial results saved, "Resume Later" screen</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Models Panel */}
        <TabsContent value="models">
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Model Pool (Mock)</CardTitle>
              <CardDescription>Free-tier Gemini models with success rates and penalty states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-text-muted">
                      <th className="px-4 py-2">Model</th>
                      <th className="px-4 py-2">Provider</th>
                      <th className="px-4 py-2">Tier</th>
                      <th className="px-4 py-2">Success Rate</th>
                      <th className="px-4 py-2">Ban/Penalty</th>
                      <th className="px-4 py-2">Avg Latency</th>
                      <th className="px-4 py-2">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => (
                      <tr key={model.name} className="border-b border-border">
                        <td className="px-4 py-3 font-mono">{model.name}</td>
                        <td className="px-4 py-3">{model.provider}</td>
                        <td className="px-4 py-3"><Badge variant="subtle" size="sm">{model.tier}</Badge></td>
                        <td className="px-4 py-3 font-mono text-nums">{(model.success_rate * 100).toFixed(0)}%</td>
                        <td className="px-4 py-3">
                          <Badge variant="subtle" size="sm" className={model.ban_penalty === 'none' ? 'bg-bucket-positive-bg text-bucket-positive' : 'bg-bucket-negative-bg text-bucket-negative'}>
                            {model.ban_penalty}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-nums">{model.avg_latency_ms}ms</td>
                        <td className="px-4 py-3 text-text-muted">{model.best_for.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general">
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Default Depth Mode</label>
                <div className="flex flex-wrap gap-2">
                  {(['quick', 'standard', 'deep'] as const).map((d) => (
                    <label key={d} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-muted hover:border-brand/50 cursor-pointer">
                      <input type="radio" name="defaultDepth" value={d} className="sr-only" />
                      <span className="font-medium capitalize">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Theme</label>
                <div className="flex flex-wrap gap-2">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <label key={t} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-text-muted hover:border-brand/50 cursor-pointer">
                      <input type="radio" name="theme" value={t} className="sr-only" />
                      <span className="font-medium capitalize">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <Button variant="danger" onClick={handleResetDemo}><RefreshCw className="h-4 w-4 mr-1" /> Reset Demo Data</Button>
                <p className="text-sm text-text-muted mt-2">Clears sessionStorage, localStorage, and reloads the app</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demo Controls */}
        <TabsContent value="demo">
          <Card variant="default" padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Demo & Simulation Controls</CardTitle>
                  <CardDescription>Force specific behaviours and gateway states during demos & testing</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  const reset = resetDemoSettings();
                  setDemoSettings(reset);
                  addToast({ type: 'info', title: 'Demo settings reset', message: 'Restored default simulation parameters' });
                }}>
                  Reset to Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 p-3.5 bg-surface-2 rounded-lg cursor-pointer hover:bg-surface border border-border transition-colors">
                  <input
                    type="checkbox"
                    checked={demoSettings.simulateRateLimit}
                    onChange={(e) => handleUpdateDemoSettings({ simulateRateLimit: e.target.checked })}
                    className="w-4 h-4 accent-brand"
                  />
                  <div>
                    <span className="text-sm font-medium text-text block">Simulate Rate Limit (429)</span>
                    <span className="text-xs text-text-muted">Triggers key rotation and 60s cooldown during scoring</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-surface-2 rounded-lg cursor-pointer hover:bg-surface border border-border transition-colors">
                  <input
                    type="checkbox"
                    checked={demoSettings.simulateAllKeysExhausted}
                    onChange={(e) => handleUpdateDemoSettings({ simulateAllKeysExhausted: e.target.checked })}
                    className="w-4 h-4 accent-brand"
                  />
                  <div>
                    <span className="text-sm font-medium text-text block">Simulate All Keys Exhausted</span>
                    <span className="text-xs text-text-muted">Simulates quota depletion leading to 'Resume Later' screen</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-surface-2 rounded-lg cursor-pointer hover:bg-surface border border-border transition-colors">
                  <input
                    type="checkbox"
                    checked={demoSettings.simulateSlowRun}
                    onChange={(e) => handleUpdateDemoSettings({ simulateSlowRun: e.target.checked })}
                    className="w-4 h-4 accent-brand"
                  />
                  <div>
                    <span className="text-sm font-medium text-text block">Simulate Slow Network Run</span>
                    <span className="text-xs text-text-muted">Adds synthetic latency (3-5s per pipeline stage)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 bg-surface-2 rounded-lg cursor-pointer hover:bg-surface border border-border transition-colors">
                  <input
                    type="checkbox"
                    checked={demoSettings.simulateErrorAtStep !== null}
                    onChange={(e) => handleUpdateDemoSettings({ simulateErrorAtStep: e.target.checked ? 'Company Scoring' : null })}
                    className="w-4 h-4 accent-brand"
                  />
                  <div>
                    <span className="text-sm font-medium text-text block">Simulate Pipeline Error (Scoring)</span>
                    <span className="text-xs text-text-muted">Injects recoverable error at Company Scoring step</span>
                  </div>
                </label>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-text mb-2">Simulation Speed Multiplier</label>
                <div className="flex flex-wrap gap-2.5">
                  {([
                    { id: '1x', label: '1x (Real-time Simulation ~15s)' },
                    { id: '2x', label: '2x Speed' },
                    { id: '5x', label: '5x Speed' },
                    { id: 'instant', label: 'Instant (~100ms Fast Track)' },
                  ] as const).map((s) => {
                    const isSelected = demoSettings.simSpeed === s.id;
                    return (
                      <label
                        key={s.id}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand bg-brand-light text-brand ring-1 ring-brand'
                            : 'border-border text-text hover:border-brand/40 bg-surface'
                        }`}
                      >
                        <input
                          type="radio"
                          name="simSpeed"
                          value={s.id}
                          checked={isSelected}
                          onChange={() => handleUpdateDemoSettings({ simSpeed: s.id as any })}
                          className="sr-only"
                        />
                        <span>{s.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-brand-light/30 border border-brand/20 rounded-lg text-xs text-brand leading-relaxed">
                <strong>Persistence Active:</strong> These demo settings are stored in local storage and directly affect the execution pace and error injection in Mode A Run (<code>/market/run</code>) and Mode B Run (<code>/company/run</code>).
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Simple Tabs re-export for this file
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';