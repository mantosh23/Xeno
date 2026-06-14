import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion, type Variants } from 'framer-motion';

import { AppSidebar } from '../components/layout/AppSidebar';
import { TopHeader } from '../components/layout/TopHeader';
import { Dashboard } from '../features/dashboard/pages/Dashboard';
import { Campaigns } from '../features/campaigns/pages/Campaigns';
import { CampaignDetails } from '../features/campaigns/pages/CampaignDetails';
import { CreateCampaign } from '../features/dashboard/pages/quick-actions/create-campaign/CreateCampaign';
import { StrategyPlanner } from '../features/strategy/pages/StrategyPlanner';
import { Audience } from '../features/audience/pages/Audience';
import { Automations } from '../features/automations/pages/Automations';
import { AutomationBuilder } from '../features/automations/pages/AutomationBuilder';
import { NotFound } from '../pages/NotFound';
import { ErrorPage } from '../pages/ErrorPage';
import { useLayoutStore } from '../hooks/useLayoutStore';

import { Login } from '../features/auth/pages/Login';

import { useAuthStore } from '../features/auth/hooks/useAuthStore';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls the window to the top whenever the route changes.
 * Disables the native browser scroll restoration for consistent behavior.
 * 
 * @returns {null} Renders nothing.
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 0);
  }, [pathname]);

  return null;
}

const pageVariants: Variants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2, ease: 'easeIn' } }
};

/**
 * AnimatedRoute Component
 * 
 * Wraps a route component with Framer Motion animations for smooth page transitions.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render with animations.
 * @returns {JSX.Element}
 */
const AnimatedRoute = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants} className="h-full">
    {children}
  </motion.div>
);

/**
 * ProtectedRoute Component
 * 
 * Guards routes that require an authenticated user. Redirects to `/login` if
 * the user is not authenticated.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The child component to render if authenticated.
 * @returns {JSX.Element}
 */
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

/**
 * AppNavigator Component
 * 
 * Serves as the central routing orchestrator for the application, mapping paths
 * to their respective screen components and managing the persistent layout (Sidebar, Header).
 * 
 * @returns {JSX.Element} The routing tree.
 */
export const AppNavigator = () => {
  const location = useLocation();
  const { initialize } = useAuthStore();
  const { isSidebarExpanded } = useLayoutStore();

  useEffect(() => {
    initialize();
  }, [initialize]);
  
  const isLoginPage = location.pathname === '/login';
  const isStrategyPage = location.pathname.startsWith('/strategy');

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#fff', color: '#111827', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' } }} />
      <div className={`bg-[#FAFAFA] text-gray-900 font-sans selection:bg-purple-200 flex flex-col ${isStrategyPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
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
            <div className={`flex flex-col w-full transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'md:pl-[240px]' : 'md:pl-[80px]'} ${isStrategyPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
              {!isStrategyPage && <TopHeader />}
              <main className={`flex-1 ${isStrategyPage ? 'min-h-0 h-full overflow-hidden flex flex-col' : 'overflow-x-hidden pt-[72px]'}`}>
                <AnimatePresence mode="wait">
                  <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<ProtectedRoute><AnimatedRoute><Dashboard /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/audience" element={<ProtectedRoute><AnimatedRoute><Audience /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/automations" element={<ProtectedRoute><AnimatedRoute><Automations /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/automations/:id" element={<ProtectedRoute><AnimatedRoute><AutomationBuilder /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/automations/:id/edit" element={<ProtectedRoute><AnimatedRoute><AutomationBuilder /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/campaigns" element={<ProtectedRoute><AnimatedRoute><Campaigns /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/campaigns/:id" element={<ProtectedRoute><AnimatedRoute><CampaignDetails /></AnimatedRoute></ProtectedRoute>} />

                    <Route path="/strategy" element={<ProtectedRoute><AnimatedRoute><StrategyPlanner /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/strategy/:id" element={<ProtectedRoute><AnimatedRoute><StrategyPlanner /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/create-campaign" element={<ProtectedRoute><AnimatedRoute><CreateCampaign /></AnimatedRoute></ProtectedRoute>} />
                    <Route path="/error" element={<AnimatedRoute><ErrorPage /></AnimatedRoute>} />
                    <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
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
