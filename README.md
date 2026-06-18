# Enterprise IT Solutions – Complete CMS Platform

Production-ready website + CMS for an IT Infrastructure, CCTV, Networking, Cloud & Cybersecurity company.

## Quick Start (Development)

### Backend
```bash
cd backend
cp .env.example .env
# Configure .env with your SQL Server credentials and secrets
npm install
npm run dev
# → http://localhost:5000
# → http://localhost:5000/api-docs (Swagger)
```

### Frontend
```bash
cd frontend
npm install
npm start
# → http://localhost:3000
```

### Database
Run SQL scripts in order:
1. `database/schemas/001_core_schema.sql`
2. `database/schemas/002_indexes_seeds.sql`
3. `database/procedures/sp_core.sql`

## Production Deployment
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Architecture
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Security
See [docs/SECURITY.md](docs/SECURITY.md)

---

## Project Structure

```
enterprise-it-solutions/
├── backend/
│   ├── src/
│   │   ├── config/         Database config
│   │   ├── controllers/    Route handlers
│   │   ├── middleware/     Auth, upload, validation
│   │   ├── routes/         API routes
│   │   ├── services/       Email service
│   │   ├── utils/          Logger
│   │   └── server.js       Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     PublicLayout, AdminLayout, PortalLayout
│   │   │   └── shared/     Reusable components
│   │   ├── pages/
│   │   │   ├── public/     Home, Services, Projects, Blog, etc.
│   │   │   ├── admin/      Dashboard, Inquiries, Media, etc.
│   │   │   └── portal/     Customer portal pages
│   │   ├── services/       Axios API client
│   │   ├── store/          Redux slices
│   │   └── styles/         Global CSS, MUI theme
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   ├── schemas/            SQL Server schema + seed data
│   └── procedures/         Stored procedures
│
├── docker/
│   └── docker-compose.yml
│
├── nginx/
│   ├── nginx.conf
│   └── conf.d/default.conf
│
└── docs/
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── SECURITY.md
```

## Features

### Public Website
- ✅ Hero banner slider (CMS-managed)
- ✅ Services with categories, gallery, FAQs, documents
- ✅ Solutions showcase
- ✅ Projects portfolio with gallery
- ✅ Industry pages
- ✅ Enterprise blog with categories, tags, comments
- ✅ Careers with online applications + resume upload
- ✅ Contact form
- ✅ **Request a Solution** inquiry form with file upload
- ✅ Statistics counter animation
- ✅ Testimonials
- ✅ Technology partners & certifications

### Admin CMS
- ✅ Dashboard with KPI metrics and inquiry pipeline
- ✅ Full CRUD for Services, Solutions, Projects, Blog
- ✅ Inquiry management with status tracking (New → Won/Lost)
- ✅ Media Library with drag-and-drop upload
- ✅ User management with RBAC
- ✅ SEO manager per page
- ✅ Website settings (logo, contacts, social links)
- ✅ Job postings and applicant tracking

### Customer Portal
- ✅ View quotations
- ✅ Track project status
- ✅ Download documents
- ✅ Raise support tickets

### Security
- ✅ JWT + refresh token rotation
- ✅ RBAC (7 role types, 40+ permissions)
- ✅ Rate limiting per endpoint
- ✅ XSS sanitization
- ✅ SQL injection prevention
- ✅ Audit logs
- ✅ Helmet security headers
- ✅ HTTPS with HSTS

### DevOps
- ✅ Docker multi-stage builds
- ✅ Docker Compose orchestration
- ✅ Nginx reverse proxy with SSL
- ✅ Let's Encrypt auto-renewal
- ✅ Health checks
- ✅ Log rotation ready
