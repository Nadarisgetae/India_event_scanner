import { createHashRouter } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Home } from '@/pages/Home';
import { MarketInput } from '@/pages/MarketInput';
import { MarketConfirm } from '@/pages/MarketConfirm';
import { MarketRun } from '@/pages/MarketRun';
import { MarketReport } from '@/pages/MarketReport';
import { CompanyInput } from '@/pages/CompanyInput';
import { CompanyConfirm } from '@/pages/CompanyConfirm';
import { CompanyRun } from '@/pages/CompanyRun';
import { CompanyReport } from '@/pages/CompanyReport';
import { ReportsHistory } from '@/pages/ReportsHistory';
import { KnowledgeSectors } from '@/pages/KnowledgeSectors';
import { KnowledgeCompanies } from '@/pages/KnowledgeCompanies';
import { CompanyProfile } from '@/pages/CompanyProfile';
import { Settings } from '@/pages/Settings';
import { DataStatus } from '@/pages/DataStatus';
import { Help } from '@/pages/Help';
import { StyleGuide } from '@/pages/StyleGuide';
import { NotFound } from '@/pages/NotFound';
import { PortfolioStress } from '@/pages/PortfolioStress';
import { ExchangeFilings } from '@/pages/ExchangeFilings';

export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'market', element: <MarketInput /> },
      { path: 'market/confirm', element: <MarketConfirm /> },
      { path: 'market/run', element: <MarketRun /> },
      { path: 'market/report/:id', element: <MarketReport /> },
      { path: 'company', element: <CompanyInput /> },
      { path: 'company/confirm', element: <CompanyConfirm /> },
      { path: 'company/run', element: <CompanyRun /> },
      { path: 'company/report/:id', element: <CompanyReport /> },
      { path: 'portfolio', element: <PortfolioStress /> },
      { path: 'filings', element: <ExchangeFilings /> },
      { path: 'reports', element: <ReportsHistory /> },
      { path: 'history', element: <ReportsHistory /> },
      { path: 'knowledge', element: <KnowledgeSectors /> },
      { path: 'knowledge/sectors', element: <KnowledgeSectors /> },
      { path: 'knowledge/companies', element: <KnowledgeCompanies /> },
      { path: 'knowledge/companies/:symbol', element: <CompanyProfile /> },
      { path: 'settings', element: <Settings /> },
      { path: 'data-status', element: <DataStatus /> },
      { path: 'help', element: <Help /> },
      { path: 'styleguide', element: <StyleGuide /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);