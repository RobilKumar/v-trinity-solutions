/**
 * AdminLayout.jsx — Main CMS shell layout.
 * Renders the collapsible sidebar, top app bar, and <Outlet> for page content.
 */

import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, Menu,
         MenuItem, Divider, Tooltip, Badge } from '@mui/material';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice';
import GlobalSnackbar from '../shared/GlobalSnackbar';

const MENU_GROUPS = [
  {
    label: 'Overview',
    items: [
      { icon: '📊', label: 'Dashboard',    path: '/admin' },
    ],
  },
  {
    label: 'Content',
    items: [
      { icon: '🛡️', label: 'Services',    path: '/admin/services',    perm: 'services.view' },
      { icon: '💡', label: 'Solutions',   path: '/admin/solutions',   perm: 'solutions.view' },
      { icon: '🏗️', label: 'Projects',    path: '/admin/projects',    perm: 'projects.view' },
      { icon: '📝', label: 'Blog',        path: '/admin/blog',        perm: 'blog.view' },
      { icon: '🏭', label: 'Industries',  path: '/admin/industries' },
      { icon: '📋', label: 'Case Studies',path: '/admin/case-studies' },
    ],
  },
  {
    label: 'Business',
    items: [
      { icon: '📩', label: 'Inquiries',   path: '/admin/inquiries',   perm: 'inquiries.view' },
      { icon: '💼', label: 'Careers',     path: '/admin/careers',     perm: 'careers.view' },
      { icon: '💬', label: 'Contacts',    path: '/admin/contacts' },
      { icon: '⭐', label: 'Testimonials',path: '/admin/testimonials' },
      { icon: '🤝', label: 'Clients',     path: '/admin/clients' },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: '🖼️', label: 'Media',       path: '/admin/media',       perm: 'media.view' },
      { icon: '👥', label: 'Users',       path: '/admin/users',       perm: 'users.view' },
      { icon: '🔍', label: 'SEO',         path: '/admin/seo',         perm: 'seo.view' },
      { icon: '⚙️', label: 'Settings',    path: '/admin/settings',    perm: 'settings.view' },
    ],
  },
];

/** Inline SVG brand mark — two overlapping triangles forming a Star of David with inner V and cross */
const VTrinitiLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="adlg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1a4fa0"/>
        <stop offset="100%" stopColor="#00c8d4"/>
      </linearGradient>
      <linearGradient id="adlg2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00c8d4"/>
        <stop offset="100%" stopColor="#1a4fa0"/>
      </linearGradient>
    </defs>
    <polygon points="100,18 172,142 28,142" fill="none" stroke="url(#adlg1)" strokeWidth="11" strokeLinejoin="round"/>
    <polygon points="100,182 28,58 172,58" fill="none" stroke="url(#adlg2)" strokeWidth="11" strokeLinejoin="round"/>
    <polyline points="72,88 100,128 128,88" fill="none" stroke="url(#adlg1)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="100" y1="73" x2="100" y2="113" stroke="url(#adlg2)" strokeWidth="8" strokeLinecap="round"/>
    <line x1="82"  y1="93" x2="118" y2="93"  stroke="url(#adlg2)" strokeWidth="8" strokeLinecap="round"/>
  </svg>
);

export default function AdminLayout() {
  const { user }        = useSelector(s => s.auth);
  const { sidebarOpen } = useSelector(s => s.ui);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/admin/login');
  };

  const currentLabel = MENU_GROUPS
    .flatMap(g => g.items)
    .find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path)))
    ?.label || 'Dashboard';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f4ff' }}>

      {/* ── Sidebar ── */}
      <Box
        className="cms-sidebar"
        sx={{
          width: sidebarOpen ? 256 : 72,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          zIndex: 1200,
        }}>

        {/* Logo / brand */}
        <Box sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          minHeight: 68,
        }}>
          <Box sx={{ flexShrink: 0 }}>
            <VTrinitiLogo size={sidebarOpen ? 38 : 30} />
          </Box>
          {sidebarOpen && (
            <Typography sx={{
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '-0.3px',
              whiteSpace: 'nowrap',
              fontSize: '0.92rem',
              overflow: 'hidden',
            }}>
              V-Trinity Solutions
            </Typography>
          )}
        </Box>

        {/* Nav items */}
        <Box sx={{ p: 1.5, overflowY: 'auto', height: 'calc(100% - 68px)' }}>
          {MENU_GROUPS.map(group => (
            <Box key={group.label} sx={{ mb: 2 }}>
              {sidebarOpen && (
                <Typography sx={{
                  color: 'rgba(255,255,255,0.3)',
                  px: 1.5, mb: 0.5,
                  display: 'block',
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontSize: '0.62rem',
                }}>
                  {group.label}
                </Typography>
              )}
              {group.items.map(item => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <Tooltip key={item.path} title={!sidebarOpen ? item.label : ''} placement="right">
                    <Link
                      to={item.path}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      style={{ marginBottom: 2, justifyContent: sidebarOpen ? 'flex-start' : 'center' }}>
                      <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Main content ── */}
      <Box sx={{ ml: sidebarOpen ? '256px' : '72px', flex: 1, transition: 'margin-left 0.3s ease' }}>

        {/* Top bar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar sx={{ gap: 1 }}>
            <IconButton onClick={() => dispatch(toggleSidebar())}>
              <span style={{ fontSize: '1.2rem' }}>☰</span>
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#1a202c', fontWeight: 600 }}>
              {currentLabel}
            </Typography>
            <Tooltip title="View Website">
              <IconButton component="a" href="/" target="_blank" sx={{ color: '#0052cc' }}>
                <span style={{ fontSize: '1.1rem' }}>🌐</span>
              </IconButton>
            </Tooltip>
            <IconButton>
              <Badge badgeContent={3} color="error">
                <span style={{ fontSize: '1.1rem' }}>🔔</span>
              </Badge>
            </IconButton>
            <Tooltip title={`${user?.firstName || ''} ${user?.lastName || ''}`}>
              <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#0052cc', fontSize: 13, fontWeight: 700 }}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3, minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Box>
      </Box>

      {/* User menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">{user?.RoleName || user?.role}</Typography>
        </Box>
        <Divider />
        <MenuItem component="a" href="/" target="_blank" onClick={() => setAnchorEl(null)}>
          🌐 View Website
        </MenuItem>
        <MenuItem component={Link} to="/admin/settings" onClick={() => setAnchorEl(null)}>
          ⚙️ Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontWeight: 600 }}>
          🚪 Logout
        </MenuItem>
      </Menu>

      <GlobalSnackbar />
    </Box>
  );
}
