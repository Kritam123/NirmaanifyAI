#!/bin/bash
# ==============================================================================
# NIRMAANIFY AI — LET'S ENCRYPT SSL CERTIFICATE INITIALIZATION SCRIPT
# ==============================================================================
# Provisions free, auto-renewing Let's Encrypt SSL certificates for your domain
# Usage:
#   ./scripts/init-ssl.sh <DOMAIN> <EMAIL>
# Example:
#   ./scripts/init-ssl.sh nirmaanify.com admin@nirmaanify.com
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose-prod.yml"
fi

DOMAIN="${1:-}"
EMAIL="${2:-}"

echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "    Nirmaanify AI — Let's Encrypt SSL Certificate Setup           "
echo "=================================================================="
echo -e "${NC}"

# Validate input parameters
if [ -z "$DOMAIN" ]; then
    read -rp "Enter your live domain name (e.g. nirmaanify.com or app.example.com): " DOMAIN
fi

if [ -z "$EMAIL" ]; then
    read -rp "Enter your admin email for Let's Encrypt expiry alerts: " EMAIL
fi

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}[ERROR] Both domain and email are strictly required.${NC}"
    exit 1
fi

echo -e "${BLUE}==> Target Domain:${NC} ${BOLD}$DOMAIN${NC}"
echo -e "${BLUE}==> Contact Email:${NC} ${BOLD}$EMAIL${NC}"

# ------------------------------------------------------------------------------
# 1. DNS Verification
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}==> [1/5] Verifying DNS resolution for ${DOMAIN}...${NC}"
SERVER_IP=$(curl -s -4 https://ifconfig.me || curl -s -4 https://api.ipify.org || echo "unknown")
DOMAIN_IP=$(dig +short "$DOMAIN" | tail -n1 || echo "")

echo "Droplet Public IP: $SERVER_IP"
echo "Domain Resolved IP: $DOMAIN_IP"

if [ -n "$DOMAIN_IP" ] && [ "$SERVER_IP" != "unknown" ] && [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo -e "${YELLOW}[WARNING] Domain IP ($DOMAIN_IP) does not match Droplet IP ($SERVER_IP)!${NC}"
    echo -e "${YELLOW}Please ensure your DNS A-Record for '$DOMAIN' is pointing to '$SERVER_IP'.${NC}"
    read -rp "Do you wish to proceed anyway? (y/N): " PROCEED
    if [[ ! "$PROCEED" =~ ^[Yy]$ ]]; then
        echo "Aborting SSL initialization."
        exit 1
    fi
else
    echo -e "${GREEN}✓ DNS record verified.${NC}"
fi

# ------------------------------------------------------------------------------
# 2. Bootstrap Temporary SSL Certificate for Nginx
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}==> [2/5] Creating temporary bootstrap SSL certificate...${NC}"

# Create docker volumes if not already present
docker volume create nirmaanify_certbot_conf >/dev/null 2>&1 || true
docker volume create nirmaanify_certbot_www >/dev/null 2>&1 || true

# Temporary dummy certificate container run
docker run --rm \
    -v nirmaanify_certbot_conf:/etc/letsencrypt \
    alpine sh -c "
        mkdir -p /etc/letsencrypt/live/nirmaanify && \
        if [ ! -f /etc/letsencrypt/live/nirmaanify/fullchain.pem ]; then
            apk add --no-cache openssl && \
            openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
                -keyout /etc/letsencrypt/live/nirmaanify/privkey.pem \
                -out /etc/letsencrypt/live/nirmaanify/fullchain.pem \
                -subj '/CN=localhost';
        fi
    "

echo -e "${GREEN}✓ Bootstrap certificate initialized.${NC}"

# ------------------------------------------------------------------------------
# 3. Start Nginx Service
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}==> [3/5] Starting Nginx container to serve ACME challenge...${NC}"
docker compose -f "$COMPOSE_FILE" up -d nginx

# ------------------------------------------------------------------------------
# 4. Request Real Let's Encrypt Certificate
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}==> [4/5] Requesting live SSL certificate from Let's Encrypt...${NC}"

docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
    certbot certonly --webroot \
    -w /var/www/certbot \
    --email '$EMAIL' \
    -d '$DOMAIN' \
    --rsa-key-size 4096 \
    --agree-tos \
    --no-eff-email \
    --force-renewal" certbot

# ------------------------------------------------------------------------------
# 5. Link Real Certificate and Reload Nginx
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}==> [5/5] Linking genuine certificates and reloading Nginx...${NC}"

docker run --rm \
    -v nirmaanify_certbot_conf:/etc/letsencrypt \
    alpine sh -c "
        rm -rf /etc/letsencrypt/live/nirmaanify && \
        ln -s /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/live/nirmaanify
    "

# Switch Nginx virtual host configuration to HTTPS
if [ -f "infrastructure/nginx/conf.d/default-ssl.conf.template" ]; then
    echo "Activating HTTPS Nginx configuration..."
    cp "infrastructure/nginx/conf.d/default-ssl.conf.template" "infrastructure/nginx/conf.d/default.conf"
fi

# Reload Nginx with new certificate
docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload

echo -e "\n${GREEN}${BOLD}=================================================================="
echo "    SSL Certificate Successfully Installed and Active! 🔒         "
echo "==================================================================${NC}"
echo -e "Your platform is now secured at: ${CYAN}https://${DOMAIN}${NC}"
echo -e "Let's Encrypt certificates will auto-renew every 60 days via the certbot container."
echo -e "==================================================================\n"
