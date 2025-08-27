import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';

import { wagmiConfig } from './config/wagmi';
import { theme } from './config/rainbowkit';

// Pages
import HomePage from './pages/HomePage';
import WalletPage from './pages/WalletPage';
import OffersPage from './pages/OffersPage';
import StatsPage from './pages/StatsPage';
import CouponDetailPage from './pages/CouponDetailPage';
import RedemptionPage from './pages/RedemptionPage';

// Components
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';

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
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={theme}>
            <Router>
              <Layout>
                <Routes>
                  {/* Main app routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/stats" element={<StatsPage />} />
                  
                  {/* Coupon related routes */}
                  <Route path="/coupon/:tokenId" element={<CouponDetailPage />} />
                  <Route path="/redeem/:bidId" element={<RedemptionPage />} />
                  
                  {/* Fallback route */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </Layout>
            </Router>
            
            {/* Global toast notifications */}
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '12px 16px',
                },
                success: {
                  iconTheme: {
                    primary: '#4ade80',
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
    </ErrorBoundary>
  );
}

export default App;