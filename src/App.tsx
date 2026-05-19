import { HashRouter, Routes, Route } from 'react-router-dom';
import { DataProvider } from '@/context/DataContext';
import Home from '@/pages/Home';
import { PDAFrame } from '@/components/layout/PDAFrame';
import { StationFrame } from '@/components/layout/StationFrame';
import { AdminFrame } from '@/components/layout/AdminFrame';
import AdminHome from '@/pages/admin/AdminHome';
import AdminAgents from '@/pages/admin/AdminAgents';
import AdminWorkOrders from '@/pages/admin/AdminWorkOrders';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminRules from '@/pages/admin/AdminRules';
import AdminSuppliers from '@/pages/admin/AdminSuppliers';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminStandards from '@/pages/admin/AdminStandards';
import AdminQuarantine from '@/pages/admin/AdminQuarantine';
import AdminClaims from '@/pages/admin/AdminClaims';
import AdminRecountStrategy from '@/pages/admin/AdminRecountStrategy';
import AdminVideoAnalysis from '@/pages/admin/AdminVideoAnalysis';
import AdminSPFIntegration from '@/pages/admin/AdminSPFIntegration';

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          {/* Home / Landing */}
          <Route path="/" element={<Home />} />

          {/* PDA routes - all sub-routes handled inside PDAFrame */}
          <Route path="/pda/*" element={<PDAFrame />} />

          {/* Station routes */}
          <Route path="/station/*" element={<StationFrame />} />

          {/* Admin routes - all 13 pages */}
          <Route path="/admin" element={<AdminFrame />}>
            <Route index element={<AdminHome />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="workorders" element={<AdminWorkOrders />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="rules" element={<AdminRules />} />
            <Route path="suppliers" element={<AdminSuppliers />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="standards" element={<AdminStandards />} />
            <Route path="quarantine" element={<AdminQuarantine />} />
            <Route path="claims" element={<AdminClaims />} />
            <Route path="recount" element={<AdminRecountStrategy />} />
            <Route path="videoanalysis" element={<AdminVideoAnalysis />} />
            <Route path="spf" element={<AdminSPFIntegration />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}

export default App;
