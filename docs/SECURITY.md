# Security Hardening Guide

## Authentication Security
- JWT access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry with rotation on every use
- Revoked refresh tokens stored in DB (token blacklist)
- Password hashing: bcrypt with 12 rounds
- Login rate limiting: 10 attempts per 15 minutes per IP
- All tokens revoked on password change

## Input Validation
- express-validator on all user inputs
- xss library sanitizes all HTML content before DB storage
- SQL injection prevention via mssql parameterized queries (never string concatenation)
- File upload: whitelist of MIME types + file extension check
- File size limit: 10MB default

## HTTP Security Headers (Nginx)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

## CORS Policy
- Origin whitelist: only frontend domain
- Credentials: true (with specific origin, not *)
- Methods: GET, POST, PUT, PATCH, DELETE
- Max age: browser caches preflight 1 hour

## Rate Limiting
| Endpoint Group      | Limit               |
|---------------------|---------------------|
| All /api/*          | 100 req / 15 min    |
| POST /api/auth/login| 10 req / 15 min     |
| POST /api/inquiries | 5 submissions / hour|
| POST /api/contact   | 10 submissions / hour|

## Database Security
- SQL Server: strong password, dedicated app user (not sa)
- App user permissions: SELECT/INSERT/UPDATE/DELETE only on EnterpriseCMS
- SQL Server port 1433 NOT exposed to public internet
- TLS encryption for DB connection
- Encrypted stored procedures for sensitive operations

## Audit Trail
All admin operations logged in AuditLogs:
- UserID, Action, Module, EntityID
- Before/after values (JSON)
- IP address, timestamp

## File Upload Security
1. MIME type validation (server-side, not just Content-Type header)
2. File extension whitelist
3. Random UUID filename (no path traversal)
4. Files served from separate static URL (not executable path)
5. Max size enforced

## Recommended Additional Controls (Production)
- [ ] ClamAV malware scanning on uploads
- [ ] Web Application Firewall (ModSecurity)
- [ ] SIEM integration for security events
- [ ] Secrets manager (HashiCorp Vault / AWS Secrets Manager)
- [ ] Database activity monitoring
- [ ] Penetration test before go-live
- [ ] OWASP ZAP automated scan in CI/CD
