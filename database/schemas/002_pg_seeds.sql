-- ============================================================
-- V-Trinity Solutions — PostgreSQL Seed Data
-- ============================================================

-- ROLES
INSERT INTO roles (role_name, description) VALUES
('Super Admin',    'Full system access'),
('Admin',          'Full CMS access except system settings'),
('Sales Team',     'Manage inquiries and quotations'),
('Marketing Team', 'Manage blog, projects, and media'),
('Content Editor', 'Manage content and blog'),
('HR',             'Manage careers and job applications'),
('Support Team',   'Manage support tickets'),
('Customer',       'Customer portal access')
ON CONFLICT (role_name) DO NOTHING;

-- PERMISSIONS
INSERT INTO permissions (permission_key, module, description) VALUES
('dashboard.view',    'Dashboard',  'View dashboard'),
('users.view',        'Users',      'View users'),
('users.create',      'Users',      'Create users'),
('users.edit',        'Users',      'Edit users'),
('users.delete',      'Users',      'Delete users'),
('services.view',     'Services',   'View services'),
('services.create',   'Services',   'Create services'),
('services.edit',     'Services',   'Edit services'),
('services.delete',   'Services',   'Delete services'),
('solutions.view',    'Solutions',  'View solutions'),
('solutions.create',  'Solutions',  'Create solutions'),
('solutions.edit',    'Solutions',  'Edit solutions'),
('solutions.delete',  'Solutions',  'Delete solutions'),
('projects.view',     'Projects',   'View projects'),
('projects.create',   'Projects',   'Create projects'),
('projects.edit',     'Projects',   'Edit projects'),
('projects.delete',   'Projects',   'Delete projects'),
('blog.view',         'Blog',       'View blog posts'),
('blog.create',       'Blog',       'Create blog posts'),
('blog.edit',         'Blog',       'Edit blog posts'),
('blog.delete',       'Blog',       'Delete blog posts'),
('blog.publish',      'Blog',       'Publish blog posts'),
('inquiries.view',    'Inquiries',  'View inquiries'),
('inquiries.manage',  'Inquiries',  'Manage inquiry status'),
('careers.view',      'Careers',    'View job listings'),
('careers.create',    'Careers',    'Create job listings'),
('careers.edit',      'Careers',    'Edit job listings'),
('careers.delete',    'Careers',    'Delete job listings'),
('media.view',        'Media',      'View media library'),
('media.upload',      'Media',      'Upload files'),
('media.delete',      'Media',      'Delete files'),
('settings.view',     'Settings',   'View settings'),
('settings.edit',     'Settings',   'Edit settings'),
('seo.view',          'SEO',        'View SEO settings'),
('seo.edit',          'SEO',        'Edit SEO settings'),
('tickets.view',      'Support',    'View support tickets'),
('tickets.manage',    'Support',    'Manage support tickets'),
('customers.view',    'Customers',  'View customers'),
('customers.manage',  'Customers',  'Manage customers')
ON CONFLICT (permission_key) DO NOTHING;

-- Super Admin — all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, permission_id FROM permissions
ON CONFLICT DO NOTHING;

-- Admin — all except users.delete
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, permission_id FROM permissions WHERE permission_key != 'users.delete'
ON CONFLICT DO NOTHING;

-- Sales Team
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, permission_id FROM permissions
WHERE module IN ('Dashboard','Inquiries','Customers') OR permission_key IN ('media.view','media.upload','tickets.view','tickets.manage')
ON CONFLICT DO NOTHING;

-- Marketing Team
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, permission_id FROM permissions WHERE module IN ('Dashboard','Blog','Projects','Solutions','Media','SEO')
ON CONFLICT DO NOTHING;

-- Content Editor
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, permission_id FROM permissions
WHERE module IN ('Dashboard','Blog','Media') OR permission_key IN ('services.view','services.edit','projects.view')
ON CONFLICT DO NOTHING;

-- HR
INSERT INTO role_permissions (role_id, permission_id)
SELECT 6, permission_id FROM permissions WHERE module IN ('Dashboard','Careers') OR permission_key IN ('media.view','media.upload')
ON CONFLICT DO NOTHING;

