-- ============================================================
-- INDEXES & SEED DATA
-- ============================================================

USE EnterpriseCMS;
GO

-- Performance Indexes
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_RoleID ON Users(RoleID);
CREATE INDEX IX_Services_Slug ON Services(Slug);
CREATE INDEX IX_Services_CategoryID ON Services(CategoryID);
CREATE INDEX IX_Solutions_Slug ON Solutions(Slug);
CREATE INDEX IX_Projects_IndustryID ON Projects(IndustryID);
CREATE INDEX IX_Projects_Slug ON Projects(Slug);
CREATE INDEX IX_BlogPosts_Slug ON BlogPosts(Slug);
CREATE INDEX IX_BlogPosts_Status ON BlogPosts(Status);
CREATE INDEX IX_BlogPosts_CategoryID ON BlogPosts(CategoryID);
CREATE INDEX IX_Inquiries_Status ON Inquiries(Status);
CREATE INDEX IX_Inquiries_CreatedAt ON Inquiries(CreatedAt DESC);
CREATE INDEX IX_SupportTickets_CustomerID ON SupportTickets(CustomerID);
CREATE INDEX IX_SupportTickets_Status ON SupportTickets(Status);
CREATE INDEX IX_AuditLogs_UserID ON AuditLogs(UserID);
CREATE INDEX IX_AuditLogs_CreatedAt ON AuditLogs(CreatedAt DESC);
CREATE INDEX IX_RefreshTokens_Token ON RefreshTokens(Token);
CREATE INDEX IX_EmailQueue_Status ON EmailQueue(Status);

GO

-- ============================================================
-- SEED DATA: ROLES & PERMISSIONS
-- ============================================================

INSERT INTO Roles (RoleName, Description) VALUES
('Super Admin',   'Full system access'),
('Admin',         'Full CMS access except system settings'),
('Sales Team',    'Manage inquiries and quotations'),
('Marketing Team','Manage blog, projects, and media'),
('Content Editor','Manage content and blog'),
('HR',            'Manage careers and job applications'),
('Support Team',  'Manage support tickets'),
('Customer',      'Customer portal access');

INSERT INTO Permissions (PermissionKey, Module, Description) VALUES
-- Dashboard
('dashboard.view',           'Dashboard',  'View dashboard'),
-- Users
('users.view',               'Users',      'View users'),
('users.create',             'Users',      'Create users'),
('users.edit',               'Users',      'Edit users'),
('users.delete',             'Users',      'Delete users'),
-- Services
('services.view',            'Services',   'View services'),
('services.create',          'Services',   'Create services'),
('services.edit',            'Services',   'Edit services'),
('services.delete',          'Services',   'Delete services'),
-- Solutions
('solutions.view',           'Solutions',  'View solutions'),
('solutions.create',         'Solutions',  'Create solutions'),
('solutions.edit',           'Solutions',  'Edit solutions'),
('solutions.delete',         'Solutions',  'Delete solutions'),
-- Projects
('projects.view',            'Projects',   'View projects'),
('projects.create',          'Projects',   'Create projects'),
('projects.edit',            'Projects',   'Edit projects'),
('projects.delete',          'Projects',   'Delete projects'),
-- Blog
('blog.view',                'Blog',       'View blog posts'),
('blog.create',              'Blog',       'Create blog posts'),
('blog.edit',                'Blog',       'Edit blog posts'),
('blog.delete',              'Blog',       'Delete blog posts'),
('blog.publish',             'Blog',       'Publish blog posts'),
-- Inquiries
('inquiries.view',           'Inquiries',  'View inquiries'),
('inquiries.manage',         'Inquiries',  'Manage inquiry status'),
-- Careers
('careers.view',             'Careers',    'View job listings'),
('careers.create',           'Careers',    'Create job listings'),
('careers.edit',             'Careers',    'Edit job listings'),
('careers.delete',           'Careers',    'Delete job listings'),
('applications.view',        'Careers',    'View job applications'),
-- Media
('media.view',               'Media',      'View media library'),
('media.upload',             'Media',      'Upload files'),
('media.delete',             'Media',      'Delete files'),
-- Settings
('settings.view',            'Settings',   'View settings'),
('settings.edit',            'Settings',   'Edit settings'),
-- SEO
('seo.view',                 'SEO',        'View SEO settings'),
('seo.edit',                 'SEO',        'Edit SEO settings'),
-- Support
('tickets.view',             'Support',    'View support tickets'),
('tickets.manage',           'Support',    'Manage support tickets'),
-- Customers
('customers.view',           'Customers',  'View customers'),
('customers.manage',         'Customers',  'Manage customers');

