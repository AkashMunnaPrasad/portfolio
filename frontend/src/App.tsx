import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import PageTransition from './components/game/PageTransition';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Contact from './pages/Contact';
import Resume from './pages/Resume';
import NotFound from './pages/NotFound';

/* Admin code is split out so public visitors never download the editor bundle. */
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminSkills = lazy(() => import('./pages/admin/AdminSkills'));
const AdminCertificates = lazy(() => import('./pages/admin/AdminCertificates'));
const AdminExperience = lazy(() => import('./pages/admin/AdminExperience'));
const AdminEducation = lazy(() => import('./pages/admin/AdminEducation'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSubscribers = lazy(() => import('./pages/admin/AdminSubscribers'));
const AdminForgotPassword = lazy(() => import('./pages/admin/AdminForgotPassword'));
const AdminVerifyOtp = lazy(() => import('./pages/admin/AdminVerifyOtp'));
const AdminResetPassword = lazy(() => import('./pages/admin/AdminResetPassword'));

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-10 h-10 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PageTransition />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
          <Route path="/admin/verify-otp" element={<AdminVerifyOtp />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />

          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminLayout />
              </AuthGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="skills" element={<AdminSkills />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="experience" element={<AdminExperience />} />
            <Route path="education" element={<AdminEducation />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
