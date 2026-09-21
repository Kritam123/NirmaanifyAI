#!/bin/bash
# ==============================================================================
# NIRMAANIFY AI — SWITCH TO PURE HTTP / DIRECT IP MODE
# ==============================================================================
# Use this script if you don't have a domain name and want to run the platform
# directly over your VPS Public IP address on port 80.
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.prod.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
    COMPOSE_FILE="docker-compose-prod.yml"
fi

echo -e "${CYAN}${BOLD}==> Activating Pure HTTP / Direct IP Mode...${NC}"

# Detect Public IP
SERVER_IP=$(curl -s -4 https://ifconfig.me || curl -s -4 https://api.ipify.org || echo "YOUR_VPS_IP")

# Copy HTTP template to default.conf
if [ -f "infrastructure/nginx/conf.d/default-http.conf.template" ]; then
    cp "infrastructure/nginx/conf.d/default-http.conf.template" "infrastructure/nginx/conf.d/default.conf"
    echo -e "${GREEN}✓ Nginx configured for port 80 HTTP traffic.${NC}"
fi

# Reload Nginx if running
if docker compose -f "$COMPOSE_FILE" ps | grep -q "nirmaanify-nginx"; then
    docker compose -f "$COMPOSE_FILE" exec nginx nginx -s reload || true
    echo -e "${GREEN}✓ Nginx reloaded.${NC}"
fi

echo -e "\n${GREEN}${BOLD}=================================================================="
echo "         Direct IP HTTP Mode is Now Active! 🚀                    "
echo "==================================================================${NC}"
echo -e "Make sure your .env has:"
echo -e "  ${BOLD}APP_DOMAIN=${SERVER_IP}${NC}"
echo -e "  ${BOLD}NEXTAUTH_URL=http://${SERVER_IP}${NC}"
echo -e "  ${BOLD}AUTH_URL=http://${SERVER_IP}/api/auth${NC}"
echo -e "  ${BOLD}NEXT_PUBLIC_API_URL=/api/v1${NC}"
echo -e ""
echo -e "Access your application at:"
echo -e "  Web Application:   ${CYAN}http://${SERVER_IP}${NC}"
echo -e "  REST API:          ${CYAN}http://${SERVER_IP}/api/v1${NC}"
echo -e "  API Docs (Swagger):${CYAN}http://${SERVER_IP}/api/docs${NC}"
echo -e "==================================================================\n"
