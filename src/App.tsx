import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import { AdminLayout } from './layouts/AdminLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Serials } from './pages/Serials';
import { Seasons } from './pages/Seasons';
import { Episodes } from './pages/Episodes';
import { MediaManagement } from './pages/MediaManagement';
import { Categories } from './pages/Categories';
import { Genres } from './pages/Genres';
import { Actors } from './pages/Actors';
import { Users } from './pages/Users';
import { Admins } from './pages/Admins';
import { ApiKeys } from './pages/ApiKeys';
import { ApiDocs } from './pages/ApiDocs';
import { Analytics } from './pages/Analytics';
import { ActivityLogs } from './pages/ActivityLogs';
import { Settings } from './pages/Settings';
import { MonetizationCenter } from './pages/monetization/MonetizationCenter';
import { AdMobManagement } from './pages/monetization/AdMobManagement';
import { AdSenseManagement } from './pages/monetization/AdSenseManagement';
import { AdManagerManagement } from './pages/monetization/AdManagerManagement';
import { AdPlacementsManagement } from './pages/monetization/AdPlacementsManagement';
import { RevenueAnalytics } from './pages/monetization/RevenueAnalytics';
import { SubscriptionsAndPayments } from './pages/monetization/SubscriptionsAndPayments';
import { ContentTools } from './pages/tools/ContentTools';
import { SecurityCenter } from './pages/security/SecurityCenter';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Unauthenticated Auth Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Admin Routes */}
              <Route element={<AdminLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/serials" element={<Serials />} />
                <Route path="/seasons" element={<Seasons />} />
                <Route path="/episodes" element={<Episodes />} />
                <Route path="/media-sources" element={<MediaManagement />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/genres" element={<Genres />} />
                <Route path="/actors" element={<Actors />} />
                <Route path="/users" element={<Users />} />
                <Route path="/admins" element={<Admins />} />
                <Route path="/api-keys" element={<ApiKeys />} />
                <Route path="/api-docs" element={<ApiDocs />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/logs" element={<ActivityLogs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/monetization/overview" element={<MonetizationCenter />} />
                <Route path="/monetization/admob" element={<AdMobManagement />} />
                <Route path="/monetization/adsense" element={<AdSenseManagement />} />
                <Route path="/monetization/gam" element={<AdManagerManagement />} />
                <Route path="/monetization/placements" element={<AdPlacementsManagement />} />
                <Route path="/monetization/analytics" element={<RevenueAnalytics />} />
                <Route path="/monetization/payments" element={<SubscriptionsAndPayments />} />
                <Route path="/tools" element={<ContentTools />} />
                <Route path="/security" element={<SecurityCenter />} />
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
