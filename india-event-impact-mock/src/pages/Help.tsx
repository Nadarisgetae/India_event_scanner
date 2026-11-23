import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components';
import { ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockApi } from '@/api/mockApi';
import { useState, useEffect } from 'react';

export function Help() {
  const navigate = useNavigate();
  const [helpContent, setHelpContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('quick_start');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    mockApi.getHelpContent().then(setHelpContent);
  }, []);

  const tabs = [
    { id: 'quick_start', label: 'Quick Start', icon: null },
    { id: 'how_to_write_event', label: 'Writing Events', icon: null },
    { id: 'how_to_read_market_report', label: 'Market Report', icon: null },
    { id: 'how_to_read_company_report', label: 'Company Report', icon: null },
    { id: 'depth_modes', label: 'Depth Modes', icon: null },
    { id: 'key_rotation', label: 'Key Rotation', icon: null },
    { id: 'faq', label: 'FAQ', icon: null },
    { id: 'glossary', label: 'Glossary', icon: null },
    { id: 'disclaimer', label: 'Disclaimer', icon: null },
  ];

  if (!helpContent) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="text-display text-2xl font-bold text-text">Help & Tutorial</h1><p className="text-text-muted">Learn how to use the tool</p></div>
        </div>
        <Card variant="default" padding="lg"><div className="animate-pulse space-y-4"><div className="h-4 bg-surface-2 rounded w-1/4"></div><div className="h-4 bg-surface-2 rounded w-1/2"></div><div className="h-4 bg-surface-2 rounded w-3/4"></div></div></Card>
      </div>
    );
  }

  const content = helpContent[activeTab];
  if (!content) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-display text-2xl font-bold text-text">Help & Tutorial</h1>
          <p className="text-text-muted">Learn how to use the India Event-Impact Tool</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search help..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 rounded-md border border-border bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quick_start" value={activeTab} onChange={setActiveTab} variant="pills" className="mb-6">
        <TabsList aria-label="Help sections">
          {tabs.map(t => (
            <TabsTrigger key={t.id} value={t.id}>{t.label}</TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(t => (
          <TabsContent key={t.id} value={t.id}>
            {renderTabContent(t.id, content)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function renderTabContent(tabId: string, content: any) {
  switch (tabId) {
    case 'quick_start':
      return (
        <div className="space-y-6">
          {content.sections.map((section: any, i: number) => (
            <Card key={i} variant="default" padding="lg">
              <CardHeader>
                <CardTitle>{section.heading}</CardTitle>
              </CardHeader>
              <CardContent>
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </CardContent>
            </Card>
          ))}
        </div>
      );

    case 'how_to_write_event':
      return (
        <div className="space-y-6">
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Good Examples</CardTitle>
              <CardDescription>Specific, quantified, actionable</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.good_examples.map((ex: string, i: number) => (
                <div key={i} className="p-4 bg-bucket-positive-bg border border-bucket-positive-border rounded-lg">
                  <p className="font-medium text-bucket-positive mb-1">✓ Good</p>
                  <p className="text-text-muted">{ex}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Bad Examples</CardTitle>
              <CardDescription>Vague, no numbers, no context</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {content.bad_examples.map((ex: string, i: number) => (
                <div key={i} className="p-4 bg-bucket-danger-bg border border-bucket-danger-border rounded-lg">
                  <p className="font-medium text-bucket-danger mb-1">✗ Avoid</p>
                  <p className="text-text-muted">{ex}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card variant="default" padding="lg">
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-text-muted">
                {content.tips.map((tip: string) => <li key={tip}>{tip}</li>)}
              </ul>
            </CardContent>
          </Card>
        </div>
      );

    case 'how_to_read_market_report':
    case 'how_to_read_company_report':
      return (
        <div className="space-y-4">
          {content.sections.map((section: any, i: number) => (
            <Card key={i} variant="outlined" padding="md">
              <h4 className="font-medium text-text mb-2">{section.heading}</h4>
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </Card>
          ))}
        </div>
      );

    case 'depth_modes':
      return (
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Depth Modes Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th className="px-4 py-2">Mode</th>
                    <th className="px-4 py-2">Calls</th>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Companies</th>
                    <th className="px-4 py-2">Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  {content.modes.map((mode: any) => (
                    <tr key={mode.name} className="border-b border-border">
                      <td className="px-4 py-3 font-medium">{mode.name}</td>
                      <td className="px-4 py-3 font-mono">{mode.calls}</td>
                      <td className="px-4 py-3 font-mono">{mode.time}</td>
                      <td className="px-4 py-3">{mode.companies}</td>
                      <td className="px-4 py-3 text-text-muted">{mode.use_case}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      );

    case 'key_rotation':
      return (
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Key Rotation Explained</CardTitle>
          </CardHeader>
          <CardContent className="prose text-text-muted">
            <p>{content.content}</p>
          </CardContent>
        </Card>
      );

    case 'faq':
      return (
        <div className="space-y-3">
          {content.questions.map((q: any, i: number) => (
            <FAQItem key={i} question={q.q} answer={q.a} />
          ))}
        </div>
      );

    case 'glossary':
      return (
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Glossary ({content.terms.length} terms)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {content.terms.map((term: any) => (
                <div key={term.term} className="p-3 bg-surface-2 rounded-lg">
                  <p className="font-medium text-text mb-1">{term.term}</p>
                  <p className="text-sm text-text-muted">{term.def}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );

    case 'disclaimer':
      return (
        <Card variant="default" padding="lg" className="bg-bucket-danger-bg border-bucket-danger-border">
          <CardHeader>
            <CardTitle className="text-bucket-danger">Disclaimer</CardTitle>
          </CardHeader>
          <CardContent>
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card variant="outlined" padding="md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left p-2"
      >
        <span className="font-medium text-text">{question}</span>
        {open ? <ChevronUp className="h-5 w-5 text-text-muted" /> : <ChevronDown className="h-5 w-5 text-text-muted" />}
      </button>
      {open && (
        <div className="pt-2 border-t border-border text-text-muted">
          {answer}
        </div>
      )}
    </Card>
  );
}