-- Super Admin gets all permissions
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 1, PermissionID FROM Permissions;

-- Admin gets most permissions (no system-level user management of super admins)
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 2, PermissionID FROM Permissions WHERE PermissionKey NOT IN ('users.delete');

-- Sales Team
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 3, PermissionID FROM Permissions WHERE Module IN ('Dashboard','Inquiries','Customers') OR PermissionKey IN ('media.view','media.upload','tickets.view','tickets.manage');

-- Marketing Team
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 4, PermissionID FROM Permissions WHERE Module IN ('Dashboard','Blog','Projects','Solutions','Media','SEO');

-- Content Editor
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 5, PermissionID FROM Permissions WHERE Module IN ('Dashboard','Blog','Media') OR PermissionKey IN ('services.view','services.edit','projects.view');

-- HR
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 6, PermissionID FROM Permissions WHERE Module IN ('Dashboard','Careers') OR PermissionKey IN ('media.view','media.upload');

-- Support Team
INSERT INTO RolePermissions (RoleID, PermissionID)
SELECT 7, PermissionID FROM Permissions WHERE Module IN ('Dashboard','Support','Customers') OR PermissionKey = 'media.view';

GO

-- ============================================================
-- SEED DATA: WEBSITE SETTINGS
-- ============================================================

INSERT INTO WebsiteSettings (SettingKey, SettingValue, SettingType, GroupName, Label) VALUES
('site_name',           'V-Trinity Solutions',             'text',    'General',   'Site Name'),
('site_tagline',        'Securing Tomorrow, Today',         'text',    'General',   'Tagline'),
('site_description',    'Enterprise IT Infrastructure, CCTV Surveillance, Networking & Cybersecurity Solutions', 'text', 'General', 'Description'),
('contact_phone',       '+91 91939 35965',                  'text',    'Contact',   'Primary Phone'),
('contact_phone2',      '+91 82379 60160',                  'text',    'Contact',   'Secondary Phone'),
('contact_email',       'info@v-trinitysolutions.com',       'text',    'Contact',   'Primary Email'),
('contact_email_sales', 'sales@v-trinitysolutions.com',     'text',    'Contact',   'Sales Email'),
('contact_email_support','support@v-trinitysolutions.com',  'text',    'Contact',   'Support Email'),
('office_address',      'Hathras, Uttar Pradesh 204101, India', 'text', 'Contact', 'Head Office Address'),
('google_analytics_id', '',                                 'text',    'Analytics', 'Google Analytics ID'),
('google_tag_manager',  '',                                 'text',    'Analytics', 'Google Tag Manager ID'),
('smtp_host',           'smtp.gmail.com',                   'text',    'Email',     'SMTP Host'),
('smtp_port',           '587',                              'text',    'Email',     'SMTP Port'),
('smtp_user',           '',                                 'text',    'Email',     'SMTP User'),
('smtp_pass',           '',                                 'text',    'Email',     'SMTP Password'),
('smtp_from_name',      'V-Trinity Solutions',             'text',    'Email',     'From Name'),
('maintenance_mode',    '0',                                'boolean', 'General',   'Maintenance Mode'),
('copyright_text',      'Â© 2024 V-Trinity Solutions. All Rights Reserved.', 'text', 'General', 'Copyright Text');

INSERT INTO SocialLinks (Platform, URL, Icon, SortOrder) VALUES
('LinkedIn',  'https://linkedin.com',  'fab fa-linkedin',  1),
('Twitter',   'https://twitter.com',   'fab fa-twitter',   2),
('Facebook',  'https://facebook.com',  'fab fa-facebook',  3),
('YouTube',   'https://youtube.com',   'fab fa-youtube',   4),
('Instagram', 'https://instagram.com', 'fab fa-instagram', 5);

