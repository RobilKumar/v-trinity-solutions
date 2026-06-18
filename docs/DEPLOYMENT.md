# Enterprise IT Solutions – Deployment Guide

## Prerequisites
- Docker Engine 24+
- Docker Compose v2+
- Microsoft SQL Server 2019+ (external or Docker)
- Node.js 20+ (for local development)
- Domain name with DNS configured

---

## 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin -y
```

---

## 2. Database Setup

Run scripts in order on your SQL Server:
```sql
-- Run these in SQL Server Management Studio or sqlcmd:
1. database/schemas/001_core_schema.sql
2. database/schemas/002_indexes_seeds.sql
3. database/procedures/sp_core.sql
```

**Create initial Super Admin:**
```sql
USE EnterpriseCMS;
INSERT INTO Users (RoleID, FirstName, LastName, Email, PasswordHash, IsVerified, IsActive)
VALUES (1, 'Super', 'Admin', 'admin@yourdomain.com',
  '$2b$12$<bcrypt-hash-of-your-password>', 1, 1);
```
Generate hash: `node -e "require('bcryptjs').hash('YourPass123!',12).then(console.log)"`

---

## 3. Environment Configuration

```bash
# Copy and configure environment files
cp backend/.env.example backend/.env
# Edit with your actual values:
nano backend/.env
```

Key variables to set:
- `DB_SERVER`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (min 32 random characters)
- `JWT_REFRESH_SECRET` (different from JWT_SECRET)
- `SMTP_*` for email notifications
- `ADMIN_EMAIL` for notification recipient

---

## 4. SSL Certificate

```bash
# Get Let's Encrypt certificate
docker run --rm -p 80:80 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com -d www.yourdomain.com \
  --email your@email.com --agree-tos --no-eff-email
```

Update `nginx/conf.d/default.conf`:
- Replace `yourdomain.com` with your actual domain

---

## 5. Build & Deploy

```bash
# Clone/copy project to server
cd /opt/enterprise-it-solutions

# Create .env for docker-compose
cp docker/.env.example docker/.env
nano docker/.env

# Build and start
cd docker
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f nginx
```

---

## 6. Verify Deployment

```bash
# Health check
curl https://yourdomain.com/health

# API docs
open https://yourdomain.com/api-docs
```

---

## 7. CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/enterprise-it-solutions/docker
            git pull origin main
            docker compose up -d --build backend frontend
            docker compose exec backend node -e "console.log('Deployed')"
```

---

## 8. Production Checklist

- [ ] SQL Server configured with strong password
- [ ] JWT secrets are 32+ random characters
- [ ] SMTP credentials configured
- [ ] SSL certificate installed
- [ ] `nginx/conf.d/default.conf` updated with real domain
- [ ] Admin email for notifications set
- [ ] Rate limiting tuned for expected traffic
- [ ] Backup strategy for uploads volume
- [ ] Database backup schedule configured
- [ ] Monitoring/alerting set up
- [ ] Firewall rules: only 80/443 open publicly
- [ ] SQL Server port 1433 NOT exposed publicly

---

## 9. Backup Strategy

```bash
# Database backup (run as cron job)
sqlcmd -S $DB_SERVER -U $DB_USER -P $DB_PASSWORD \
  -Q "BACKUP DATABASE EnterpriseCMS TO DISK='/backups/cms_$(date +%Y%m%d).bak'"

# Uploads backup
docker run --rm -v uploads_data:/data -v /backups:/backup alpine \
  tar czf /backup/uploads_$(date +%Y%m%d).tar.gz -C /data .
```

---

## 10. Security Hardening

- Enable SQL Server auditing
- Set up fail2ban for SSH and Nginx
- Configure log rotation
- Enable UFW firewall
- Use secrets manager (HashiCorp Vault or AWS Secrets Manager) for production credentials
- Rotate JWT secrets every 90 days
- Keep Docker images updated monthly
