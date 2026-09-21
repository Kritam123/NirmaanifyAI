# Nirmaanify AI — DigitalOcean VPS Docker Deployment Guide

This comprehensive guide details how to deploy and manage **Nirmaanify AI** on a **DigitalOcean VPS Droplet** using Docker, Docker Compose, Nginx reverse proxy with automated Let's Encrypt SSL, PostgreSQL, Redis, MinIO, BullMQ worker, and Next.js.

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph Internet ["🌐 Public Internet"]
        Client["Browser / Client Requests"]
    end

    subgraph VPS ["🖥️ DigitalOcean Droplet (Ubuntu 22.04 / 24.04 LTS)"]
        subgraph Security ["🛡️ Security Layer"]
            UFW["UFW Firewall (Ports 22, 80, 443)"]
            F2B["Fail2ban Brute-Force Defense"]
        end

        subgraph DockerEngine ["🐳 Docker Production Network"]
            Nginx["Nginx Reverse Proxy & SSL (Port 80/443)"]
            Certbot["Certbot Auto-Renewal"]

            subgraph Services ["Application Layer"]
                Web["Next.js Web Frontend (Port 3000)"]
                API["NestJS Backend API (Port 4000)"]
                Worker["BullMQ Background Worker"]
            end

            subgraph Storage ["State & Storage Layer"]
                Postgres[("PostgreSQL 16 (Volume)")]
                Redis[("Redis 7 (Volume)")]
                MinIO[("MinIO S3 Engine (Volume)")]
            end
        end
    end

    Client --> UFW
    UFW --> Nginx
    Certbot -. Auto-Renews .-> Nginx
    Nginx -->|"/" (Frontend & SSR)| Web
    Nginx -->|"/api/v1" & "/api/docs"| API
    Web --> API
    API --> Postgres
    API --> Redis
    API --> MinIO
    Worker --> Redis
    Worker --> Postgres
```

---

## 2. Recommended DigitalOcean Droplet Specifications

| Resource | Minimum | Recommended (Production) |
|---|---|---|
| **OS** | Ubuntu 24.04 LTS (x64) | Ubuntu 24.04 LTS (x64) |
| **CPU** | 1 vCPU (Regular) | 2 vCPU (Premium Intel / AMD) |
| **RAM** | 2 GB (+ 4GB Swap configured by script) | 4 GB - 8 GB |
| **Storage** | 50 GB NVMe / SSD | 80 GB+ NVMe SSD |
| **Datacenter** | Closest to target users (e.g. NYC3, SFO3, FRA1, BLR1) | Closest to target users |

> [!TIP]
> Our provisioning script automatically configures **4 GB of swap space**, ensuring that Next.js and TypeScript builds complete smoothly even on cost-effective 2GB RAM droplets.

---

## 3. Domain & DNS Options (Choose One)

### Option A: No Domain Available — Direct Public IP (HTTP)
You can deploy directly using your DigitalOcean Droplet's public IP address (`http://<DROPLET_IP>`):
- Out of the box, Nginx listens on port 80 and routes Web, API, and Swagger Docs.
- Skip Step 5 (`init-ssl.sh`).
- In `.env`, set:
  ```env
  APP_DOMAIN=<DROPLET_IP>
  NEXTAUTH_URL=http://<DROPLET_IP>
  AUTH_URL=http://<DROPLET_IP>/api/auth
  NEXT_PUBLIC_API_URL=/api/v1
  ```

### Option B: No Domain Available — Free Instant Domain with Real HTTPS (`sslip.io`)
If you don't own a domain but still want **genuine HTTPS/SSL** (required for OAuth and secure WebSockets), you can use the free wildcard DNS service `sslip.io`:
- Any droplet IP automatically resolves to `<DROPLET_IP>.sslip.io` without registration or DNS configuration.
  *(Example: if your droplet IP is `164.92.100.50`, your domain is `164.92.100.50.sslip.io`)*
- Run `./scripts/init-ssl.sh <DROPLET_IP>.sslip.io admin@example.com` to get a real Let's Encrypt certificate!
- In `.env`, set:
  ```env
  APP_DOMAIN=<DROPLET_IP>.sslip.io
  NEXTAUTH_URL=https://<DROPLET_IP>.sslip.io
  AUTH_URL=https://<DROPLET_IP>.sslip.io/api/auth
  NEXT_PUBLIC_API_URL=/api/v1
  ```

### Option C: Custom Registered Domain (Recommended for Production)
Point your domain's DNS `A` records to your DigitalOcean Droplet Public IP:

| Type | Name / Host | Value / Target | TTL |
|---|---|---|---|
| **A** | `@` (or subdomain like `app`) | `<DROPLET_PUBLIC_IP>` | 300 (5 min) |
| **A** | `www` (optional) | `<DROPLET_PUBLIC_IP>` | 300 (5 min) |

---

## 4. Step-by-Step Deployment Walkthrough

### Step 1: Connect to Your DigitalOcean Droplet

```bash
ssh root@<YOUR_DROPLET_IP>
```

---

### Step 2: Clone the Repository to the Droplet

```bash
# Clone to /opt/nirmaanify
git clone https://github.com/<YOUR_ORGANIZATION_OR_USERNAME>/NirmaanifyAI.git /opt/nirmaanify
cd /opt/nirmaanify
```

---

### Step 3: Run the Automated VPS Provisioning Script

Run the automated provisioning script to install Docker CE, Docker Compose plugin, UFW firewall, Fail2ban, and configure 4GB swap:

```bash
chmod +x scripts/*.sh
sudo ./scripts/setup-vps.sh
```

---

### Step 4: Configure Production Environment Variables

Copy the production environment template to `.env`:

```bash
cp .env.production.example .env
nano .env
```

#### Key Variables to Configure:

1. **`APP_DOMAIN`**: Set to your domain (e.g. `nirmaanify.com` or `app.example.com`).
2. **`POSTGRES_PASSWORD`**: Generate a strong password:
   ```bash
   openssl rand -base64 24 | tr -dc 'a-zA-Z0-9'
   ```
3. **`JWT_SECRET`**:
   ```bash
   openssl rand -hex 32
   ```
4. **`AUTH_SECRET` & `NEXTAUTH_SECRET`**:
   ```bash
   openssl rand -hex 32
   ```
5. **`NEXTAUTH_URL` & `AUTH_URL`**: Set to `https://yourdomain.com` and `https://yourdomain.com/api/auth`.
6. **`MINIO_ROOT_PASSWORD`**: Strong password for MinIO object storage.
7. **AI Provider Keys**: Add your `GEMINI_API_KEY`, `OPENAI_API_KEY`, or `E2B_API_KEY`.

Save and exit `nano` with `Ctrl+O`, `Enter`, and `Ctrl+X`.

Secure file permissions:
```bash
chmod 600 .env
```

---

### Step 5: Initialize Free Let's Encrypt SSL Certificate

Run the automated SSL bootstrapping script:

```bash
./scripts/init-ssl.sh yourdomain.com admin@yourdomain.com
```

This script:
1. Verifies that your DNS is properly resolving to your droplet IP.
2. Initializes a bootstrap certificate so Nginx starts without crashing.
3. Obtains real 4096-bit Let's Encrypt certificates via ACME challenge.
4. Activates HTTPS and configures automatic renewal.

> [!NOTE]
> If testing on an IP address without a domain yet, copy `infrastructure/nginx/conf.d/default-http.conf.template` to `infrastructure/nginx/conf.d/default.conf` to run pure HTTP on port 80.

---

### Step 6: Deploy the Platform

Run the production deployment script:

```bash
./scripts/deploy.sh
```

The script will:
- Validate your `.env` configuration.
- Build production Docker images for **API**, **Web**, and **Worker**.
- Ensure database readiness and apply **Prisma schema migrations**.
- Launch all containers in detached mode.
- Perform health-check verification and prune dangling images.

Once complete, your site will be live at:
- **Web Application:** `https://yourdomain.com`
- **REST API:** `https://yourdomain.com/api/v1`
- **Swagger Documentation:** `https://yourdomain.com/api/docs`

---

## 5. Daily Operations & Container Management

Use the included helper script `./scripts/manage.sh`:

```bash
# Check running containers and CPU/memory consumption
./scripts/manage.sh status

# Follow real-time logs for all services
./scripts/manage.sh logs

# Follow logs for a specific service (api, web, worker, nginx, postgres, redis)
./scripts/manage.sh logs api
./scripts/manage.sh logs web
./scripts/manage.sh logs worker

# Restart a service or all services
./scripts/manage.sh restart api
./scripts/manage.sh restart

# Open interactive PostgreSQL terminal
./scripts/manage.sh db-shell

# Apply latest Prisma schema changes
./scripts/manage.sh db-push

# Open Redis CLI terminal
./scripts/manage.sh redis-cli

# Test SSL certificate auto-renewal
./scripts/manage.sh cert-renew
```

---

## 6. Updating Your Deployment (CI/CD / Pull Updates)

Whenever you push new code to GitHub:

```bash
cd /opt/nirmaanify
./scripts/deploy.sh
```

To deploy a specific branch:
```bash
./scripts/deploy.sh --branch staging
```

To force rebuild without Docker cache:
```bash
./scripts/deploy.sh --no-cache
```

---

## 7. Automated Backups

Run database backups on demand:

```bash
./scripts/backup.sh
```

Backups are saved to `/opt/nirmaanify/backups/db/nirmaanify_backup_<TIMESTAMP>.sql.gz` and pruned after 7 days.

### Add Automated Daily Backup Cron Job:

Edit root crontab:
```bash
crontab -e
```

Add the following line to run daily at 02:00 AM UTC:
```cron
0 2 * * * /opt/nirmaanify/scripts/backup.sh >> /var/log/nirmaanify-backup.log 2>&1
```

---

## 8. Troubleshooting & FAQ

### Q1: The build fails with `ENOMEM` or `killed` during Next.js or TypeScript compilation.
**Cause:** Insufficient RAM during compilation.  
**Fix:** Run `swapon --show` to verify 4GB swap is enabled. The `setup-vps.sh` script sets this up automatically.

### Q2: Let's Encrypt returns `Verification failed: Connection refused` or `DNS problem`.
**Cause:** DNS record has not propagated yet or port 80 is blocked.  
**Fix:**
1. Check DNS with `dig +short yourdomain.com`.
2. Check UFW with `ufw status` to ensure port 80/tcp is ALLOWED.
3. Wait 5-10 minutes for TTL expiration, then re-run `./scripts/init-ssl.sh`.

### Q3: How do I view MinIO Object Storage Console?
**Fix:** In `docker-compose.prod.yml`, port `9001` is internal by default. To securely access the MinIO console from your local workstation:
```bash
ssh -L 9001:localhost:9001 root@<DROPLET_IP>
```
Then open `http://localhost:9001` in your browser.

### Q4: Database connection error on first run.
**Fix:** Check `docker compose -f docker-compose.prod.yml logs postgres`. If passwords were changed in `.env` after volume was created, PostgreSQL retains the initial password in its persistent volume. To reset during initial setup:
```bash
docker compose -f docker-compose.prod.yml down -v
./scripts/deploy.sh
```
*(Warning: `down -v` removes data volumes, only use on initial setup).*
