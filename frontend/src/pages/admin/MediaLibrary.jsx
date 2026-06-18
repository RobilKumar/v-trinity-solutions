import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Grid, Card, CardMedia, CardContent, Typography, Button, TextField, Chip, Dialog, DialogTitle, DialogContent, CircularProgress, IconButton, Tabs, Tab, Alert } from '@mui/material';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../store/slices/uiSlice';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function MediaLibrary() {
  const dispatch = useDispatch();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [preview, setPreview] = useState(null);
  const [tab, setTab] = useState(0);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 50, ...(search && { search }), ...(typeFilter && { type: typeFilter }) });
      const { data } = await api.get(`/media?${params}`);
      setFiles(data.data);
      setTotal(data.pagination.total);
    } catch {}
    setLoading(false);
  }, [page, search, typeFilter]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setUploading(true);
    let success = 0;
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        await api.post('/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        success++;
      } catch {}
    }
    dispatch(showSnackbar({ message: `${success} file(s) uploaded`, severity: 'success' }));
    fetchFiles();
    setUploading(false);
  }, [fetchFiles, dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [], 'video/*': [] },
    maxSize: 10 * 1024 * 1024,
  });

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await api.delete(`/media/${fileId}`);
      dispatch(showSnackbar({ message: 'File deleted', severity: 'success' }));
      fetchFiles();
    } catch {
      dispatch(showSnackbar({ message: 'Delete failed', severity: 'error' }));
    }
  };

  const TYPES = [{ label: 'All', value: '' }, { label: 'Images', value: 'image' }, { label: 'Documents', value: 'document' }, { label: 'Videos', value: 'video' }];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Media Library</Typography>
          <Typography variant="body2" color="text.secondary">{total} files</Typography>
        </Box>
      </Box>

      {/* Drop zone */}
      <Box {...getRootProps()} sx={{
        border: `2px dashed ${isDragActive ? '#0052cc' : '#e2e8f0'}`,
        borderRadius: 2, p: 4, mb: 3, textAlign: 'center', cursor: 'pointer',
        bgcolor: isDragActive ? '#f0f4ff' : '#f8faff',
        transition: 'all 0.2s',
      }}>
        <input {...getInputProps()} />
        {uploading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>Uploading...</Typography>
          </Box>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>🗂️ {isDragActive ? 'Drop files here' : 'Drag & drop files here'}</Typography>
            <Typography variant="body2" color="text.secondary">or click to browse · Images, PDFs, Videos (max 10MB each)</Typography>
          </>
        )}
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField size="small" placeholder="Search files..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }} sx={{ minWidth: 250 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          {TYPES.map(t => (
            <Chip key={t.value} label={t.label} clickable
              variant={typeFilter === t.value ? 'filled' : 'outlined'}
              color={typeFilter === t.value ? 'primary' : 'default'}
              onClick={() => { setTypeFilter(t.value); setPage(1); }} />
          ))}
        </Box>
      </Box>

      {/* Grid */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {files.map(file => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={file.FileID}>
              <Card sx={{ position: 'relative', '&:hover .actions': { opacity: 1 } }}>
                {file.MimeType?.startsWith('image/') ? (
                  <CardMedia component="img" height="140" image={file.FileURL} alt={file.AltText || file.OriginalName}
                    sx={{ objectFit: 'cover', cursor: 'pointer' }} onClick={() => setPreview(file)} />
                ) : (
                  <Box sx={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8faff', cursor: 'pointer' }}
                       onClick={() => setPreview(file)}>
                    <Typography fontSize={48}>{file.MimeType?.includes('pdf') ? '📄' : '🎥'}</Typography>
                  </Box>
                )}
                <Box className="actions" sx={{ position: 'absolute', top: 4, right: 4, opacity: 0, transition: 'opacity 0.2s', display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(file.FileID); }}>
                    🗑️
                  </IconButton>
                </Box>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="caption" display="block" noWrap title={file.OriginalName}>
                    {file.OriginalName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{formatBytes(file.FileSize)}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Load more */}
      {files.length < total && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button onClick={() => setPage(p => p + 1)} variant="outlined">Load More</Button>
        </Box>
      )}

      {/* Preview dialog */}
      <Dialog open={!!preview} onClose={() => setPreview(null)} maxWidth="md">
        {preview && (
          <>
            <DialogTitle>{preview.OriginalName}</DialogTitle>
            <DialogContent>
              {preview.MimeType?.startsWith('image/') ? (
                <img src={preview.FileURL} alt={preview.AltText} style={{ maxWidth: '100%', borderRadius: 8 }} />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography fontSize={64}>{preview.MimeType?.includes('pdf') ? '📄' : '🎥'}</Typography>
                </Box>
              )}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={preview.MimeType} size="small" />
                <Chip label={formatBytes(preview.FileSize)} size="small" />
              </Box>
              <TextField fullWidth size="small" label="File URL (copy to use)" value={preview.FileURL} sx={{ mt: 2 }}
                inputProps={{ readOnly: true }} onClick={e => e.target.select()} />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