-- Support Team
INSERT INTO role_permissions (role_id, permission_id)
SELECT 7, permission_id FROM permissions WHERE module IN ('Dashboard','Support','Customers') OR permission_key = 'media.view'
ON CONFLICT DO NOTHING;

-- ADMIN USER (password: Admin@123)
INSERT INTO users (role_id, first_name, last_name, email, password_hash, is_verified, is_active)
VALUES (1, 'Super', 'Admin', 'admin@v-trinitysolutions.com',
  '$2a$12$4McUTUto9VvuDVqcg3tq/upWv9qjHN8F8/SlhmKJLv5qWcRIY0qum', true, true)
ON CONFLICT (email) DO NOTHING;

-- WEBSITE SETTINGS
INSERT INTO website_settings (setting_key, setting_value, setting_type, group_name, label) VALUES
('site_name',            'V-Trinity Solutions',                   'text',    'General',   'Site Name'),
('site_tagline',         'Securing Tomorrow, Today',              'text',    'General',   'Tagline'),
('site_description',     'Enterprise IT Infrastructure, CCTV Surveillance, Networking & Cybersecurity Solutions', 'text', 'General', 'Description'),
('contact_phone',        '+91 91939 35965',                       'text',    'Contact',   'Primary Phone'),
('contact_phone2',       '+91 82379 60160',                       'text',    'Contact',   'Secondary Phone'),
('contact_email',        'vtrinitysolutions@gmail.com',           'text',    'Contact',   'Primary Email'),
('contact_email_sales',  'vtrinitysolutions@gmail.com',           'text',    'Contact',   'Sales Email'),
('contact_email_support','vtrinitysolutions@gmail.com',           'text',    'Contact',   'Support Email'),
('office_address',       'Hathras, Uttar Pradesh 204101, India',  'text',    'Contact',   'Head Office Address'),
('smtp_host',            'smtp.gmail.com',                        'text',    'Email',     'SMTP Host'),
('smtp_port',            '587',                                   'text',    'Email',     'SMTP Port'),
('smtp_user',            '',                                      'text',    'Email',     'SMTP User'),
('smtp_pass',            '',                                      'text',    'Email',     'SMTP Password'),
('smtp_from_name',       'V-Trinity Solutions',                   'text',    'Email',     'From Name'),
('maintenance_mode',     '0',                                     'boolean', 'General',   'Maintenance Mode'),
('copyright_text',       '© 2025 V-Trinity Solutions. All Rights Reserved.', 'text', 'General', 'Copyright Text')
ON CONFLICT (setting_key) DO NOTHING;

-- SOCIAL LINKS
INSERT INTO social_links (platform, url, icon, sort_order) VALUES
('LinkedIn',  'https://linkedin.com',  'fab fa-linkedin',  1),
('Twitter',   'https://twitter.com',   'fab fa-twitter',   2),
('Facebook',  'https://facebook.com',  'fab fa-facebook',  3),
('YouTube',   'https://youtube.com',   'fab fa-youtube',   4),
('Instagram', 'https://www.instagram.com/vtrinitysolutions/', 'fab fa-instagram', 5)
ON CONFLICT DO NOTHING;

-- SERVICE CATEGORIES
INSERT INTO service_categories (name, slug, icon, sort_order) VALUES
('CCTV Surveillance',    'cctv-surveillance',    'fas fa-camera',          1),
('IT Infrastructure',    'it-infrastructure',    'fas fa-server',          2),
('Cyber Security',       'cyber-security',       'fas fa-shield-alt',      3),
('Managed Services',     'managed-services',     'fas fa-cogs',            4),
('Cloud Services',       'cloud-services',       'fas fa-cloud',           5),
('Contractual Projects', 'contractual-projects', 'fas fa-project-diagram', 6)
ON CONFLICT (slug) DO NOTHING;

-- INDUSTRIES
INSERT INTO industries (name, slug, icon, sort_order) VALUES
('Government',    'government',    'fas fa-landmark',      1),
('Healthcare',    'healthcare',    'fas fa-hospital',      2),
('Manufacturing', 'manufacturing', 'fas fa-industry',      3),
('Education',     'education',     'fas fa-graduation-cap',4),
('Banking',       'banking',       'fas fa-university',    5),
('Hospitality',   'hospitality',   'fas fa-hotel',         6),
('Retail',        'retail',        'fas fa-store',         7)
ON CONFLICT (slug) DO NOTHING;