INSERT INTO ServiceCategories (Name, Slug, Icon, SortOrder) VALUES
('CCTV Surveillance',     'cctv-surveillance',    'fas fa-camera',         1),
('IT Infrastructure',     'it-infrastructure',    'fas fa-server',         2),
('Cyber Security',        'cyber-security',       'fas fa-shield-alt',     3),
('Managed Services',      'managed-services',     'fas fa-cogs',           4),
('Cloud Services',        'cloud-services',       'fas fa-cloud',          5),
('Contractual Projects',  'contractual-projects', 'fas fa-project-diagram',6);

INSERT INTO Industries (Name, Slug, Icon, SortOrder) VALUES
('Government',      'government',   'fas fa-landmark',     1),
('Healthcare',      'healthcare',   'fas fa-hospital',     2),
('Manufacturing',   'manufacturing','fas fa-industry',     3),
('Education',       'education',    'fas fa-graduation-cap',4),
('Banking',         'banking',      'fas fa-university',   5),
('Hospitality',     'hospitality',  'fas fa-hotel',        6),
('Retail',          'retail',       'fas fa-store',        7);

INSERT INTO SiteStatistics (Label, Value, Suffix, Icon, SortOrder) VALUES
('Projects Completed', '500',  '+',  'fas fa-project-diagram', 1),
('Happy Clients',      '350',  '+',  'fas fa-users',           2),
('Years Experience',   '15',   '+',  'fas fa-calendar',        3),
('Expert Engineers',   '120',  '+',  'fas fa-user-tie',        4);

INSERT INTO Menus (MenuName, Location) VALUES
('Main Navigation', 'header'),
('Footer Links',    'footer');

INSERT INTO MenuItems (MenuID, ParentID, Label, URL, SortOrder) VALUES
(1, NULL, 'Home',         '/',            1),
(1, NULL, 'About Us',     '/about',       2),
(1, NULL, 'Services',     '/services',    3),
(1, NULL, 'Solutions',    '/solutions',   4),
(1, NULL, 'Industries',   '/industries',  5),
(1, NULL, 'Projects',     '/projects',    6),
(1, NULL, 'Blog',         '/blog',        7),
(1, NULL, 'Careers',      '/careers',     8),
(1, NULL, 'Contact',      '/contact',     9);

INSERT INTO EmailTemplates (TemplateKey, Subject, Body, Variables) VALUES
('inquiry_received',
 'New Inquiry Received - {{InquiryType}}',
 '<h2>New Inquiry</h2><p><strong>From:</strong> {{Name}}</p><p><strong>Company:</strong> {{Company}}</p><p><strong>Type:</strong> {{InquiryType}}</p><p><strong>Description:</strong> {{Description}}</p>',
 'Name,Company,InquiryType,Description'),
('inquiry_confirmation',
 'Thank you for your inquiry - V-Trinity Solutions',
 '<h2>Dear {{Name}},</h2><p>Thank you for reaching out to V-Trinity Solutions. We have received your inquiry and our team will contact you within 24 business hours.</p><p>Your Reference ID: <strong>{{InquiryID}}</strong></p>',
 'Name,InquiryID'),
('contact_notification',
 'New Contact Form Submission',
 '<h2>Contact Form Submission</h2><p><strong>Name:</strong> {{Name}}</p><p><strong>Email:</strong> {{Email}}</p><p><strong>Message:</strong> {{Message}}</p>',
 'Name,Email,Message'),
('job_application',
 'New Job Application - {{JobTitle}}',
 '<h2>New Application</h2><p><strong>Position:</strong> {{JobTitle}}</p><p><strong>Applicant:</strong> {{Name}}</p><p><strong>Email:</strong> {{Email}}</p>',
 'JobTitle,Name,Email'),
('ticket_created',
 'Support Ticket Created #{{TicketID}}',
 '<h2>Ticket Opened</h2><p>Dear {{Name}}, your support ticket <strong>#{{TicketID}}</strong> has been created. Our team will respond shortly.</p>',
 'Name,TicketID');

GO
PRINT 'Database setup complete.';




