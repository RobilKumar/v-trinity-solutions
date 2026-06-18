import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';

// Renders FA class string as <i> or emoji/text as-is
const Icon = ({ value, className = '' }) => {
  if (!value) return null;
  if (typeof value === 'string' && (value.startsWith('fa') || value.startsWith('fas ') || value.startsWith('far ') || value.startsWith('fab '))) {
    return <i className={`${value} ${className}`} />;
  }
  return <span className={className}>{value}</span>;
};

// ---- Animation helpers ----
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' } }),
};

const Section = ({ children, className = '' }) => {
  const ref = useRef();
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
};

// ---- Counter component ----
function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef();
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const num = parseInt(value.replace(/\D/g, ''));
    const duration = 2000;
    const step = num / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const [data, setData] = useState({ banners: [], stats: [], whyUs: [], featuredServices: [], featuredProjects: [], testimonials: [], partners: [] });
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    api.get('/public/home').then(r => setData(prev => ({ ...prev, ...r.data.data }))).catch(() => {});
    const timer = setInterval(() => setBannerIdx(i => (i + 1) % Math.max(data.banners.length, 1)), 6000);
    return () => clearInterval(timer);
  }, [data.banners.length]);

  const currentBanner = data.banners[bannerIdx] || {
    Title: 'Enterprise IT & Security Solutions',
    Subtitle: 'Trusted Technology Partner',
    Description: 'Delivering world-class CCTV surveillance, IT infrastructure, networking, cloud and cybersecurity solutions for enterprises.',
    ButtonText: 'Explore Services',
    ButtonURL: '/services',
    Button2Text: 'Request a Solution',
    Button2URL: '/request-solution',
  };

  const SERVICES = [
    { icon: '📹', title: 'CCTV Surveillance',  desc: 'Advanced IP cameras, PTZ systems, AI analytics and command centers.',    slug: 'cctv-surveillance',   color: '#0052cc' },
    { icon: '🖥️', title: 'IT Infrastructure',  desc: 'Data center setup, server deployment, storage and virtualization.',      slug: 'it-infrastructure',   color: '#7c3aed' },
    { icon: '🛡️', title: 'Cyber Security',     desc: 'SOC, SIEM, SOAR, penetration testing and compliance management.',        slug: 'cyber-security',      color: '#dc2626' },
    { icon: '☁️', title: 'Cloud Services',     desc: 'AWS, Azure, GCP, hybrid cloud, backup and disaster recovery.',           slug: 'cloud-services',      color: '#059669' },
    { icon: '🔧', title: 'Managed Services',   desc: 'AMC, NOC monitoring, helpdesk support 24×7.',                            slug: 'managed-services',    color: '#d97706' },
    { icon: '🌐', title: 'Networking',         desc: 'Structured cabling, wireless networks and network design.',              slug: 'networking',           color: '#0891b2' },
  ];

  return (
    <>
      <Helmet>
        <title>V-Trinity Solutions – Enterprise IT, CCTV & Cybersecurity</title>
        <meta name="description" content="Enterprise IT Infrastructure, CCTV Surveillance, Cybersecurity and Cloud Solutions." />
      </Helmet>

      {/* ===== HERO ===== */}
      <section className="hero-section min-h-screen flex items-center pt-20" style={{ position: 'relative' }}>
        {/* Animated background orbs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '15%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,82,204,0.15), transparent)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '20%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,216,0.12), transparent)', filter: 'blur(80px)' }} />
        </div>

        <div className="container-xl py-20" style={{ position: 'relative', zIndex: 1 }}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
                   style={{ background: 'rgba(0,82,204,0.2)', border: '1px solid rgba(0,82,204,0.4)', color: '#4d90ff' }}>
                <span className="animate-pulse-glow w-2 h-2 rounded-full bg-secondary-500 inline-block"></span>
                {currentBanner.Subtitle || 'Trusted Technology Partner'}
              </div>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold font-heading text-white leading-tight mb-6">
                {currentBanner.Title}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl">
                {currentBanner.Description}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={currentBanner.ButtonURL || '/services'} className="btn-primary text-base">
                  {currentBanner.ButtonText || 'Explore Services'} →
                </Link>
                <Link to={currentBanner.Button2URL || '/request-solution'} className="btn-outline text-base">
                  {currentBanner.Button2Text || 'Request a Solution'}
                </Link>
              </div>
            </motion.div>

            {/* Hero right side: cards */}
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4">
              {SERVICES.slice(0, 4).map((s, i) => (
                <motion.div key={s.slug} custom={i} variants={fadeUp}
                  className="rounded-2xl p-5 backdrop-blur-sm"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-1">{s.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Banner dots */}
        {data.banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
            {data.banners.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'w-6 bg-secondary-500' : 'bg-white/30'}`} />
            ))}
          </div>
        )}
      </section>

      {/* ===== STATS ===== */}
      <section style={{ background: 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)' }} className="py-16">
        <div className="container-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {(data.stats.length ? data.stats : [
              { Label: 'Projects Completed', Value: '500', Suffix: '+', Icon: '🏗️' },
              { Label: 'Happy Clients',       Value: '350', Suffix: '+', Icon: '😊' },
              { Label: 'Years Experience',    Value: '15',  Suffix: '+', Icon: '📅' },
              { Label: 'Expert Engineers',    Value: '120', Suffix: '+', Icon: '👨‍💻' },
            ]).map((stat, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} className="stat-card">
                <div className="text-3xl mb-2"><Icon value={stat.Icon} /></div>
                <div className="stat-number">
                  <AnimatedCounter value={stat.Value} suffix={stat.Suffix} />
                </div>
                <div className="text-blue-200 text-sm mt-1 font-medium">{stat.Label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <Section className="section-padding bg-white">
        <div className="container-xl">
          <div className="text-center mb-12">
            <motion.span variants={fadeUp} className="text-primary-500 font-semibold text-sm uppercase tracking-widest">What We Do</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="section-title mt-2">Comprehensive Technology Services</motion.h2>
            <motion.p variants={fadeUp} custom={2} className="section-subtitle mx-auto text-center">
              End-to-end IT solutions designed for enterprise-scale challenges
            </motion.p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.featuredServices.length ? data.featuredServices : SERVICES).map((s, i) => (
              <motion.div key={i} custom={i} variants={fadeUp}>
                <Link to={`/services/${s.slug || s.Slug}`} className="service-card block h-full">
                  <div className="icon-wrap"><Icon value={s.icon || s.Icon || '🔧'} /></div>
                  <h3 className="text-lg font-semibold text-dark-800 mb-2">{s.title || s.Title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc || s.ShortDesc}</p>
                  <div className="mt-4 text-primary-500 font-medium text-sm">Learn more →</div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/services" className="btn-primary">View All Services →</Link>
          </div>
        </div>
      </Section>

      {/* ===== WHY CHOOSE US ===== */}
      <Section className="section-padding" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 100%)' }}>
        <div className="container-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.span variants={fadeUp} className="text-primary-500 font-semibold text-sm uppercase tracking-widest">Why V-Trinity Solutions</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="section-title mt-2">
                Your Trusted Enterprise Technology Partner
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-gray-500 leading-relaxed mb-8">
                With 15+ years of experience, we deliver cutting-edge technology solutions that help enterprises achieve operational excellence and stay secure.
              </motion.p>
              <div className="space-y-4">
                {(data.whyUs.length ? data.whyUs : [
                  { Title: '15+ Years Experience', Description: 'Proven track record of successful enterprise deployments.' },
                  { Title: 'Certified Engineers',   Description: 'CISSP, CCNA, AWS and Azure certified professionals.' },
                  { Title: '24/7 Support',          Description: 'Round-the-clock NOC and helpdesk support.' },
                  { Title: 'End-to-End Solutions',  Description: 'From design to deployment to managed services.' },
                ]).map((item, i) => (
                  <motion.div key={i} custom={i} variants={fadeUp} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                         style={{ background: 'linear-gradient(135deg, #0052cc, #00b4d8)' }}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-800">{item.Title}</h4>
                      <p className="text-gray-500 text-sm">{item.Description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link to="/about" className="btn-primary mt-8 inline-flex">Learn About Us →</Link>
            </div>
            <motion.div variants={fadeUp} custom={3}
              className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #0052cc, #003d99)', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="text-center text-white p-10">
                <div className="text-8xl mb-4">🛡️</div>
                <p className="text-2xl font-bold">Protecting Enterprise Assets</p>
                <p className="text-blue-200 mt-2">Since 2009</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ===== FEATURED PROJECTS ===== */}
      {data.featuredProjects.length > 0 && (
        <Section className="section-padding bg-white">
          <div className="container-xl">
            <div className="text-center mb-12">
              <motion.span variants={fadeUp} className="text-primary-500 font-semibold text-sm uppercase tracking-widest">Our Work</motion.span>
              <motion.h2 variants={fadeUp} custom={1} className="section-title mt-2">Featured Projects</motion.h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.featuredProjects.slice(0, 6).map((proj, i) => (
                <motion.div key={proj.ProjectID} custom={i} variants={fadeUp}>
                  <Link to={`/projects/${proj.Slug}`}
                    className="block rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow border border-gray-100">
                    <div className="h-48 bg-gradient-to-br from-primary-600 to-secondary-500 flex items-center justify-center">
                      {proj.ThumbnailURL ? (
                        <img src={proj.ThumbnailURL} alt={proj.ProjectName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-6xl">🏗️</span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-semibold text-primary-500 uppercase">{proj.IndustryName}</span>
                      <h3 className="font-semibold text-dark-800 mt-1 mb-1">{proj.ProjectName}</h3>
                      <p className="text-gray-500 text-sm">{proj.ClientName} · {proj.Location}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/projects" className="btn-primary">View All Projects →</Link>
            </div>
          </div>
        </Section>
      )}

      {/* ===== INDUSTRIES ===== */}
      <Section className="section-padding" style={{ background: 'linear-gradient(135deg, #0a0e1a, #0d1b3e)' }}>
        <div className="container-xl">
          <div className="text-center mb-12">
            <motion.span variants={fadeUp} className="text-secondary-500 font-semibold text-sm uppercase tracking-widest">Industries</motion.span>
            <motion.h2 variants={fadeUp} custom={1} className="section-title mt-2 text-white">Industries We Serve</motion.h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { icon: '🏛️', name: 'Government' },
              { icon: '🏥', name: 'Healthcare' },
              { icon: '🏭', name: 'Manufacturing' },
              { icon: '🎓', name: 'Education' },
              { icon: '🏦', name: 'Banking' },
              { icon: '🏨', name: 'Hospitality' },
              { icon: '🛍️', name: 'Retail' },
            ].map((ind, i) => (
              <motion.div key={ind.name} custom={i} variants={fadeUp}
                className="text-center p-4 rounded-xl cursor-pointer group"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-4xl mb-2">{ind.icon}</div>
                <div className="text-gray-300 text-xs font-medium group-hover:text-white transition-colors">{ind.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===== TESTIMONIALS ===== */}
      {data.testimonials.length > 0 && (
        <Section className="section-padding bg-white">
          <div className="container-xl">
            <div className="text-center mb-12">
              <motion.h2 variants={fadeUp} className="section-title">What Our Clients Say</motion.h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.testimonials.slice(0, 3).map((t, i) => (
                <motion.div key={t.TestimonialID} custom={i} variants={fadeUp}
                  className="p-6 rounded-2xl border border-gray-100"
                  style={{ boxShadow: '0 4px 20px rgba(0,82,204,0.06)' }}>
                  <div className="flex gap-1 mb-4">
                    {Array(t.Rating).fill(0).map((_, j) => <span key={j} className="text-yellow-400 text-sm">★</span>)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.Content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {t.AvatarURL ? <img src={t.AvatarURL} alt={t.ClientName} className="w-full h-full rounded-full object-cover" /> : t.ClientName[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-dark-800 text-sm">{t.ClientName}</div>
                      <div className="text-gray-400 text-xs">{t.Designation}, {t.Company}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ===== CTA ===== */}
      <Section>
        <div className="section-padding" style={{ background: 'linear-gradient(135deg, #0052cc 0%, #00b4d8 100%)' }}>
          <div className="container-xl text-center">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold font-heading text-white mb-4">
              Ready to Secure Your Enterprise?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
              Get a free consultation and customized solution proposal from our expert team.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-4 justify-center">
              <Link to="/request-solution" className="btn-outline text-base">
                Request a Solution
              </Link>
              <Link to="/contact" className="bg-white text-primary-600 hover:bg-gray-50 btn-primary text-base">
                Contact Us
              </Link>
            </motion.div>
          </div>
        </div>
      </Section>
    </>
  );
}