-- SITE STATISTICS
INSERT INTO site_statistics (label, value, suffix, icon, sort_order) VALUES
('Projects Completed', '500', '+', 'fas fa-project-diagram', 1),
('Happy Clients',      '350', '+', 'fas fa-users',           2),
('Years Experience',   '15',  '+', 'fas fa-calendar',        3),
('Expert Engineers',   '120', '+', 'fas fa-user-tie',        4)
ON CONFLICT DO NOTHING;

-- NAVIGATION MENUS
INSERT INTO menus (menu_name, location) VALUES
('Main Navigation', 'header'),
('Footer Links',    'footer')
ON CONFLICT (location) DO NOTHING;

INSERT INTO menu_items (menu_id, parent_id, label, url, sort_order) VALUES
(1, NULL, 'Home',       '/',           1),
(1, NULL, 'About Us',   '/about',      2),
(1, NULL, 'Services',   '/services',   3),
(1, NULL, 'Solutions',  '/solutions',  4),
(1, NULL, 'Industries', '/industries', 5),
(1, NULL, 'Projects',   '/projects',   6),
(1, NULL, 'Blog',       '/blog',       7),
(1, NULL, 'Careers',    '/careers',    8),
(1, NULL, 'Contact',    '/contact',    9);

-- SERVICES
INSERT INTO services (category_id, title, slug, short_desc, icon, is_active, is_featured, sort_order) VALUES
(1, 'CCTV Surveillance Systems', 'cctv-surveillance-systems', 'Complete IP camera systems with AI analytics, NVR/DVR, and 24/7 monitoring for enterprise and government facilities.', 'fas fa-camera', true, true, 1),
(2, 'IT Infrastructure Design',  'it-infrastructure-design',  'End-to-end data center design, server infrastructure, and network architecture for enterprise environments.',          'fas fa-server', true, true, 2),
(3, 'Cybersecurity Solutions',   'cybersecurity-solutions',   'Comprehensive security assessments, firewall deployment, SIEM, and 24/7 SOC services.',                              'fas fa-shield-alt', true, true, 3),
(4, 'Managed IT Services',       'managed-it-services',       'Full-spectrum managed services including helpdesk, monitoring, maintenance, and SLA-backed support.',                'fas fa-cogs', true, true, 4),
(5, 'Cloud Migration Services',  'cloud-migration-services',  'Seamless cloud migration, hybrid cloud architecture, and managed cloud services on AWS, Azure, and GCP.',            'fas fa-cloud', true, true, 5),
(2, 'Network Design',            'network-design',            'Enterprise LAN/WAN design, SD-WAN, MPLS, and wireless solutions with Cisco and Juniper.',                            'fas fa-network-wired', true, true, 6)
ON CONFLICT (slug) DO NOTHING;

-- SOLUTIONS
INSERT INTO solutions (title, slug, short_desc, icon, is_active, is_featured, sort_order) VALUES
('Smart City Surveillance', 'smart-city-surveillance', 'Integrated city-wide CCTV, traffic management, and public safety command center solutions.', 'fas fa-city',        true, true, 1),
('SOC as a Service',        'soc-as-a-service',        '24/7 Security Operations Center with threat detection, incident response, and compliance reporting.', 'fas fa-shield-alt', true, true, 2),
('Hybrid Cloud Platform',   'hybrid-cloud-platform',   'Seamlessly connect on-premise infrastructure with AWS, Azure, or GCP using SD-WAN and cloud-native tools.', 'fas fa-cloud', true, true, 3),
('Enterprise Networking',   'enterprise-networking',   'End-to-end structured cabling, LAN/WAN, SD-WAN, and Wi-Fi 6 deployment for large enterprises.', 'fas fa-network-wired', true, true, 4),
('AMC & Support Services',  'amc-support-services',    'Annual Maintenance Contracts covering preventive maintenance, 24/7 helpdesk, and on-site support.', 'fas fa-tools', true, true, 5)
ON CONFLICT (slug) DO NOTHING;

