import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  BucketBadge,
  ConfidenceBadge,
  BucketDot,
  Chip,
  ChannelChip,
  Modal,
  ConfirmModal,
  Drawer,
  ToastProvider,
  useToast,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  TableSkeleton,
  EmptyState,
  EmptyStates,
  ErrorState,
} from '@/components';

function StyleGuide() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabsValue, setTabsValue] = useState('buttons');
  const { addToast } = useToast();

  const showToast = (type: 'success' | 'error' | 'info' | 'default') => {
    addToast({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      message: `This is a ${type} toast message with some details.`,
    });
  };

  return (
    <ToastProvider>
      <div className="max-w-5xl mx-auto space-y-10 pb-16">
        {/* Header */}
        <div className="page-break-before">
          <h1 className="text-display text-3xl md:text-4xl font-bold text-text mb-2">Style Guide</h1>
          <p className="text-text-muted">Component library for India Event-Impact Mock UI</p>
        </div>

        {/* Tabs for navigation */}
        <Tabs defaultValue="buttons" value={tabsValue} onChange={setTabsValue} variant="pills" className="mb-8">
          <TabsList aria-label="Style guide sections">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="chips">Chips</TabsTrigger>
            <TabsTrigger value="overlays">Modals & Drawers</TabsTrigger>
            <TabsTrigger value="toasts">Toasts</TabsTrigger>
            <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
            <TabsTrigger value="empty">Empty States</TabsTrigger>
            <TabsTrigger value="errors">Error States</TabsTrigger>
          </TabsList>

          {/* Buttons */}
          <TabsContent value="buttons">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                  <CardDescription>All button variants and sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-text mb-3">Variants (md size)</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary">Primary</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="danger">Danger</Button>
                      <Button variant="success">Success</Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Sizes (primary variant)</h4>
                    <div className="flex items-center gap-3">
                      <Button size="sm">Small</Button>
                      <Button size="md">Medium</Button>
                      <Button size="lg">Large</Button>
                      <Button size="icon" aria-label="Icon button"><span>★</span></Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">States</h4>
                    <div className="flex flex-wrap gap-3">
                      <Button>Default</Button>
                      <Button disabled>Disabled</Button>
                      <Button loading>Loading</Button>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Full Width</h4>
                    <Button fullWidth variant="primary">Full Width Button</Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Cards */}
          <TabsContent value="cards">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Card Variants</CardTitle>
                  <CardDescription>Default, outlined, and elevated cards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card variant="default" padding="md">
                      <CardHeader>
                        <CardTitle>Default Card</CardTitle>
                        <CardDescription>Standard surface with border</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-muted">This is the default card style used throughout the app.</p>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="outline">Action</Button>
                      </CardFooter>
                    </Card>
                    <Card variant="outlined" padding="md">
                      <CardHeader>
                        <CardTitle>Outlined Card</CardTitle>
                        <CardDescription>Transparent background with border</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-muted">Useful for grouping without visual weight.</p>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="outline">Action</Button>
                      </CardFooter>
                    </Card>
                    <Card variant="elevated" padding="md">
                      <CardHeader>
                        <CardTitle>Elevated Card</CardTitle>
                        <CardDescription>Shadow for emphasis</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-text-muted">Draws attention to important content.</p>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" variant="primary">Action</Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Padding Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card variant="default" padding="none" className="bg-surface-2">
                    <div className="p-4 bg-surface rounded">padding="none" (add your own)</div>
                  </Card>
                  <Card variant="default" padding="sm">padding="sm" — 12px</Card>
                  <Card variant="default" padding="md">padding="md" — 20px (default)</Card>
                  <Card variant="default" padding="lg">padding="lg" — 24px</Card>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-text mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-3">
                      <Badge variant="default">Default</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge variant="subtle">Subtle</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Sizes</h4>
                    <div className="flex items-center gap-3">
                      <Badge size="sm">Small</Badge>
                      <Badge size="md">Medium</Badge>
                      <Badge size="lg">Large</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Bucket Badges (Fixed Colours)</CardTitle>
                  <CardDescription>Used everywhere in the app — colours never change</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-text mb-3">All Buckets (md)</h4>
                    <div className="flex flex-wrap gap-3">
                      <BucketBadge bucket="danger" />
                      <BucketBadge bucket="negative" />
                      <BucketBadge bucket="neutral" />
                      <BucketBadge bucket="positive" />
                      <BucketBadge bucket="gain" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Sizes</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted w-32">Small:</span>
                        <BucketBadge bucket="danger" size="sm" />
                        <BucketBadge bucket="negative" size="sm" />
                        <BucketBadge bucket="neutral" size="sm" />
                        <BucketBadge bucket="positive" size="sm" />
                        <BucketBadge bucket="gain" size="sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-text-muted w-32">Large:</span>
                        <BucketBadge bucket="danger" size="lg" />
                        <BucketBadge bucket="negative" size="lg" />
                        <BucketBadge bucket="neutral" size="lg" />
                        <BucketBadge bucket="positive" size="lg" />
                        <BucketBadge bucket="gain" size="lg" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Icon Only (BucketDot)</h4>
                    <div className="flex items-center gap-4">
                      <BucketDot bucket="danger" size="md" />
                      <BucketDot bucket="negative" size="md" />
                      <BucketDot bucket="neutral" size="md" />
                      <BucketDot bucket="positive" size="md" />
                      <BucketDot bucket="gain" size="md" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Confidence Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <ConfidenceBadge level="high" />
                    <ConfidenceBadge level="medium" />
                    <ConfidenceBadge level="low" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <ConfidenceBadge level="high" size="sm" />
                    <ConfidenceBadge level="medium" size="sm" />
                    <ConfidenceBadge level="low" size="sm" />
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Chips */}
          <TabsContent value="chips">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Standard Chips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-text mb-3">Variants</h4>
                    <div className="flex flex-wrap gap-3">
                      <Chip variant="default">Default</Chip>
                      <Chip variant="outline">Outline</Chip>
                      <Chip variant="filled">Filled</Chip>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Removable</h4>
                    <div className="flex flex-wrap gap-3">
                      <Chip removable onRemove={() => {}}>Removable</Chip>
                      <Chip variant="outline" removable onRemove={() => {}}>Also Removable</Chip>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">With Icon</h4>
                    <Chip icon="🏷️">With Icon</Chip>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Channel Chips (with Strength Dots)</CardTitle>
                  <CardDescription>Used in event parsing and reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-text mb-3">Directions</h4>
                    <div className="flex flex-wrap gap-3">
                      <ChannelChip channel="Currency / INR" strength={5} direction="negative" />
                      <ChannelChip channel="Input Costs" strength={4} direction="negative" />
                      <ChannelChip channel="Consumer Demand" strength={2} direction="neutral" />
                      <ChannelChip channel="Export Competitiveness" strength={4} direction="positive" />
                      <ChannelChip channel="Substitution" strength={3} direction="positive" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Strength Levels (negative direction)</h4>
                    <div className="flex flex-wrap gap-3">
                      <ChannelChip channel="Channel" strength={1} direction="negative" />
                      <ChannelChip channel="Channel" strength={2} direction="negative" />
                      <ChannelChip channel="Channel" strength={3} direction="negative" />
                      <ChannelChip channel="Channel" strength={4} direction="negative" />
                      <ChannelChip channel="Channel" strength={5} direction="negative" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Inactive State</h4>
                    <ChannelChip channel="Inactive Channel" strength={2} active={false} direction="neutral" />
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Modals & Drawers */}
          <TabsContent value="overlays">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Modal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
                  <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title="Modal Title"
                    description="This is a description of the modal content."
                    size="md"
                  >
                    <div className="space-y-4">
                      <p className="text-text-muted">Modal content goes here. It can contain forms, text, or any other components.</p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card variant="outlined" padding="md">
                          <p className="text-sm text-text-muted">Card inside modal</p>
                        </Card>
                        <Card variant="outlined" padding="md">
                          <p className="text-sm text-text-muted">Another card</p>
                        </Card>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => setModalOpen(false)}>Confirm</Button>
                      </div>
                    </div>
                  </Modal>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Confirmation Modal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="danger" onClick={() => setConfirmOpen(true)}>Open Confirm (Danger)</Button>
                  <ConfirmModal
                    isOpen={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={() => setConfirmOpen(false)}
                    title="Delete Report?"
                    message="This action cannot be undone. The report will be permanently removed from your history."
                    confirmLabel="Delete"
                    variant="danger"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Drawer (Right)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setDrawerOpen(true)}>Open Drawer</Button>
                  <Drawer
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    title="Company Details"
                    description="Full reasoning and analysis for this company"
                    size="lg"
                  >
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-medium text-text mb-2">Impact Score</h4>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-4 bg-surface-2 rounded-full overflow-hidden">
                            <div className="h-full bg-bucket-positive w-3/4 rounded-full" />
                          </div>
                          <span className="text-sm font-mono text-nums">+2.4</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <h4 className="font-medium text-text mb-2">Reasoning</h4>
                        <p className="text-text-muted text-sm">Crude oil spike to $110 directly increases input costs for paint manufacturers. Asian Paints has partial hedging (60% of volume) and strong pricing power...</p>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <h4 className="font-medium text-text mb-2">Key Channels</h4>
                        <div className="flex flex-wrap gap-2">
                          <ChannelChip channel="Input Costs" strength={5} direction="negative" />
                          <ChannelChip channel="Pricing Power" strength={4} direction="positive" />
                        </div>
                      </div>
                      <Button fullWidth variant="primary" className="mt-4">Run Mode B for this Company</Button>
                    </div>
                  </Drawer>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Toasts */}
          <TabsContent value="toasts">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Toast Notifications</CardTitle>
                  <CardDescription>Click buttons to trigger toasts (appear bottom-right)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => showToast('success')}>Success Toast</Button>
                    <Button variant="danger" onClick={() => showToast('error')}>Error Toast</Button>
                    <Button variant="outline" onClick={() => showToast('info')}>Info Toast</Button>
                    <Button variant="ghost" onClick={() => showToast('default')}>Default Toast</Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Skeletons */}
          <TabsContent value="skeletons">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Skeleton Loaders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-text mb-3">Text Lines</h4>
                    <Skeleton variant="text" lines={3} />
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Card Skeleton</h4>
                    <Skeleton variant="card" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Circular & Rectangular</h4>
                    <div className="flex flex-wrap gap-4">
                      <Skeleton variant="circular" width={48} height={48} />
                      <Skeleton variant="rectangular" width={120} height={40} />
                      <Skeleton variant="rectangular" width={200} height={80} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-text mb-3">Table Skeleton</h4>
                    <TableSkeleton rows={4} columns={6} />
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Empty States */}
          <TabsContent value="empty">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Empty State Presets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">No Reports</h4>
                      {EmptyStates.noReports()}
                    </Card>
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">No Search Results</h4>
                      {EmptyStates.noSearchResults('crude oil spike')}
                    </Card>
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">No History</h4>
                      {EmptyStates.noHistory()}
                    </Card>
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">No Data (with retry)</h4>
                      {EmptyStates.noData('sector heatmap')}
                    </Card>
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">Error State</h4>
                      {EmptyStates.error('Failed to load report. Server returned 500.', () => {})}
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Empty State</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    icon="charts"
                    title="Custom Empty State"
                    description="Build your own with any icon, title, description, and action."
                    action={
                      <Button size="sm" variant="primary">Custom Action</Button>
                    }
                  />
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Error States */}
          <TabsContent value="errors">
            <section className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Error State Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">Generic</h4>
                      <ErrorState type="generic" onRetry={() => {}} onGoHome={() => {}} />
                    </Card>
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">Network</h4>
                      <ErrorState type="network" onRetry={() => {}} onGoHome={() => {}} />
                    </Card>
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">Server</h4>
                      <ErrorState type="server" onRetry={() => {}} onGoHome={() => {}} />
                    </Card>
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">Permission</h4>
                      <ErrorState type="permission" onGoHome={() => {}} />
                    </Card>
                    <Card variant="outlined" padding="lg">
                      <h4 className="font-medium text-text mb-4">Not Found</h4>
                      <ErrorState type="notfound" onGoHome={() => {}} />
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </ToastProvider>
  );
}

export { StyleGuide };