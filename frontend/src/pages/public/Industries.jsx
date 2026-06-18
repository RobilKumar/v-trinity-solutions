import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Icon = ({ value, className = '' }) => {
  if (!value) return null;
  if (typeof value === 'string' && /^fa[srab]?\s+fa-/.test(value))
    return <i className={`${value} ${className}`} style={{ fontSize: '2.5rem' }} />;
  return <span className={className}>{value}</span>;
};

const FALLBACK_INDUSTRIES = [
  {
    Slug: 'government',
    Name: 'Government',
    Icon: '🏛️',
    Description:
      'Secure government facilities, smart city infrastructure, and national security systems.',
    ProjectCount: 45,
  },
  {
    Slug: 'healthcare',
    Name: 'Healthcare',
    Icon: '🏥',
    Description:
      'Healthcare IT infrastructure, HIPAA-compliant networks, and hospital security systems.',
    ProjectCount: 28,
  },
  {
    Slug: 'banking',
    Name: 'Banking & Finance',
    Icon: '🏦',
    Description:
      'PCI-DSS compliant networks, branch connectivity, cybersecurity, and ATM surveillance.',
    ProjectCount: 36,
  },
  {
    Slug: 'manufacturing',
    Name: 'Manufacturing',
    Icon: '🏭',
    Description:
      'Industrial OT/IT convergence, factory automation networks, and production facility security.',
    ProjectCount: 22,
  },
  {
    Slug: 'education',
    Name: 'Education',
    Icon: '🎓',
    Description:
      'Smart campus networks, e-learning infrastructure, and campus security systems.',
    ProjectCount: 19,
  },
  {
    Slug: 'hospitality',
    Name: 'Hospitality',
    Icon: '🏨',
    Description:
      'Hotel property management networks, guest Wi-Fi, surveillance, and smart building systems.',
    ProjectCount: 14,
  },
  {
    Slug: 'retail',
    Name: 'Retail',
    Icon: '🛍️',
    Description:
      'Retail loss prevention, POS network infrastructure, and multi-branch connectivity.',
    ProjectCount: 17,
  },
  {
    Slug: 'oil-gas',
    Name: 'Oil & Gas',
    Icon: '⚙️',
    Description:
      'Ruggedised OT/IT networks for refineries, remote site connectivity, and IEC 62443 compliance.',
    ProjectCount: 11,
  },
  {
    Slug: 'telecom',
    Name: 'Telecom',
    Icon: '📡',
    Description:
      'Carrier-grade network infrastructure, data centre interconnects, and NOC/SOC solutions.',
    ProjectCount: 9,
  },
  {
    Slug: 'real-estate',
    Name: 'Real Estate',
    Icon: '🏢',
    Description:
      'Smart building automation, IP surveillance for commercial properties, and structured cabling.',
    ProjectCount: 13,
  },
];

const EMOJI_FALLBACKS = [
  '🏛️','🏥','🏭','🎓','🏦','🏨','🛍️','⚙️','📡','🏢',
];

export default function Industries() {
  const [industries, setIndustries] = useState(FALLBACK_INDUSTRIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/public/industries')
      .then((r) => {
        const data = r?.data?.data || r?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setIndustries(data);
        }
        // else keep fallback
      })
      .catch(() => {
        // keep fallback — already set
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Helmet>
        <title>Industries We Serve – V-Trinity Solutions</title>
        <meta
          name="description"
          content="V-Trinity Solutions delivers tailored IT, cybersecurity, and surveillance solutions across government, healthcare, banking, education, and more."
        />
      </Helmet>

      {/* Hero */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1b3e 50%, #0a1628 100%)',
          paddingTop: 80,
        }}
      >
        <div className="container-xl py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-secondary-500 font-semibold text-sm uppercase tracking-widest">
              Sectors We Serve
            </span>
            <h1 className="text-5xl font-bold font-heading text-white mt-3 mb-4">
              Industries We Serve
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Tailored technology solutions for every major industry vertical — from government
              and banking to healthcare and manufacturing.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Industries Grid */}
      <div className="section-padding bg-white">
        <div className="container-xl">
          {loading ? (
            <div className="text-center py-20">
              <CircularProgress size={48} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {industries.map((ind, i) => {
                const name = ind.Name || ind.name || 'Industry';
                const slug = ind.Slug || ind.slug || '#';
                const icon = ind.Icon || ind.icon || EMOJI_FALLBACKS[i % EMOJI_FALLBACKS.length];
                const description =
                  ind.Description ||
                  ind.description ||
                  'Enterprise-grade solutions tailored for this sector.';
                const projectCount = ind.ProjectCount || ind.project_count || null;

                return (
                  <motion.div
                    key={slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.4 }}
                  >
                    <div className="text-center p-8 rounded-2xl border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 cursor-pointer group h-full flex flex-col items-center">
                      <div className="text-5xl mb-4"><Icon value={icon} /></div>
                      <h3 className="font-bold text-lg text-dark-800 group-hover:text-primary-600 transition-colors mb-2">
                        {name}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1">{description}</p>
                      {projectCount !== null && (
                        <p className="text-xs text-primary-500 font-semibold mt-3">
                          {projectCount}+ Projects Delivered
                        </p>
                      )}
                      <Link
                        to="/request-solution"
                        className="mt-4 text-primary-500 text-sm font-semibold inline-block opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Get a Solution →
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div
        className="section-padding"
        style={{ background: 'linear-gradient(135deg, #0052cc, #00b4d8)' }}
      >
        <div className="container-xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold font-heading text-white mb-4">
              Don't see your industry?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              We deliver custom solutions for any business vertical. Talk to our experts today.
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-primary-700 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Contact Our Team
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}


