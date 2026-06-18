import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Helmet } from 'react-helmet-async';
import { TextField, Select, MenuItem, FormControl, InputLabel, Button, Chip, Alert, CircularProgress, Grid, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../services/api';

const INQUIRY_TYPES = ['CCTV', 'Cyber Security', 'SOC', 'SIEM', 'IT Infrastructure', 'Data Center', 'Networking', 'Cloud', 'Managed Services', 'Other'];
const BUDGETS = ['< $10,000', '$10,000 – $50,000', '$50,000 – $200,000', '$200,000 – $1M', '> $1M', 'To be discussed'];

export default function RequestSolution() {
  const { register, handleSubmit, control, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => v && formData.append(k, v));
      if (file) formData.append('attachment', file);

      await api.post('/inquiries', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess(true);
      reset();
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Request a Solution – V-Trinity Solutions</title>
        <meta name="description" content="Submit your project requirements and get a customized IT solution proposal." />
      </Helmet>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b3e 100%)', paddingTop: 80 }}>
        <div className="container-xl py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-secondary-500 font-semibold text-sm uppercase tracking-widest">Get Started</span>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mt-3 mb-4">Request a Solution</h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Tell us about your project and we'll craft a tailored proposal within 24 hours.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <div className="section-padding bg-white">
        <div className="container-xl">
          <div className="max-w-3xl mx-auto">
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-dark-800 mb-2">Inquiry Submitted!</h2>
                <p className="text-gray-500 mb-6">Our team will review your requirements and contact you within 24 business hours.</p>
                <button onClick={() => setSuccess(false)} className="btn-primary">Submit Another Inquiry</button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-dark-800 mb-6">Project Details</h2>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Full Name *" {...register('name', { required: 'Name is required' })} error={!!errors.name} helperText={errors.name?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Company Name" {...register('company')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email Address *" type="email" {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} error={!!errors.email} helperText={errors.email?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Phone Number *" {...register('phone', { required: 'Phone is required' })} error={!!errors.phone} helperText={errors.phone?.message} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Location / City" {...register('location')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!errors.inquiryType}>
                        <InputLabel>Service Type *</InputLabel>
                        <Controller name="inquiryType" control={control} rules={{ required: 'Please select a service type' }}
                          render={({ field }) => (
                            <Select {...field} label="Service Type *">
                              {INQUIRY_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </Select>
                          )} />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Project Type / Scope" {...register('projectType')} placeholder="e.g., Office CCTV Installation" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Budget Range</InputLabel>
                        <Controller name="budget" control={control}
                          render={({ field }) => (
                            <Select {...field} label="Budget Range">
                              {BUDGETS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                            </Select>
                          )} />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth multiline rows={5} label="Describe Your Requirements *"
                        {...register('description', { required: 'Please describe your requirements' })}
                        error={!!errors.description} helperText={errors.description?.message}
                        placeholder="Please describe your project requirements, timeline, any specific technology preferences, and any other relevant details..." />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ border: '2px dashed #e2e8f0', borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', bgcolor: '#f8faff' }}
                           onClick={() => document.getElementById('file-upload').click()}>
                        <input id="file-upload" type="file" hidden onChange={e => setFile(e.target.files[0])}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg" />
                        {file ? (
                          <div className="flex items-center justify-center gap-2">
                            <Chip label={file.name} onDelete={() => setFile(null)} />
                          </div>
                        ) : (
                          <>
                            <Typography variant="body2" color="text.secondary">📎 Attach Supporting Documents</Typography>
                            <Typography variant="caption" color="text.secondary">PDF, Word, Excel, Images (max 10MB)</Typography>
                          </>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}
                        sx={{ py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #0052cc, #003d99)' }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Inquiry →'}
                      </Button>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
                        🔒 Your information is secure. We typically respond within 24 business hours.
                      </Typography>
                    </Grid>
                  </Grid>
                </form>
              </motion.div>
            )}

            {/* Why contact us */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
              {[
                { icon: '⚡', title: 'Fast Response', desc: 'We respond within 24 hours' },
                { icon: '🎯', title: 'Tailored Proposals', desc: 'Custom solutions for your needs' },
                { icon: '🤝', title: 'No Obligation', desc: 'Free consultation & proposal' },
              ].map(item => (
                <div key={item.title} className="text-center p-5 rounded-xl bg-gray-50">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-dark-800 text-sm">{item.title}</div>
                  <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


