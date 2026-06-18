import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

/** V-Trinity Solutions brand mark SVG — used in both navbar and footer */
const VTrinitiLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pllg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1a4fa0"/>
        <stop offset="100%" stopColor="#00c8d4"/>
      </linearGradient>
      <linearGradient id="pllg2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00c8d4"/>
        <stop offset="100%" stopColor="#1a4fa0"/>
      </linearGradient>
    </defs>
    <polygon points="100,18 172,142 28,142" fill="none" stroke="url(#pllg1)" strokeWidth="11" strokeLinejoin="round"/>
    <polygon points="100,182 28,58 172,58" fill="none" stroke="url(#pllg2)" strokeWidth="11" strokeLinejoin="round"/>
    <polyline points="72,88 100,128 128,88" fill="none" stroke="url(#pllg1)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="100" y1="73" x2="100" y2="113" stroke="url(#pllg2)" strokeWidth="8" strokeLinecap="round"/>
    <line x1="82"  y1="93" x2="118" y2="93"  stroke="url(#pllg2)" strokeWidth="8" strokeLinecap="round"/>
  </svg>
);

const NAV_ITEMS = [
  { label: 'Home',       path: '/' },
  { label: 'About',      path: '/about' },
  {
    label: 'Services', path: '/services',
    children: [
      { label: 'CCTV Surveillance',  path: '/services?cat=cctv-surveillance' },
      { label: 'IT Infrastructure',  path: '/services?cat=it-infrastructure' },
      { label: 'Cyber Security',     path: '/services?cat=cyber-security' },
      { label: 'Managed Services',   path: '/services?cat=managed-services' },
      { label: 'Cloud Services',     path: '/services?cat=cloud-services' },
    ],
  },
  { label: 'Solutions',  path: '/solutions' },
  { label: 'Industries', path: '/industries' },
  { label: 'Projects',   path: '/projects' },
  { label: 'Blog',       path: '/blog' },
  { label: 'Careers',    path: '/careers' },
  { label: 'Contact',    path: '/contact' },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { settings, socialLinks } = useSelector(s => s.settings);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-dark-900 text-gray-400 text-xs py-2 hidden md:block">
        <div className="container-xl flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span>📞 {settings.contact_phone || '+1 (800) 123-4567'}</span>
            <span>✉️ {settings.contact_email || 'info@v-trinitysolutions.com'}</span>
          </div>
          <div className="flex items-center gap-3">
            {socialLinks.map(s => (
              <a key={s.SocialID} href={s.URL} target="_blank" rel="noopener noreferrer"
                 className="hover:text-secondary-500 transition-colors">
                <i className={s.Icon}></i>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'navbar-scrolled' : 'bg-dark-900/95 backdrop-blur-md'
      } ${location.pathname !== '/' ? 'relative' : 'fixed'}`}
           style={{ top: location.pathname !== '/' ? 0 : scrolled ? 0 : '32px' }}>
        <div className="container-xl">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <VTrinitiLogo size={40} />
              <span className="text-white font-bold text-lg leading-none font-heading">
                {settings.site_name || 'V-Trinity Solutions'}
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <div key={item.label} className="relative"
                     onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                     onMouseLeave={() => setActiveDropdown(null)}>
                  <Link to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1
                      ${location.pathname === item.path
                        ? 'text-secondary-500'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                    {item.label}
                    {item.children && <span className="text-xs">▾</span>}
                  </Link>

                  {item.children && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-1 w-56 rounded-xl shadow-2xl overflow-hidden"
                      style={{ background: 'linear-gradient(135deg, #0d1b3e, #0a0e1a)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {item.children.map(child => (
                        <Link key={child.path} to={child.path}
                          className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link to="/request-solution" className="btn-primary text-sm">
                Request a Solution
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button className="lg:hidden text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              <span className="text-2xl">{mobileOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-dark-900 border-t border-white/10">
              <div className="container-xl py-4 flex flex-col gap-1">
                {NAV_ITEMS.map(item => (
                  <Link key={item.label} to={item.path}
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg text-sm font-medium">
                    {item.label}
                  </Link>
                ))}
                <Link to="/request-solution" className="btn-primary text-sm mt-3 justify-center">
                  Request a Solution
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer settings={settings} socialLinks={socialLinks} />
    </div>
  );
}

function Footer({ settings, socialLinks }) {
  return (
    <footer style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #050810 100%)' }}>
      <div className="container-xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <VTrinitiLogo size={40} />
              <div>
                <div className="text-white font-bold text-lg">{settings.site_name || 'V-Trinity Solutions'}</div>
                <div className="text-gray-500 text-xs">{settings.site_tagline || 'Securing Tomorrow, Today'}</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {settings.site_description || 'Enterprise IT Infrastructure, CCTV Surveillance, Networking & Cybersecurity Solutions.'}
            </p>
            <div className="flex gap-3">
              {socialLinks.map(s => (
                <a key={s.SocialID} href={s.URL} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-primary-600 transition-all">
                  <i className={s.Icon}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['CCTV Surveillance','IT Infrastructure','Cyber Security','Managed Services','Cloud Services'].map(s => (
                <li key={s}><Link to="/services" className="hover:text-secondary-500 transition-colors">{s}</Link></li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[['About Us','/about'],['Projects','/projects'],['Blog','/blog'],['Careers','/careers'],['Contact','/contact']].map(([l,p]) => (
                <li key={l}><Link to={p} className="hover:text-secondary-500 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex gap-2">
                <span>📍</span>
                <span>{settings.office_address || '123 Tech Park, Silicon Valley, CA'}</span>
              </div>
              <div className="flex gap-2">
                <span>📞</span>
                <span>{settings.contact_phone || '+1 (800) 123-4567'}</span>
              </div>
              <div className="flex gap-2">
                <span>✉️</span>
                <span>{settings.contact_email || 'info@v-trinitysolutions.com'}</span>
              </div>
            </div>
            <Link to="/request-solution"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #e55a25)' }}>
              Get Free Consultation →
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="container-xl py-4 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500">
          <span>{settings.copyright_text || '© 2024 V-Trinity Solutions. All Rights Reserved.'}</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}