-- TESTIMONIALS
INSERT INTO testimonials (client_name, designation, company, content, rating, is_active, sort_order) VALUES
('Rajesh Kumar',   'IT Director',       'State Government of UP',      'V-Trinity Solutions deployed a 500-camera surveillance system across our district. Exceptional quality and support.', 5, true, 1),
('Priya Sharma',   'CTO',               'HealthFirst Hospital Group',   'Their cybersecurity audit and SOC setup has been a game changer. We sleep better knowing our patient data is safe.',  5, true, 2),
('Mohammed Ali',   'Head of IT',        'First National Bank',          'The SD-WAN deployment across 45 branches was flawless. Network performance improved by 60% overnight.',              5, true, 3),
('Anjali Verma',   'Campus Director',   'DPS International School',     'Smart campus Wi-Fi and IP surveillance installed perfectly. Students and staff love the seamless connectivity.',     5, true, 4),
('Suresh Patel',   'Operations Manager','Horizon Manufacturing Ltd',    'Their OT/IT convergence project modernized our factory floor. Production downtime reduced by 40%.',                  5, true, 5)
ON CONFLICT DO NOTHING;

-- PROJECTS
INSERT INTO projects (industry_id, project_name, slug, client_name, location, description, is_featured, is_active) VALUES
(1, 'Smart City CCTV — Hathras District',     'smart-city-cctv-hathras',    'District Administration',    'Hathras, UP',    '500+ IP cameras deployed across the city with AI analytics and central command center.',    true, true),
(2, 'Hospital Network Upgrade',               'hospital-network-upgrade',   'HealthFirst Hospitals',       'Agra, UP',       'Complete LAN/WAN redesign, HIPAA-compliant network segmentation, and wireless rollout.',       true, true),
(5, 'Bank Branch Connectivity',               'bank-branch-connectivity',   'First National Bank',         'Pan India',      'SD-WAN deployment connecting 45 branches with MPLS backup and centralized firewall management.', true, true),
(4, 'Smart Campus Solution',                  'smart-campus-solution',      'DPS International',           'Mathura, UP',    'Wi-Fi 6 campus network, IP surveillance system, and attendance management integration.',         true, true),
(3, 'Factory OT/IT Convergence',              'factory-ot-it-convergence',  'Horizon Manufacturing',       'Noida, UP',      'Industrial network segmentation, OT firewall, SCADA network design, and 24/7 NOC monitoring.',   true, true),
(1, 'Government Data Center Setup',           'govt-data-center-setup',     'State IT Department',         'Lucknow, UP',    'Tier-2 data center design, server room setup, power management, and DR site configuration.',      false, true)
ON CONFLICT (slug) DO NOTHING;

-- BLOG CATEGORIES
INSERT INTO blog_categories (name, slug) VALUES
('Cybersecurity',    'cybersecurity'),
('Networking',       'networking'),
('CCTV & Surveillance', 'cctv-surveillance'),
('Cloud Computing',  'cloud-computing')
ON CONFLICT (slug) DO NOTHING;

-- HERO BANNERS
INSERT INTO hero_banners (title, subtitle, description, button_text, button_url, button2_text, button2_url, sort_order, is_active) VALUES
('Securing Tomorrow, Today', 'Enterprise IT & Security Solutions', 'End-to-end IT infrastructure, CCTV surveillance, cybersecurity, and cloud solutions trusted by 350+ enterprises across India.', 'Explore Services', '/services', 'Request a Solution', '/request-solution', 1, true),
('Smart City Surveillance', 'AI-Powered CCTV Systems', '500+ cameras deployed across cities with real-time analytics, facial recognition, and centralized monitoring for safer communities.', 'View Projects', '/projects', 'Learn More', '/services/cctv-surveillance-systems', 2, true),
('Protect Your Business', '24/7 SOC & Cybersecurity', 'Round-the-clock Security Operations Center, threat intelligence, and incident response — keeping your business safe from cyber threats.', 'Get Protected', '/services/cybersecurity-solutions', 'Free Assessment', '/contact', 3, true)
ON CONFLICT DO NOTHING;
