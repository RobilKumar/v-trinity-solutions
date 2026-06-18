import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Chip, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../services/api';

const FALLBACK_CASE_STUDIES = [
  {
    id: 1,
    Title: 'Ministry of Interior – Nationwide CCTV Network',
    Slug: 'ministry-interior-cctv-case-study',
    Sector: 'Government',
    SectorColor: '#1565C0',
    Summary:
      'Complete CCTV transformation for the Ministry of Interior across all 45 facilities in Saudi Arabia — delivered on time, zero incidents.',
    Results: [
      '99.98% system uptime achieved across all 45 facilities',
      '65% faster incident response time post-deployment',
      '2,400 cameras deployed with centralised NOC monitoring',
    ],
  },
  {
    id: 2,
    Title: 'National Bank – Zero Trust Security Implementation',
    Slug: 'national-bank-zero-trust-case-study',
    Sector: 'Banking',
    SectorColor: '#2E7D32',
    Summary:
      'Complete cybersecurity overhaul of a 120-branch bank, achieving PCI-DSS certification and Zero Trust architecture in just 6 months.',
    Results: [
      'PCI-DSS certified on first audit attempt',
      'Zero security incidents in 18 months post-implementation',
      'Mean time to detect (MTTD) reduced from 45 min to 4 min',
    ],
  },
  {
    id: 3,
    Title: 'Smart Campus Network – University of Technology',
    Slug: 'smart-campus-network',
    Sector: 'Education',
    SectorColor: '#6A1B9A',
    Summary:
      'Complete campus network transformation covering 8 buildings and 15,000 students with smart IoT integration.',
    Results: [
      '40 Gbps backbone — supports 20,000 concurrent devices',
      '99.99% network availability achieved',
      'Smart classroom integration complete across all buildings',
    ],
  },
  {
    id: 4,
    Title: 'Airport Terminal Expansion – CCTV & Access Control',
    Slug: 'airport-cctv-access',
    Sector: 'Transport',
    SectorColor: '#E65100',
    Summary:
      'Security systems for a new terminal handling 15 million passengers per year — 1,800 cameras and 380 access control points.',
    Results: [
      '1,800 cameras with facial recognition deployed',
      '380 access control points across 50+ secure zones',
      'Full ICAO compliance, on-time for terminal opening',
    ],
  },
];

const SECTOR_COLORS = {
  Government: '#1565C0',
  Banking: '#2E7D32',
  Education: '#6A1B9A',
  Transport: '#E65100',
  Healthcare: '#C62828',
  Technology: '#00695C',
};

function getSectorColor(sector) {
  return SECTOR_COLORS[sector] || '#455A64';
}

function parseResults(results) {
  if (Array.isArray(results)) return results;
  if (typeof results === 'string') {
    try {
      const parsed = JSON.parse(results);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
    return results.split('\n').filter(Boolean).slice(0, 3);
  }
  return [];
}

export default function CaseStudies() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/public/case-studies')
      .then((r) => {
        const data = r?.data?.data || r?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setCaseStudies(data);
        } else {
          setCaseStudies(FALLBACK_CASE_STUDIES);
        }
      })
      .catch(() => {
        setCaseStudies(FALLBACK_CASE_STUDIES);
      })
      .finally(() => setLoading(false));
  }, []);

  const displayStudies = caseStudies.length > 0 ? caseStudies : FALLBACK_CASE_STUDIES;

  return (
    <>
      <Helmet>
        <title>Case Studies – V-Trinity Solutions</title>
        <meta
          name="description"
          content="Real-world results from enterprise IT, cybersecurity, and surveillance projects across government, banking, education, and more."
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
              Proven Results
            </span>
            <h1 className="text-5xl font-bold font-heading text-white mt-3 mb-4">
              Case Studies
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Real projects. Real results. Explore how V-Trinity Solutions has helped enterprises across
              government, banking, education, and transport achieve measurable outcomes.
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pb-10"
          >
            {[
              { value: '200+', label: 'Projects Delivered' },
              { value: '15+', label: 'Countries' },
              { value: '98%', label: 'Client Satisfaction' },
              { value: '$500M+', label: 'Projects Value' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-blue-300 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="section-padding bg-gray-50">
        <div className="container-xl">
          {loading ? (
            <div className="text-center py-20">
              <CircularProgress size={48} />
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {displayStudies.map((cs, i) => {
                const sector = cs.Sector || cs.sector || 'Technology';
                const sectorColor = cs.SectorColor || getSectorColor(sector);
                const results = parseResults(cs.Results || cs.results || []);
                const slug = cs.Slug || cs.slug || '#';
                const title = cs.Title || cs.title || 'Case Study';
                const summary = cs.Summary || cs.summary || '';

                return (
                  <motion.div
                    key={cs.id || cs.CaseStudyID || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {/* Card header accent */}
                    <div
                      style={{
                        background: `linear-gradient(135deg, ${sectorColor}22, ${sectorColor}44)`,
                        borderTop: `4px solid ${sectorColor}`,
                      }}
                      className="px-8 pt-8 pb-6"
                    >
                      <Chip
                        label={sector}
                        size="small"
                        sx={{
                          backgroundColor: sectorColor,
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          mb: 2,
                        }}
                      />
                      <h2 className="text-xl font-bold text-dark-800 font-heading leading-tight">
                        {title}
                      </h2>
                    </div>

                    {/* Card body */}
                    <div className="px-8 py-6 flex flex-col flex-1">
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">{summary}</p>

                      {results.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Key Results
                          </p>
                          <ul className="space-y-2">
                            {results.map((result, ri) => (
                              <li key={ri} className="flex items-start gap-2 text-sm text-gray-700">
                                <span
                                  className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                                  style={{ backgroundColor: sectorColor, fontSize: 10 }}
                                >
                                  ✓
                                </span>
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-auto">
                        <Link
                          to={`/case-studies/${slug}`}
                          className="inline-flex items-center gap-2 font-semibold text-sm transition-colors"
                          style={{ color: sectorColor }}
                        >
                          Read Full Story
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
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
              Ready to Become Our Next Success Story?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Tell us about your project and our experts will design a solution tailored to your
              needs.
            </p>
            <Link
              to="/request-solution"
              className="inline-block bg-white text-primary-700 font-bold px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Request a Solution
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
}


