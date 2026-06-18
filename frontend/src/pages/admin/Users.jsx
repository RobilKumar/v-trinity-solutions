/**
 * admin/Users.jsx — Admin User Management page.
 *
 * Features:
 *  - List all users with role, status, and last login
 *  - Register new admin/staff users with any role
 *  - Edit existing users: name, email, role, active status
 *  - Reset password for any user
 *  - View the full permission set granted by a role (accordion)
 *  - Deactivate users (soft-delete — cannot delete own account)
 *
 * Roles are fetched from GET /api/users/roles/all so new roles added to the
 * DB automatically appear without a frontend code change.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  Chip, IconButton, CircularProgress, Alert, MenuItem, Switch,
  FormControlLabel, Box, Typography, Divider, Tooltip, Paper,
  Accordion, AccordionSummary, AccordionDetails, Grid, Avatar,
  InputAdornment,
} from '@mui/material';
import {
  Add, Edit, Lock, PersonOff, PersonAdd, ExpandMore,
  Visibility, VisibilityOff, Search, Refresh,
} from '@mui/icons-material';
import api from '../../services/api';

// ── Role badge colours ─────────────────────────────────────────────────────
const ROLE_COLORS = {
  'Super Admin':    '#7c3aed',
  'Admin':          '#0052cc',
  'Sales Team':     '#059669',
  'Marketing Team': '#d97706',
  'Content Editor': '#0891b2',
  'HR':             '#e11d48',
  'Support Team':   '#6366f1',
  'Customer':       '#64748b',
};

// ── Permission modules for the "View Permissions" accordion ───────────────
const PERMISSION_MODULES = [
  'Dashboard','Users','Services','Solutions','Projects',
  'Blog','Inquiries','Careers','Media','Settings','SEO','Support','Customers',
];

export default function AdminUsers() {
  // ── State ─────────────────────────────────────────────────────────────
  const [rows,    setRows]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [open,    setOpen]    = useState(false);
  const [pwOpen,  setPwOpen]  = useState(false);  // password-reset dialog
  const [editing, setEditing] = useState(null);

  // Form fields for create/edit
  const [form, setForm] = useState({
    FirstName: '', LastName: '', Email: '',
    Password: '', RoleID: 2, IsActive: true,
  });
  const [showPw, setShowPw] = useState(false);
  const [newPw,  setNewPw]  = useState('');
  const [showNewPw, setShowNewPw] = useState(false);

  // Roles fetched from API
  const [roles,   setRoles]   = useState([]);
  // Permissions for the selected role (shown in accordion)
  const [rolePerms, setRolePerms] = useState({});

  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');
  const [success,setSuccess]= useState('');

  // ── Data loading ──────────────────────────────────────────────────────

  /** Fetch the users list (paginated, optional search filter) */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page + 1}&limit=15`);
      let data = res.data.data || [];
      // Client-side search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        data = data.filter(u =>
          `${u.FirstName} ${u.LastName} ${u.Email}`.toLowerCase().includes(q)
        );
      }
      setRows(data);
      setTotal(res.data.pagination?.total || data.length);
    } catch {
      setErr('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  /** Fetch all roles from DB for the Role dropdown */
  const loadRoles = useCallback(async () => {
    try {
      const res = await api.get('/users/roles/all');
      setRoles(res.data.data || []);
    } catch {
      // fallback roles if endpoint fails
      setRoles([
        { RoleID: 1, RoleName: 'Super Admin' },
        { RoleID: 2, RoleName: 'Admin' },
        { RoleID: 3, RoleName: 'Sales Team' },
        { RoleID: 4, RoleName: 'Marketing Team' },
        { RoleID: 5, RoleName: 'Content Editor' },
        { RoleID: 6, RoleName: 'HR' },
        { RoleID: 7, RoleName: 'Support Team' },
        { RoleID: 8, RoleName: 'Customer' },
      ]);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadRoles(); }, [loadRoles]);

  // ── Helpers ───────────────────────────────────────────────────────────

  /** Build a permission display map grouped by module from a comma-separated string */
  const buildPermMap = (permString = '') => {
    const perms = permString ? permString.split(',') : [];
    const map = {};
    PERMISSION_MODULES.forEach(mod => {
      map[mod] = perms.filter(p => p.toLowerCase().startsWith(mod.toLowerCase() + '.'));
    });
    return map;
  };

  /** Open the create dialog with blank form */
  const openCreate = () => {
    setEditing(null);
    setForm({ FirstName: '', LastName: '', Email: '', Password: '', RoleID: 2, IsActive: true });
    setRolePerms({});
    setErr(''); setSuccess('');
    setShowPw(false);
    setOpen(true);
  };

  /** Open the edit dialog pre-filled with the selected user's data */
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      FirstName: u.FirstName,
      LastName:  u.LastName,
      Email:     u.Email,
      Password:  '',
      RoleID:    u.RoleID,
      IsActive:  u.IsActive !== false,
    });
    setRolePerms(buildPermMap(u.Permissions));
    setErr(''); setSuccess('');
    setShowPw(false);
    setOpen(true);
  };

  /** Open the password-reset dialog for a specific user */
  const openPwReset = (u) => {
    setEditing(u);
    setNewPw('');
    setErr(''); setSuccess('');
    setShowNewPw(false);
    setPwOpen(true);
  };

  /** Save create or edit */
  const save = async () => {
    if (!form.FirstName || !form.LastName || !form.Email) {
      setErr('First name, last name and email are required.');
      return;
    }
    if (!editing && !form.Password) {
      setErr('Password is required for new users.');
      return;
    }
    setSaving(true); setErr('');
    try {
      const payload = {
        firstName: form.FirstName,
        lastName:  form.LastName,
        email:     form.Email,
        roleId:    form.RoleID,
        isActive:  form.IsActive,
      };
      if (form.Password) payload.password = form.Password;

      if (editing) {
        await api.put(`/users/${editing.UserID}`, payload);
        setSuccess('User updated successfully.');
      } else {
        await api.post('/users', payload);
        setSuccess('User created successfully.');
      }
      setOpen(false);
      loadUsers();
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /** Reset password for a user */
  const resetPassword = async () => {
    if (!newPw || newPw.length < 8) {
      setErr('Password must be at least 8 characters.');
      return;
    }
    setSaving(true); setErr('');
    try {
      await api.put(`/users/${editing.UserID}`, { password: newPw });
      setSuccess('Password reset successfully.');
      setPwOpen(false);
    } catch (e) {
      setErr(e.response?.data?.message || 'Password reset failed.');
    } finally {
      setSaving(false);
    }
  };

  /** Soft-deactivate a user (sets IsActive = 0) */
  const deactivate = async (u) => {
    if (!window.confirm(`Deactivate ${u.FirstName} ${u.LastName}?`)) return;
    try {
      await api.delete(`/users/${u.UserID}`);
      loadUsers();
    } catch (e) {
      setErr(e.response?.data?.message || 'Deactivation failed.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} color="#1a202c">User Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Register admins, assign roles, and manage access rights
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadUsers} sx={{ bgcolor: '#f1f5f9' }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={openCreate}
            sx={{ background: 'linear-gradient(135deg,#0052cc,#003d99)', fontWeight: 600 }}>
            Add User
          </Button>
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}
      {err && !open && !pwOpen && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErr('')}>{err}</Alert>}

      {/* ── Search bar ── */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }} elevation={0} variant="outlined">
        <TextField
          size="small"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 320 }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
          }}
        />
      </Paper>

      {/* ── Users table ── */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }} elevation={0} variant="outlined">
        {loading ? (
          <Box sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Box>
        ) : (
          <>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No users found
                    </TableCell>
                  </TableRow>
                )}
                {rows.map(u => (
                  <TableRow key={u.UserID} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: ROLE_COLORS[u.RoleName] || '#0052cc', fontSize: 12, fontWeight: 700 }}>
                          {u.FirstName?.[0]}{u.LastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{u.FirstName} {u.LastName}</Typography>
                          <Typography variant="caption" color="text.secondary">ID #{u.UserID}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{u.Email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.RoleName || '—'}
                        size="small"
                        sx={{
                          bgcolor: (ROLE_COLORS[u.RoleName] || '#64748b') + '22',
                          color:   ROLE_COLORS[u.RoleName] || '#64748b',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {u.LastLoginAt
                          ? new Date(u.LastLoginAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.IsActive ? 'Active' : 'Inactive'}
                        color={u.IsActive ? 'success' : 'default'}
                        size="small"
                        variant={u.IsActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit user">
                        <IconButton size="small" onClick={() => openEdit(u)} sx={{ color: '#0052cc' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reset password">
                        <IconButton size="small" onClick={() => openPwReset(u)} sx={{ color: '#d97706' }}>
                          <Lock fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {u.IsActive && (
                        <Tooltip title="Deactivate user">
                          <IconButton size="small" onClick={() => deactivate(u)} sx={{ color: '#dc2626' }}>
                            <PersonOff fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={total}
              page={page}
              rowsPerPage={15}
              rowsPerPageOptions={[15]}
              onPageChange={(_, p) => setPage(p)}
            />
          </>
        )}
      </Paper>

      {/* ── Create / Edit dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editing ? `Edit — ${editing.FirstName} ${editing.LastName}` : '➕ Register New User'}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>

            {err && <Alert severity="error" onClose={() => setErr('')}>{err}</Alert>}

            {/* Name row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth label="First Name *" size="small"
                value={form.FirstName}
                onChange={e => setForm(f => ({ ...f, FirstName: e.target.value }))}
              />
              <TextField
                fullWidth label="Last Name *" size="small"
                value={form.LastName}
                onChange={e => setForm(f => ({ ...f, LastName: e.target.value }))}
              />
            </Box>

            {/* Email */}
            <TextField
              fullWidth label="Email Address *" type="email" size="small"
              value={form.Email}
              onChange={e => setForm(f => ({ ...f, Email: e.target.value }))}
              helperText="This will be used to log in to the CMS"
            />

            {/* Password — required only on create */}
            <TextField
              fullWidth
              label={editing ? 'New Password (leave blank to keep current)' : 'Password * (min. 8 characters)'}
              type={showPw ? 'text' : 'password'}
              size="small"
              value={form.Password}
              onChange={e => setForm(f => ({ ...f, Password: e.target.value }))}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw(v => !v)}>
                      {showPw ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Role selector */}
            <TextField
              select fullWidth label="Role / Access Level" size="small"
              value={form.RoleID}
              onChange={e => setForm(f => ({ ...f, RoleID: Number(e.target.value) }))}
              helperText="The role determines which CMS modules this user can access"
            >
              {roles.map(r => (
                <MenuItem key={r.RoleID} value={r.RoleID}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: ROLE_COLORS[r.RoleName] || '#64748b' }} />
                    {r.RoleName}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Active toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.IsActive}
                  onChange={e => setForm(f => ({ ...f, IsActive: e.target.checked }))}
                  color="success"
                />
              }
              label={<Typography variant="body2" fontWeight={600}>{form.IsActive ? 'Active — can log in' : 'Inactive — login blocked'}</Typography>}
            />

            {/* Role permissions accordion (shown when editing) */}
            {editing && Object.keys(rolePerms).length > 0 && (
              <Accordion disableGutters elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 1 }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    📋 View Permissions for This Role
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Grid container spacing={1}>
                    {PERMISSION_MODULES.map(mod => {
                      const perms = rolePerms[mod] || [];
                      if (!perms.length) return null;
                      return (
                        <Grid item xs={6} key={mod}>
                          <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {mod}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {perms.map(p => (
                              <Chip
                                key={p}
                                label={p.split('.')[1]}
                                size="small"
                                sx={{ fontSize: '0.65rem', height: 20, bgcolor: '#e0f2fe', color: '#0369a1' }}
                              />
                            ))}
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" color="inherit">Cancel</Button>
          <Button
            variant="contained"
            onClick={save}
            disabled={saving}
            startIcon={editing ? <Edit /> : <PersonAdd />}
            sx={{ background: 'linear-gradient(135deg,#0052cc,#003d99)', fontWeight: 600, minWidth: 120 }}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Password reset dialog ── */}
      <Dialog open={pwOpen} onClose={() => setPwOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          🔑 Reset Password — {editing?.FirstName} {editing?.LastName}
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {err && <Alert severity="error" onClose={() => setErr('')}>{err}</Alert>}
            <TextField
              fullWidth
              label="New Password (min. 8 characters)"
              type={showNewPw ? 'text' : 'password'}
              size="small"
              value={newPw}
              onChange={e => setNewPw(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNewPw(v => !v)}>
                      {showNewPw ? <VisibilityOff fontSize="small"/> : <Visibility fontSize="small"/>}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Alert severity="warning" sx={{ fontSize: '0.78rem' }}>
              The user will need to use this new password on their next login.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setPwOpen(false)} variant="outlined" color="inherit">Cancel</Button>
          <Button
            variant="contained"
            onClick={resetPassword}
            disabled={saving}
            color="warning"
            sx={{ fontWeight: 600, minWidth: 120 }}>
            {saving ? 'Saving…' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
