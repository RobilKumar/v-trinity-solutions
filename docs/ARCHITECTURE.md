# System Architecture – Enterprise IT Solutions Platform

## Overview

```
                    ┌─────────────────────────────────────────┐
                    │              Internet Users              │
                    └─────────────────┬───────────────────────┘
                                      │ HTTPS
                    ┌─────────────────▼───────────────────────┐
                    │       Nginx Reverse Proxy (443/80)        │
                    │   TLS Termination · Rate Limiting · Gzip  │
                    └──────┬──────────────────────┬────────────┘
                           │                      │
              ┌────────────▼────────┐   ┌─────────▼──────────┐
              │  React Frontend     │   │  Node.js Backend    │
              │  (nginx:80 static)  │   │  Express API :5000  │
              │  - Public Website   │   │  - REST APIs        │
              │  - Admin CMS        │   │  - JWT Auth         │
              │  - Customer Portal  │   │  - File Upload      │
              └─────────────────────┘   └─────────┬──────────┘
                                                  │
                                    ┌─────────────▼──────────┐
                                    │   MS SQL Server 2019    │
                                    │   EnterpriseCMS DB      │
                                    │   18 tables, indexes    │
                                    │   stored procedures     │
                                    └────────────────────────┘
```

## Technology Stack

| Layer         | Technology          | Purpose                            |
|---------------|---------------------|------------------------------------|
| Frontend      | React 18            | Public website + CMS + Portal      |
| State Mgmt    | Redux Toolkit       | Global state, auth, settings       |
| UI Framework  | MUI v5 + Tailwind   | Design system + utility CSS        |
| Animations    | Framer Motion       | Page transitions, scroll effects   |
| HTTP Client   | Axios               | API calls with auto token refresh  |
| Backend       | Node.js + Express   | REST API server                    |
| Database      | MS SQL Server       | Relational data, ACID compliance   |
| Auth          | JWT + Refresh Tokens| Stateless auth with rotation       |
| File Storage  | Local → S3-ready    | Media library (pluggable)          |
| Reverse Proxy | Nginx               | SSL, caching, load balancing       |
| Containers    | Docker Compose      | Orchestration                      |
| Email         | Nodemailer          | SMTP notifications                 |

## Security Architecture

```
Request Flow:
  Client → [Nginx: TLS, Rate Limit, Headers] → [Express: Helmet, CORS]
         → [Rate Limiter] → [Input Validator] → [JWT Auth Middleware]
         → [Permission Check] → Controller → [SQL Parameterized Query] → DB
```

### Security Controls

| Threat               | Mitigation                                          |
|----------------------|-----------------------------------------------------|
| SQL Injection        | Parameterized queries via mssql library             |
| XSS                  | xss library for HTML sanitization, CSP headers     |
| CSRF                 | SameSite cookies + Origin header validation         |
| Brute Force          | Rate limiting (10 req/15min for auth endpoints)     |
| Token Theft          | Short-lived access tokens (15min) + refresh rotation|
| MITM                 | TLS 1.2/1.3 only, HSTS preload                     |
| File Upload Abuse    | Type whitelist, size limit, virus-ready (ClamAV)    |
| Privilege Escalation | RBAC with per-permission granularity               |
| Data Exposure        | Audit logs, field-level access control             |

## Database Design (Key Relationships)

```
Users ──┬─── Roles ──── RolePermissions ──── Permissions
        ├─── AuditLogs
        └─── RefreshTokens

Services ──── ServiceCategories
Services ──── ServiceGallery
Services ──── ServiceDocuments
Services ──── ServiceFAQs
Services ──── SEOPages (via slug)

Projects ──── Industries
Projects ──── ProjectGallery
Projects ──── CustomerProjects ──── Customers ──── Users

Inquiries ──── InquiryNotes ──── Users
Inquiries ──── MediaFiles (attachment)

BlogPosts ──── BlogCategories
BlogPosts ──── BlogPostTags ──── BlogTags
BlogPosts ──── BlogComments

JobListings ──── JobDepartments
JobListings ──── JobApplications

SupportTickets ──── Customers
SupportTickets ──── TicketReplies ──── Users

MediaFiles ──── MediaFolders
```

## API Design

```
Public APIs (no auth):
  GET /api/public/home          All home page data
  GET /api/public/settings      Website settings
  GET /api/public/menu/:loc     Navigation menus
  GET /api/public/about         About page data
  GET /api/services             Service listings
  GET /api/services/:slug       Service detail
  GET /api/solutions            Solutions list
  GET /api/projects             Projects list
  GET /api/blog                 Blog posts
  GET /api/blog/:slug           Blog post detail
  GET /api/careers              Job listings
  POST /api/inquiries           Submit inquiry
  POST /api/contact             Submit contact form
  POST /api/careers/:id/apply   Submit job application

Auth APIs:
  POST /api/auth/login          Get tokens
  POST /api/auth/refresh        Refresh access token
  POST /api/auth/logout         Revoke tokens
  GET  /api/auth/me             Current user

Admin APIs (JWT required):
  CRUD /api/services
  CRUD /api/solutions
  CRUD /api/projects
  CRUD /api/blog
  CRUD /api/careers
  CRUD /api/users
  GET/PATCH /api/inquiries
  POST /api/media/upload
  GET  /api/dashboard/stats
  GET/PUT /api/settings
  GET/PUT /api/seo/:slug

Portal APIs (Customer role):
  GET /api/portal/profile
  GET /api/portal/quotations
  GET /api/portal/projects
  GET /api/portal/documents
  CRUD /api/portal/tickets
```

## RBAC Matrix

| Permission         | Super Admin | Admin | Sales | Marketing | Content | HR  | Support |
|--------------------|:-----------:|:-----:|:-----:|:---------:|:-------:|:---:|:-------:|
| dashboard.view     | ✓           | ✓     | ✓     | ✓         | ✓       | ✓   | ✓       |
| users.create/edit  | ✓           | ✓     |       |           |         |     |         |
| services.edit      | ✓           | ✓     |       | ✓         | ✓       |     |         |
| projects.edit      | ✓           | ✓     |       | ✓         |         |     |         |
| blog.publish       | ✓           | ✓     |       | ✓         |         |     |         |
| inquiries.manage   | ✓           | ✓     | ✓     |           |         |     |         |
| careers.manage     | ✓           | ✓     |       |           |         | ✓   |         |
| tickets.manage     | ✓           | ✓     |       |           |         |     | ✓       |
| settings.edit      | ✓           | ✓     |       |           |         |     |         |
| seo.edit           | ✓           | ✓     |       | ✓         |         |     |         |
| media.upload       | ✓           | ✓     | ✓     | ✓         | ✓       | ✓   |         |

## Scaling Strategy

1. **Horizontal Backend Scaling**: Add Nginx upstream with multiple backend containers
2. **Database Read Replicas**: Route GET queries to read replica
3. **Media CDN**: Replace local uploads with S3 + CloudFront (config-driven)
4. **Redis Caching**: Add for session storage and API response caching
5. **ElasticSearch**: Add for full-text search across services/blog/projects
