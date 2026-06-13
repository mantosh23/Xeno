import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppSidebar } from './components/layout/AppSidebar';
import { TopHeader } from './components/layout/TopHeader';
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { CampaignDetails } from './pages/CampaignDetails';
import { CreateCampaign } from './pages/CreateCampaign';
import { StrategyPlanner } from './pages/StrategyPlanner';
import { Audience } from './pages/Audience';
import { Automations } from './pages/Automations';
import { AutomationBuilder } from './pages/AutomationBuilder';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Login } from './pages/Login';
import { useAuthStore } from './store/useAuthStore';
import { Navigate } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable native browser scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Defer the scroll to ensure React has fully rendered the new page
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
  }, [pathname]);

  return null;
}

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }
};

const AnimatedRoute = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className="h-full">
    {children}
  </motion.div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>;
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const location = useLocation();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);
  
  // If we are on the login page, don't show the sidebar or header
  const isLoginPage = location.pathname === '/login';

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#fff', color: '#111827', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } }} />
      <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans selection:bg-purple-200 flex flex-col">
        {isLoginPage ? (
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<AnimatedRoute><Login /></AnimatedRoute>} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </AnimatePresence>
          </main>
        ) : (
          <>
            <AppSidebar />
            <div className="md:pl-[240px] flex flex-col min-h-screen w-full">
              <TopHeader />
              <main className="flex-1 overflow-x-hidden pt-[72px]">
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<ProtectedRoute><AnimatedRoute><Dashboard /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/audience" element={<ProtectedRoute><AnimatedRoute><Audience /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/automations" element={<ProtectedRoute><AnimatedRoute><Automations /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/automations/:id" element={<ProtectedRoute><AnimatedRoute><AutomationBuilder /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/campaigns" element={<ProtectedRoute><AnimatedRoute><Campaigns /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/campaigns/:id" element={<ProtectedRoute><AnimatedRoute><CampaignDetails /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/strategy" element={<ProtectedRoute><AnimatedRoute><StrategyPlanner /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/strategy/:id" element={<ProtectedRoute><AnimatedRoute><StrategyPlanner /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/create-campaign" element={<ProtectedRoute><AnimatedRoute><CreateCampaign /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </main>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
