import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { TextField, Button, Alert, CircularProgress, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../../services/api';

export default function Contact() {
  const { settings, locations } = useSelector(s => s.settings);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true); setError('');
    try {
      await api.post('/contact', data);
      setSuccess(true); reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us – V-Trinity Solutions</title>
      </Helmet>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0a0e1a, #0d1b3e)', paddingTop: 80 }}>
        <div className="container-xl py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">Get in Touch</h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto">
              Our team is ready to help. Reach out and we'll respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="section-padding bg-white">
        <div className="container-xl">
          <Grid container spacing={6}>
            {/* Contact info */}
            <Grid item xs={12} md={4}>
              <h2 className="text-2xl font-bold text-dark-800 mb-6">Contact Information</h2>
              <div className="space-y-5">
                {[
                  { icon: '📞', label: 'Phone', value: settings.contact_phone },
                  { icon: '✉️', label: 'Email', value: settings.contact_email },
                  { icon: '📍', label: 'Head Office', value: settings.office_address },
                ].filter(i => i.value).map(item => (
                  <div key={item.label} className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                         style={{ background: 'linear-gradient(135deg, rgba(0,82,204,0.1), rgba(0,180,216,0.1))' }}>
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-dark-800 text-sm">{item.label}</div>
                      <div className="text-gray-500 text-sm">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Grid>

            {/* Form */}
            <Grid item xs={12} md={8}>
              <div className="bg-gray-50 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-dark-800 mb-6">Send a Message</h2>
                {success ? (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Message sent! We'll get back to you within 24 hours.
                  </Alert>
                ) : null}
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Your Name *" {...register('name', { required: true })} error={!!errors.name} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email Address *" type="email" {...register('email', { required: true })} error={!!errors.email} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Phone Number" {...register('phone')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Subject" {...register('subject')} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth multiline rows={5} label="Message *" {...register('message', { required: true })} error={!!errors.message} />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" size="large" disabled={loading}
                        sx={{ py: 1.5, px: 6, background: 'linear-gradient(135deg, #0052cc, #003d99)' }}>
                        {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Message →'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </>
  );
}


