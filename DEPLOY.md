# Deployment Guide

This guide covers deploying Harem Vote to a VPS using Docker and Ansible.

## Prerequisites

- A VPS running Ubuntu 22.04+ (Debian-based)
- SSH access to the VPS (root or sudo user)
- Ansible installed on your local machine
- Git repository accessible from the VPS

## Quick Start

### 1. Configure Inventory

Edit `ansible/inventory/hosts.yml`:

```yaml
all:
  hosts:
    haremvote:
      ansible_host: YOUR_VPS_IP
      ansible_user: root
```

### 2. Configure Variables

Edit `ansible/group_vars/all.yml`:

```yaml
git_repo: https://github.com/yourusername/harem-vote.git
domain_name: yourdomain.com
app_title: "Your App Name"
```

### 3. Create Vault for Secrets

```bash
cd ansible

# Copy the example vault file
cp group_vars/vault.yml.example group_vars/vault.yml

# Edit with your secure passwords
nano group_vars/vault.yml

# Encrypt the vault
ansible-vault encrypt group_vars/vault.yml
```

### 4. Run the Playbook

```bash
cd ansible

# Run with vault password prompt
ansible-playbook playbook.yml --ask-vault-pass

# Or use a password file
ansible-playbook playbook.yml --vault-password-file ~/.vault_pass
```

## Manual Docker Deployment

If you prefer to deploy manually without Ansible:

### 1. Clone the Repository

```bash
ssh root@your-vps
cd /opt
git clone https://github.com/yourusername/harem-vote.git
cd harem-vote
```

### 2. Create Environment File

```bash
cp .env.example .env
nano .env
```

Fill in all required values:
- `POSTGRES_PASSWORD` - Strong database password
- `NEXTAUTH_URL` - Your domain (e.g., https://yourdomain.com)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `ADMIN_PASSWORD` - Strong admin password

### 3. Build and Start

```bash
# Build and start containers
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose -f docker-compose.prod.yml --profile migrate up

# Seed admin user
curl http://localhost:3000/api/admin/seed
```

### 4. Verify Deployment

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f app
```

## SSL/TLS Setup (Recommended)

### Option 1: Nginx Reverse Proxy with Let's Encrypt

```bash
# Install nginx and certbot
apt install nginx certbot python3-certbot-nginx

# Create nginx config
cat > /etc/nginx/sites-available/haremvote << 'EOF'
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/haremvote /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com
```

### Option 2: Traefik (Docker-native)

Add Traefik to your docker-compose.prod.yml for automatic SSL.

## Updating the Application

### With Ansible

```bash
cd ansible
ansible-playbook playbook.yml --ask-vault-pass
```

### Manually

```bash
cd /opt/harem-vote
git pull
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml --profile migrate up
```

## Backup & Restore

### Backup Database

```bash
docker compose -f docker-compose.prod.yml exec db \
  pg_dump -U haremvote haremvote > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
docker compose -f docker-compose.prod.yml exec -T db \
  psql -U haremvote haremvote < backup_20240101.sql
```

## Troubleshooting

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Just the app
docker compose -f docker-compose.prod.yml logs -f app

# Just the database
docker compose -f docker-compose.prod.yml logs -f db
```

### Reset Admin Password

1. Update `ADMIN_PASSWORD` in `.env`
2. Call the reset endpoint:
   ```bash
   curl "http://localhost:3000/api/admin/seed?reset=true"
   ```

### Database Connection Issues

```bash
# Check if database is healthy
docker compose -f docker-compose.prod.yml exec db pg_isready

# Connect to database directly
docker compose -f docker-compose.prod.yml exec db psql -U haremvote
```

### Rebuild from Scratch

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml --profile migrate up
curl http://localhost:3000/api/admin/seed
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `POSTGRES_USER` | No | Database user (default: haremvote) |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `POSTGRES_DB` | No | Database name (default: haremvote) |
| `NEXTAUTH_URL` | Yes | Full URL of your app |
| `NEXTAUTH_SECRET` | Yes | Secret for session encryption |
| `ADMIN_USERNAME` | No | Admin username (default: admin) |
| `ADMIN_PASSWORD` | Yes | Admin password |
| `ADMIN_EMAIL` | No | Admin email |
| `NEXT_PUBLIC_APP_TITLE` | No | App title (default: Harem Vote) |
| `NEXT_PUBLIC_APP_MESSAGE` | No | Banner message shown to users |
| `APP_PORT` | No | Port to expose (default: 3000) |
