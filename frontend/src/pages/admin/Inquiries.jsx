import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Chip, Button, TextField, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert } from '@mui/material';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';

const STATUS_COLORS = { new: 'error', in_progress: 'warning', quotation_sent: 'info', won: 'success', lost: 'default' };
const STATUSES = ['new','in_progress','quotation_sent','won','lost'];

export default function AdminInquiries() {
  const dispatch = useDispatch();
  const [inquiries, setInquiries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', type: '', search: '' });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...filters });
      const { data } = await api.get(`/inquiries?${params}`);
      setInquiries(data.data);
      setTotal(data.pagination.total);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchInquiries(); }, [page, filters]);

  const openDetail = async (inq) => {
    const { data } = await api.get(`/inquiries/${inq.InquiryID}`);
    setSelected(data.data);
    setNewStatus(data.data.Status);
    setNote('');
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.patch(`/inquiries/${selected.InquiryID}`, { status: newStatus, note: note || undefined });
      dispatch(showSnackbar({ message: 'Inquiry updated', severity: 'success' }));
      setSelected(null);
      fetchInquiries();
    } catch {
      dispatch(showSnackbar({ message: 'Update failed', severity: 'error' }));
    }
    setUpdating(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Inquiries</Typography>
          <Typography variant="body2" color="text.secondary">{total} total inquiries</Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" placeholder="Search name, company, email..."
                value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={filters.status} label="Status" onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace('_',' ')}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select value={filters.type} label="Type" onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {['CCTV','Cyber Security','SOC','SIEM','IT Infrastructure','Data Center','Networking','Cloud','Managed Services'].map(t => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="outlined" onClick={() => setFilters({ status: '', type: '', search: '' })}>Clear</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {loading && <Box sx={{ p: 2, textAlign: 'center' }}><CircularProgress size={32} /></Box>}
        {!loading && inquiries.map(inq => (
          <Box key={inq.InquiryID} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #f1f5f9', '&:hover': { bgcolor: '#f8faff' }, cursor: 'pointer' }}
               onClick={() => openDetail(inq)}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                <Typography variant="subtitle2" fontWeight={600}>{inq.Name}</Typography>
                <Chip label={inq.InquiryType} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {inq.Company && `${inq.Company} · `}{inq.Email} · {inq.Phone}
                {inq.Budget && ` · Budget: ${inq.Budget}`}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip label={inq.Status.replace('_',' ')} color={STATUS_COLORS[inq.Status]} size="small" />
              <Typography variant="caption" color="text.secondary">
                {new Date(inq.CreatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        ))}
        {!loading && !inquiries.length && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">No inquiries found</Typography>
          </Box>
        )}
      </Card>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
          <Button size="small" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next →</Button>
        </Box>
      </Box>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6">Inquiry #{selected.InquiryID}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(selected.CreatedAt).toLocaleString()}</Typography>
              </Box>
              <Chip label={selected.InquiryType} color="primary" />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  ['Name',    selected.Name],
                  ['Company', selected.Company],
                  ['Email',   selected.Email],
                  ['Phone',   selected.Phone],
                  ['Location',selected.Location],
                  ['Budget',  selected.Budget],
                ].filter(([,v]) => v).map(([k, v]) => (
                  <Grid item xs={12} sm={6} key={k}>
                    <Typography variant="caption" color="text.secondary">{k}</Typography>
                    <Typography variant="body2" fontWeight={500}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>

              <Typography variant="subtitle2" fontWeight={600} gutterBottom>Description</Typography>
              <Box sx={{ bgcolor: '#f8faff', borderRadius: 1, p: 2, mb: 3 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{selected.Description}</Typography>
              </Box>

              {selected.AttachmentURL && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Attachment: <a href={selected.AttachmentURL} target="_blank" rel="noreferrer">{selected.AttachmentName}</a>
                </Alert>
              )}

              {/* Previous notes */}
              {selected.notes?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>Notes</Typography>
                  {selected.notes.map(n => (
                    <Box key={n.NoteID} sx={{ p: 1.5, bgcolor: '#fff7ed', borderRadius: 1, mb: 1 }}>
                      <Typography variant="body2">{n.Note}</Typography>
                      <Typography variant="caption" color="text.secondary">{n.UserName} · {new Date(n.CreatedAt).toLocaleString()}</Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Update status */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Update Status</InputLabel>
                    <Select value={newStatus} label="Update Status" onChange={e => setNewStatus(e.target.value)}>
                      {STATUSES.map(s => <MenuItem key={s} value={s}>{s.replace('_',' ')}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField fullWidth size="small" placeholder="Add internal note..." value={note} onChange={e => setNote(e.target.value)} />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setSelected(null)}>Cancel</Button>
              <Button onClick={handleUpdate} variant="contained" disabled={updating}>
                {updating ? <CircularProgress size={20} color="inherit" /> : 'Update Inquiry'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
