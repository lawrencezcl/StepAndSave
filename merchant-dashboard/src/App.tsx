import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';

import { wagmiConfig } from './config/wagmi';
import { theme } from './config/rainbowkit';

// Pages
import DashboardPage from './pages/DashboardPage';
import OffersPage from './pages/OffersPage';
import RedemptionsPage from './pages/RedemptionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import ScannerPage from './pages/ScannerPage';

// Components
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';

// Styles
import '@rainbow-me/rainbowkit/styles.css';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={theme}>
          <Router>
            <AuthGuard>
              <Layout>
                <Routes>
                  {/* Main dashboard routes */}
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/redemptions" element={<RedemptionsPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* QR Scanner for redemptions */}
                  <Route path="/scan" element={<ScannerPage />} />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<DashboardPage />} />
                </Routes>
              </Layout>
            </AuthGuard>
          </Router>
          
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;