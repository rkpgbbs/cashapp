import React, { useState, useEffect, lazy, Suspense, memo } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import AppLayout from '@cloudscape-design/components/app-layout';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import Select from '@cloudscape-design/components/select';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Autosuggest from '@cloudscape-design/components/autosuggest';
import Modal from '@cloudscape-design/components/modal';
import Table from '@cloudscape-design/components/table';
import Link from '@cloudscape-design/components/link';
import TextFilter from '@cloudscape-design/components/text-filter';
import Header from '@cloudscape-design/components/header';
import Pagination from '@cloudscape-design/components/pagination';
import SearchComponent from './components/SearchComponent';

// Lazy load components
const Dashboard = lazy(() => import('./components/Dashboard'));
const Invoice = lazy(() => import('./components/Invoice'));
const Receipt = lazy(() => import('./components/Receipt'));
const ReceiptSummary = lazy(() => import('./components/ReceiptSummary'));
const Customer = lazy(() => import('./components/Customer'));
const Application = lazy(() => import('./components/Application'));
const ManualReceipt = lazy(() => import('./components/ManualReceipt'));
const Setting = lazy(() => import('./components/Setting'));

// Navigation items
const navigationItems = [
  { type: 'link', text: 'Dashboard', href: '/' },
  { type: 'link', text: 'Invoice', href: '/invoice' },
  { type: 'link', text: 'Receipt', href: '/receipt' },
  { type: 'link', text: 'Receipt Summary', href: '/receipt-summary' },
  { type: 'link', text: 'Customer', href: '/customer' },
  { type: 'link', text: 'Application', href: '/application' },
  { type: 'link', text: 'Manual Receipt', href: '/manual-receipt' },
  { type: 'link', text: 'Setting', href: '/setting' },
];

// Search dropdown options
const searchOptions = [
  { label: 'All', value: 'all' },
  { label: 'Invoice', value: 'invoice' },
  { label: 'Receipt', value: 'receipt' },
  { label: 'Customer', value: 'customer' },
  { label: 'Order', value: 'order' },
  { label: 'Credit Memo', value: 'credit_memo' },
];

// Memoized Navigation component
const Navigation = memo(({ activeHref, onFollow }) => (
  <SideNavigation
    activeHref={activeHref}
    header={{ href: '/', text: null }}
    onFollow={onFollow}
    items={navigationItems}
  />
));

// AppContent Component
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [contentType, setContentType] = useState('default');

  useEffect(() => {
    setContentType(location.pathname === '/invoice' ? 'table' : 'default');
  }, [location.pathname]);

  const handleFollow = event => {
    if (!event.detail.external) {
      event.preventDefault();
      navigate(event.detail.href);
    }
  };

  return (
    <AppLayout
      toolsHide={true}
      navigationOpen={navigationOpen}
      onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
      navigationWidth={175}
      contentType={contentType}
      navigation={<Navigation activeHref={window.location.pathname} onFollow={handleFollow} />}
      content={
        <Suspense fallback={<Box padding="l" textAlign="center"><SpaceBetween size="m">Loading...</SpaceBetween></Box>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/receipt" element={<Receipt />} />
            <Route path="/receipt-summary" element={<ReceiptSummary />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/application" element={<Application />} />
            <Route path="/manual-receipt" element={<ManualReceipt />} />
            <Route path="/setting" element={<Setting />} />
          </Routes>
        </Suspense>
      }
    />
  );
};

// Main App Component
function App() {
  const [searchDropdown, setSearchDropdown] = useState({ label: 'All', value: 'all' });

  const i18nStrings = {
    searchIconAriaLabel: 'Search',
    searchDismissIconAriaLabel: 'Close search',
    overflowMenuTriggerText: 'More',
    overflowMenuTitleText: 'All',
    overflowMenuBackIconAriaLabel: 'Back',
    overflowMenuDismissIconAriaLabel: 'Close menu',
  };

  return (
    <Router>
      <Box id="top-nav" position="fixed" top={0} left={0} right={0} zIndex={1000} backgroundColor="white">
        <TopNavigation
          identity={{ href: undefined, title: 'Accounts Receivable' }}
          search={<SearchComponent searchDropdown={searchDropdown} setSearchDropdown={setSearchDropdown} />}
          utilities={[
            { type: 'button', iconName: 'notification', title: 'Notifications', ariaLabel: 'Notifications' },
            { type: 'button', iconName: 'settings', title: 'Settings', ariaLabel: 'Settings' },
            { type: 'button', iconName: 'user-profile', title: 'Profile', ariaLabel: 'User Profile' },
          ]}
          i18nStrings={i18nStrings}
        />
      </Box>
      <Box padding={{ top: "60px" }}>
        <AppContent />
      </Box>
    </Router>
  );
}

export default App;