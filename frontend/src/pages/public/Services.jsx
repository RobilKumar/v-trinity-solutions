import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Chip, CircularProgress } from '@mui/material';
import api from '../../services/api';

const Icon = ({ value, className = '' }) => {
  if (!value) return null;
  if (typeof value === 'string' && /^fa[srab]?\s+fa-/.test(value)) return <i className={`${value} ${className}`} />;
  return <span className={className}>{value}</span>;
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('cat') || '';

  useEffect(() => {
    Promise.all([
      api.get('/services/categories'),
      api.get(`/services${activeCategory ? `?category=${activeCategory}` : ''}`),
    ]).then(([catR, svcR]) => {
      setCategories(catR.data.data);
      setServices(svcR.data.data);
    }).finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <>
      <Helmet>
        <title>Services – V-Trinity Solutions</title>
      </Helmet>
      <div style={{ background: 'linear-gradient(135deg, #0a0e1a, #0d1b3e)', paddingTop: 80 }}>
        <div className="container-xl py-16 text-center">
          <h1 className="text-5xl font-bold font-heading text-white mb-4">Our Services</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Comprehensive technology services tailored to enterprise needs.
          </p>
        </div>
      </div>

      <div className="section-padding bg-white">
        <div className="container-xl">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10">
            <Chip label="All Services" clickable variant={!activeCategory ? 'filled' : 'outlined'} color={!activeCategory ? 'primary' : 'default'}
              onClick={() => setSearchParams({})} />
            {categories.map(cat => (
              <Chip key={cat.slug} label={cat.name} clickable
                variant={activeCategory === cat.slug ? 'filled' : 'outlined'}
                color={activeCategory === cat.slug ? 'primary' : 'default'}
                onClick={() => setSearchParams({ cat: cat.slug })} />
            ))}
          </div>

          {loading ? (
            <div className="text-center py-16"><CircularProgress /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc, i) => (
                <motion.div key={svc.service_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/services/${svc.slug}`} className="service-card block h-full">
                    <div className="icon-wrap"><Icon value={svc.icon || '🛠️'} /></div>
                    <div className="text-xs font-semibold text-primary-500 uppercase mb-1">{svc.category_name}</div>
                    <h3 className="text-lg font-semibold text-dark-800 mb-2">{svc.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{svc.short_desc}</p>
                    <div className="mt-4 text-primary-500 font-medium text-sm">Learn more →</div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !services.length && (
            <div className="text-center py-16 text-gray-400">No services found.</div>
          )}
        </div>
      </div>
    </>
  );
}


