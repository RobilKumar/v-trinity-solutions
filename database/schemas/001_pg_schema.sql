-- ============================================================
-- V-Trinity Solutions — PostgreSQL Schema (Neon/Supabase)
-- Migrated from MS SQL Server
-- ============================================================

-- SECTION 1: USERS & AUTH
CREATE TABLE IF NOT EXISTS roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    permission_id  SERIAL PRIMARY KEY,
    permission_key VARCHAR(200) NOT NULL UNIQUE,
    module         VARCHAR(100) NOT NULL,
    description    VARCHAR(500),
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    granted_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    role_id       INT NOT NULL REFERENCES roles(role_id),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone         VARCHAR(30),
    avatar        VARCHAR(500),
    is_active     BOOLEAN DEFAULT true,
    is_verified   BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id   SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token      VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    log_id     BIGSERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(user_id),
    action     VARCHAR(200) NOT NULL,
    module     VARCHAR(100),
    entity_id  INT,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 2: WEBSITE SETTINGS
CREATE TABLE IF NOT EXISTS website_settings (
    setting_id    SERIAL PRIMARY KEY,
    setting_key   VARCHAR(200) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type  VARCHAR(50) DEFAULT 'text',
    group_name    VARCHAR(100),
    label         VARCHAR(200),
    updated_by    INT REFERENCES users(user_id),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_links (
    social_id  SERIAL PRIMARY KEY,
    platform   VARCHAR(100) NOT NULL,
    url        VARCHAR(500) NOT NULL,
    icon       VARCHAR(200),
    sort_order INT DEFAULT 0,
    is_active  BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS office_locations (
    location_id SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    type        VARCHAR(50) DEFAULT 'branch',
    address     VARCHAR(500),
    city        VARCHAR(100),
    state       VARCHAR(100),
    country     VARCHAR(100),
    phone       VARCHAR(30),
    email       VARCHAR(255),
    map_embed   TEXT,
    latitude    DECIMAL(10,8),
    longitude   DECIMAL(11,8),
    is_active   BOOLEAN DEFAULT true,
    sort_order  INT DEFAULT 0
);

-- SECTION 3: NAVIGATION
CREATE TABLE IF NOT EXISTS menus (
    menu_id   SERIAL PRIMARY KEY,
    menu_name VARCHAR(100) NOT NULL,
    location  VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS menu_items (
    item_id    SERIAL PRIMARY KEY,
    menu_id    INT NOT NULL REFERENCES menus(menu_id) ON DELETE CASCADE,
    parent_id  INT REFERENCES menu_items(item_id),
    label      VARCHAR(200) NOT NULL,
    url        VARCHAR(500),
    page_slug  VARCHAR(200),
    icon       VARCHAR(100),
    target     VARCHAR(20) DEFAULT '_self',
    sort_order INT DEFAULT 0,
    is_active  BOOLEAN DEFAULT true
);

-- SECTION 4: SEO
CREATE TABLE IF NOT EXISTS seo_pages (
    seo_id           SERIAL PRIMARY KEY,
    page_slug        VARCHAR(300) NOT NULL UNIQUE,
    meta_title       VARCHAR(200),
    meta_description VARCHAR(500),
    keywords         VARCHAR(500),
    og_title         VARCHAR(200),
    og_description   VARCHAR(500),
    og_image         VARCHAR(500),
    canonical_url    VARCHAR(500),
    no_index         BOOLEAN DEFAULT false,
    no_follow        BOOLEAN DEFAULT false,
    custom_schema    TEXT,
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 5: MEDIA
CREATE TABLE IF NOT EXISTS media_folders (
    folder_id  SERIAL PRIMARY KEY,
    parent_id  INT REFERENCES media_folders(folder_id),
    name       VARCHAR(200) NOT NULL,
    slug       VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS media_files (
    file_id       SERIAL PRIMARY KEY,
    folder_id     INT REFERENCES media_folders(folder_id),
    file_name     VARCHAR(300) NOT NULL,
    original_name VARCHAR(300) NOT NULL,
    mime_type     VARCHAR(100),
    file_size     BIGINT,
    file_path     VARCHAR(1000) NOT NULL,
    file_url      VARCHAR(1000) NOT NULL,
    alt_text      VARCHAR(300),
    tags          VARCHAR(500),
    uploaded_by   INT REFERENCES users(user_id),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 6: HOME PAGE
CREATE TABLE IF NOT EXISTS hero_banners (
    banner_id   SERIAL PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    subtitle    VARCHAR(500),
    description VARCHAR(1000),
    button_text VARCHAR(100),
    button_url  VARCHAR(500),
    button2_text VARCHAR(100),
    button2_url  VARCHAR(500),
    image_id    INT REFERENCES media_files(file_id),
    video_url   VARCHAR(500),
    bg_color    VARCHAR(50),
    text_color  VARCHAR(50),
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_statistics (
    stat_id    SERIAL PRIMARY KEY,
    label      VARCHAR(200) NOT NULL,
    value      VARCHAR(100) NOT NULL,
    suffix     VARCHAR(50),
    icon       VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active  BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS why_choose_us (
    feature_id  SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    icon        VARCHAR(100),
    image_id    INT REFERENCES media_files(file_id),
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS partners (
    partner_id SERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    logo_id    INT REFERENCES media_files(file_id),
    website    VARCHAR(500),
    category   VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active  BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS certifications (
    cert_id    SERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    issued_by  VARCHAR(200),
    logo_id    INT REFERENCES media_files(file_id),
    year       INT,
    sort_order INT DEFAULT 0,
    is_active  BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS testimonials (
    testimonial_id SERIAL PRIMARY KEY,
    client_name    VARCHAR(200) NOT NULL,
    designation    VARCHAR(200),
    company        VARCHAR(200),
    content        TEXT NOT NULL,
    rating         SMALLINT DEFAULT 5,
    avatar_id      INT REFERENCES media_files(file_id),
    is_active      BOOLEAN DEFAULT true,
    sort_order     INT DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 7: SERVICES
CREATE TABLE IF NOT EXISTS service_categories (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(200) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon        VARCHAR(100),
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS services (
    service_id  SERIAL PRIMARY KEY,
    category_id INT REFERENCES service_categories(category_id),
    title       VARCHAR(300) NOT NULL,
    slug        VARCHAR(300) NOT NULL UNIQUE,
    short_desc  VARCHAR(500),
    full_desc   TEXT,
    icon        VARCHAR(100),
    banner_id   INT REFERENCES media_files(file_id),
    thumbnail_id INT REFERENCES media_files(file_id),
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_faqs (
    faq_id     SERIAL PRIMARY KEY,
    service_id INT NOT NULL REFERENCES services(service_id) ON DELETE CASCADE,
    question   VARCHAR(500) NOT NULL,
    answer     TEXT NOT NULL,
    sort_order INT DEFAULT 0
);

-- SECTION 8: SOLUTIONS
CREATE TABLE IF NOT EXISTS solutions (
    solution_id  SERIAL PRIMARY KEY,
    title        VARCHAR(300) NOT NULL,
    slug         VARCHAR(300) NOT NULL UNIQUE,
    short_desc   VARCHAR(500),
    full_desc    TEXT,
    icon         VARCHAR(100),
    banner_id    INT REFERENCES media_files(file_id),
    thumbnail_id INT REFERENCES media_files(file_id),
    key_features TEXT,
    use_cases    TEXT,
    sort_order   INT DEFAULT 0,
    is_active    BOOLEAN DEFAULT true,
    is_featured  BOOLEAN DEFAULT false,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 9: INDUSTRIES
CREATE TABLE IF NOT EXISTS industries (
    industry_id  SERIAL PRIMARY KEY,
    name         VARCHAR(200) NOT NULL,
    slug         VARCHAR(200) NOT NULL UNIQUE,
    description  TEXT,
    icon         VARCHAR(100),
    banner_id    INT REFERENCES media_files(file_id),
    thumbnail_id INT REFERENCES media_files(file_id),
    sort_order   INT DEFAULT 0,
    is_active    BOOLEAN DEFAULT true
);

-- SECTION 10: PROJECTS
CREATE TABLE IF NOT EXISTS projects (
    project_id      SERIAL PRIMARY KEY,
    industry_id     INT REFERENCES industries(industry_id),
    project_name    VARCHAR(300) NOT NULL,
    slug            VARCHAR(300) NOT NULL UNIQUE,
    client_name     VARCHAR(200),
    location        VARCHAR(200),
    description     TEXT,
    challenge       TEXT,
    solution        TEXT,
    results         TEXT,
    technologies    TEXT,
    project_value   DECIMAL(18,2),
    currency        VARCHAR(10) DEFAULT 'USD',
    start_date      DATE,
    completion_date DATE,
    banner_id       INT REFERENCES media_files(file_id),
    thumbnail_id    INT REFERENCES media_files(file_id),
    is_featured     BOOLEAN DEFAULT false,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 11: CASE STUDIES
CREATE TABLE IF NOT EXISTS case_studies (
    case_study_id SERIAL PRIMARY KEY,
    project_id    INT REFERENCES projects(project_id),
    title         VARCHAR(300) NOT NULL,
    slug          VARCHAR(300) NOT NULL UNIQUE,
    client        VARCHAR(200),
    industry      VARCHAR(200),
    challenge     TEXT,
    solution      TEXT,
    results       TEXT,
    metrics       TEXT,
    banner_id     INT REFERENCES media_files(file_id),
    thumbnail_id  INT REFERENCES media_files(file_id),
    is_active     BOOLEAN DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 12: BLOG
CREATE TABLE IF NOT EXISTS blog_categories (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    slug        VARCHAR(200) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active   BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS blog_posts (
    post_id          SERIAL PRIMARY KEY,
    category_id      INT REFERENCES blog_categories(category_id),
    author_id        INT NOT NULL REFERENCES users(user_id),
    title            VARCHAR(300) NOT NULL,
    slug             VARCHAR(300) NOT NULL UNIQUE,
    excerpt          VARCHAR(500),
    content          TEXT NOT NULL,
    featured_img_id  INT REFERENCES media_files(file_id),
    status           VARCHAR(20) DEFAULT 'draft',
    publish_at       TIMESTAMPTZ,
    view_count       INT DEFAULT 0,
    is_featured      BOOLEAN DEFAULT false,
    allow_comments   BOOLEAN DEFAULT true,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 13: CAREERS
CREATE TABLE IF NOT EXISTS job_listings (
    job_id         SERIAL PRIMARY KEY,
    title          VARCHAR(300) NOT NULL,
    slug           VARCHAR(300) NOT NULL UNIQUE,
    location       VARCHAR(200),
    job_type       VARCHAR(50),
    experience_min INT,
    experience_max INT,
    salary         VARCHAR(200),
    description    TEXT,
    requirements   TEXT,
    benefits       TEXT,
    status         VARCHAR(20) DEFAULT 'active',
    expires_at     DATE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 14: INQUIRIES
CREATE TABLE IF NOT EXISTS inquiries (
    inquiry_id   SERIAL PRIMARY KEY,
    inquiry_type VARCHAR(100) NOT NULL,
    name         VARCHAR(200) NOT NULL,
    company      VARCHAR(200),
    phone        VARCHAR(30) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    location     VARCHAR(200),
    project_type VARCHAR(200),
    budget       VARCHAR(100),
    description  TEXT NOT NULL,
    status       VARCHAR(50) DEFAULT 'new',
    assigned_to  INT REFERENCES users(user_id),
    notes        TEXT,
    ip_address   VARCHAR(45),
    source       VARCHAR(100),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 15: CONTACT
CREATE TABLE IF NOT EXISTS contact_submissions (
    submission_id SERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(30),
    subject       VARCHAR(300),
    message       TEXT NOT NULL,
    status        VARCHAR(30) DEFAULT 'unread',
    ip_address    VARCHAR(45),
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- SECTION 16: ABOUT
CREATE TABLE IF NOT EXISTS team_members (
    member_id   SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    designation VARCHAR(200),
    department  VARCHAR(200),
    bio         TEXT,
    photo_id    INT REFERENCES media_files(file_id),
    linkedin    VARCHAR(500),
    email       VARCHAR(255),
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS company_timeline (
    event_id   SERIAL PRIMARY KEY,
    year       INT NOT NULL,
    title      VARCHAR(300) NOT NULL,
    content    TEXT,
    image_id   INT REFERENCES media_files(file_id),
    sort_order INT DEFAULT 0,
    is_active  BOOLEAN DEFAULT true
);

-- SECTION 17: EMAIL
CREATE TABLE IF NOT EXISTS email_templates (
    template_id  SERIAL PRIMARY KEY,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    subject      VARCHAR(300) NOT NULL,
    body         TEXT NOT NULL,
    variables    VARCHAR(500),
    is_active    BOOLEAN DEFAULT true,
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_solutions_slug ON solutions(slug);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
