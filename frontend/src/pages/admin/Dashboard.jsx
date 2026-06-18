import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Card, CardContent, Typography, Box, Chip, Button, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color, link }) => (
  <Card component={motion.div} whileHover={{ y: -4 }}
    sx={{ borderLeft: `4px solid ${color}`, cursor: link ? 'pointer' : 'default' }}>
    <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
          {label}
        </Typography>
        <Typography variant="h4" fontWeight={700} color={color}>{value ?? '—'}</Typography>
      </Box>
      <Box sx={{ width: 52, height: 52, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: `${color}15`, fontSize: '1.8rem' }}>
        {icon}
      </Box>
    </CardContent>
    {link && (
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Link to={link}><Typography variant="caption" color="primary">View all →</Typography></Link>
      </Box>
    )}
  </Card>
);

const STATUS_COLORS = {
  new:             '#ef4444',
  in_progress:     '#f59e0b',
  quotation_sent:  '#3b82f6',
  won:             '#10b981',
  lost:            '#6b7280',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LinearProgress />;
  const ov = stats?.overview || {};

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Welcome back! Here's what's happening today.</Typography>
        </Box>
        <Button variant="contained" component={Link} to="/admin/inquiries">View Inquiries</Button>
      </Box>

      {/* Key metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon="📩" label="New Inquiries"   value={ov.NewInquiries}   color="#ef4444" link="/admin/inquiries" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon="📅" label="Today's Inquiries" value={ov.TodayInquiries} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon="🎫" label="Open Tickets"    value={ov.OpenTickets}    color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon="💬" label="Pending Comments" value={ov.PendingComments} color="#8b5cf6" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon="✉️" label="Unread Contacts" value={ov.UnreadContacts}  color="#10b981" link="/admin/contacts" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon="💼" label="New Applications" value={ov.NewApplications} color="#f97316" link="/admin/careers" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon="👥" label="Active Users"    value={ov.ActiveUsers}    color="#0052cc" link="/admin/users" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard icon="🏗️" label="Total Projects"  value={ov.TotalProjects}  color="#059669" link="/admin/projects" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Inquiries */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Recent Inquiries</Typography>
                <Button size="small" component={Link} to="/admin/inquiries">View All</Button>
              </Box>
              {(stats?.recentInquiries || []).map((inq) => (
                <Box key={inq.InquiryID} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{inq.Name}</Typography>
                    <Typography variant="caption" color="text.secondary">{inq.Company} · {inq.InquiryType}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={inq.Status.replace('_', ' ')} size="small"
                      sx={{ bgcolor: STATUS_COLORS[inq.Status] + '20', color: STATUS_COLORS[inq.Status], fontWeight: 600, fontSize: '0.7rem' }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(inq.CreatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {!stats?.recentInquiries?.length && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No inquiries yet</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Inquiry Status Breakdown */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Inquiry Pipeline</Typography>
              {(stats?.inquiryStatus || []).map((s) => (
                <Box key={s.Status} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={600} textTransform="capitalize">
                      {s.Status.replace('_', ' ')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{s.Count}</Typography>
                  </Box>
                  <LinearProgress variant="determinate"
                    value={Math.min((s.Count / (ov.NewInquiries + 1)) * 100, 100)}
                    sx={{ height: 6, borderRadius: 3, bgcolor: '#f1f5f9',
                      '& .MuiLinearProgress-bar': { bgcolor: STATUS_COLORS[s.Status] } }} />
                </Box>
              ))}

              {/* Quick actions */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 3, mb: 1.5 }}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { icon: '📝', label: 'New Blog Post',   link: '/admin/blog' },
                  { icon: '🛡️', label: 'Add Service',     link: '/admin/services' },
                  { icon: '🏗️', label: 'Add Project',     link: '/admin/projects' },
                  { icon: '💼', label: 'Post a Job',       link: '/admin/careers' },
                ].map(a => (
                  <Button key={a.label} component={Link} to={a.link} size="small" variant="outlined"
                    startIcon={<span>{a.icon}</span>} sx={{ justifyContent: 'flex-start', borderRadius: 1.5 }}>
                    {a.label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
