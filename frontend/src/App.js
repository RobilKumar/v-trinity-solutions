/**
 * App.js — Root React component.
 *
 * Responsibilities:
 *  - Bootstraps Redux state on first load (fetchPublicSettings, fetchMe)
 *  - Defines all client-side routes using React Router v6
 *  - All pages are lazy-loaded with React.lazy so each route chunk is only
 *    downloaded when the user first visits that page (reduces initial bundle size)
 *  - ProtectedRoute guards admin and portal routes — redirects to /admin/login
 *    if the user is not authenticated or lacks the required role
 */
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';
import { fetchMe } from './store/slices/authSlice';
import { fetchPublicSettings } from './store/slices/settingsSlice';

// Public layout
import PublicLayout from './components/layout/PublicLayout';

// Admin layout
import AdminLayout from './components/layout/AdminLayout';

// Lazy load pages
const Home          = lazy(() => import('./pages/public/Home'));
const About         = lazy(() => import('./pages/public/About'));
const Services      = lazy(() => import('./pages/public/Services'));
const ServiceDetail = lazy(() => import('./pages/public/ServiceDetail'));
const Solutions     = lazy(() => import('./pages/public/Solutions'));
const SolutionDetail= lazy(() => import('./pages/public/SolutionDetail'));
const Industries    = lazy(() => import('./pages/public/Industries'));
const Projects      = lazy(() => import('./pages/public/Projects'));
const ProjectDetail = lazy(() => import('./pages/public/ProjectDetail'));
const Blog          = lazy(() => import('./pages/public/Blog'));
const BlogPost      = lazy(() => import('./pages/public/BlogPost'));
const Careers       = lazy(() => import('./pages/public/Careers'));
const JobDetail     = lazy(() => import('./pages/public/JobDetail'));
const Contact       = lazy(() => import('./pages/public/Contact'));
const RequestSolution = lazy(() => import('./pages/public/RequestSolution'));
const CaseStudies     = lazy(() => import('./pages/public/CaseStudies'));

// Admin pages
const AdminLogin    = lazy(() => import('./pages/admin/Login'));
const Dashboard     = lazy(() => import('./pages/admin/Dashboard'));
const AdminServices = lazy(() => import('./pages/admin/Services'));
const AdminProjects = lazy(() => import('./pages/admin/Projects'));
const AdminBlog     = lazy(() => import('./pages/admin/Blog'));
const AdminInquiries= lazy(() => import('./pages/admin/Inquiries'));
const AdminCareers  = lazy(() => import('./pages/admin/Careers'));
const MediaLibrary  = lazy(() => import('./pages/admin/MediaLibrary'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminUsers    = lazy(() => import('./pages/admin/Users'));
const AdminSEO      = lazy(() => import('./pages/admin/SEO'));
const AdminSolutions= lazy(() => import('./pages/admin/Solutions'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));
const AdminContact  = lazy(() => import('./pages/admin/ContactForms'));
const AdminIndustries = lazy(() => import('./pages/admin/Industries'));
const AdminCaseStudies = lazy(() => import('./pages/admin/CaseStudies'));
const AdminClients  = lazy(() => import('./pages/admin/Clients'));

// Customer Portal
const PortalLayout  = lazy(() => import('./components/layout/PortalLayout'));
const PortalDashboard = lazy(() => import('./pages/portal/Dashboard'));
const PortalQuotations = lazy(() => import('./pages/portal/Quotations'));
const PortalProjects = lazy(() => import('./pages/portal/Projects'));
const PortalDocuments = lazy(() => import('./pages/portal/Documents'));
const PortalTickets  = lazy(() => import('./pages/portal/Tickets'));

const LoadingScreen = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <CircularProgress size={48} />
  </Box>
);

/**
 * ProtectedRoute — renders children only if the user is authenticated and
 * (optionally) has one of the requiredRole values.
 * Shows a spinner while the session check (fetchMe) is still in flight so
 * we don't redirect before we know whether the token is valid.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, initialized } = useSelector(s => s.auth);
  if (!initialized) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (requiredRole && !requiredRole.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPublicSettings());
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(fetchMe());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public website */}
          <Route element={<PublicLayout />}>
            <Route path="/"                   element={<Home />} />
            <Route path="/about"              element={<About />} />
            <Route path="/services"           element={<Services />} />
            <Route path="/services/:slug"     element={<ServiceDetail />} />
            <Route path="/solutions"          element={<Solutions />} />
            <Route path="/solutions/:slug"    element={<SolutionDetail />} />
            <Route path="/industries"         element={<Industries />} />
            <Route path="/projects"           element={<Projects />} />
            <Route path="/projects/:slug"     element={<ProjectDetail />} />
            <Route path="/blog"               element={<Blog />} />
            <Route path="/blog/:slug"         element={<BlogPost />} />
            <Route path="/careers"            element={<Careers />} />
            <Route path="/careers/:slug"      element={<JobDetail />} />
            <Route path="/contact"            element={<Contact />} />
            <Route path="/request-solution"   element={<RequestSolution />} />
            <Route path="/case-studies"       element={<CaseStudies />} />
          </Route>

          {/* Admin login */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin CMS */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole={['Super Admin','Admin','Sales Team','Marketing Team','Content Editor','HR','Support Team']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index            element={<Dashboard />} />
            <Route path="services"  element={<AdminServices />} />
            <Route path="solutions" element={<AdminSolutions />} />
            <Route path="projects"  element={<AdminProjects />} />
            <Route path="blog"      element={<AdminBlog />} />
            <Route path="inquiries" element={<AdminInquiries />} />
            <Route path="careers"   element={<AdminCareers />} />
            <Route path="media"     element={<MediaLibrary />} />
            <Route path="settings"  element={<AdminSettings />} />
            <Route path="users"     element={<AdminUsers />} />
            <Route path="seo"       element={<AdminSEO />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="contacts"  element={<AdminContact />} />
            <Route path="industries" element={<AdminIndustries />} />
            <Route path="case-studies" element={<AdminCaseStudies />} />
            <Route path="clients"   element={<AdminClients />} />
          </Route>

          {/* Customer Portal */}
          <Route path="/portal" element={
            <ProtectedRoute requiredRole={['Customer']}>
              <PortalLayout />
            </ProtectedRoute>
          }>
            <Route index            element={<PortalDashboard />} />
            <Route path="quotations" element={<PortalQuotations />} />
            <Route path="projects"   element={<PortalProjects />} />
            <Route path="documents"  element={<PortalDocuments />} />
            <Route path="tickets"    element={<PortalTickets />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
