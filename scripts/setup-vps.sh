#!/bin/bash
# ==============================================================================
# NIRMAANIFY AI — DIGITALOCEAN VPS PROVISIONING & SETUP SCRIPT
# ==============================================================================
# Supported OS: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS
# Target: DigitalOcean Droplets (Standard, Basic, or CPU-Optimized)
# Usage:
#   chmod +x scripts/setup-vps.sh
#   sudo ./scripts/setup-vps.sh
# ==============================================================================

set -euo pipefail

# Text formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "=================================================================="
echo "    Nirmaanify AI — DigitalOcean Droplet Initial Setup Script     "
echo "=================================================================="
echo -e "${NC}"

# Check for root privileges
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[ERROR] This setup script must be run as root (or with sudo).${NC}"
    exit 1
fi

# Detect non-root calling user
ACTUAL_USER="${SUDO_USER:-$USER}"
INSTALL_DIR="/opt/nirmaanify"

echo -e "${BLUE}==> [1/7] Updating system package index and upgrading packages...${NC}"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get upgrade -y

echo -e "${BLUE}==> [2/7] Installing essential utilities...${NC}"
apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw \
    fail2ban \
    htop \
    jq \
    net-tools \
    unzip \
    tar \
    dnsutils

# ------------------------------------------------------------------------------
# 3. Swap Configuration (Critical for 1GB - 2GB RAM droplets)
# ------------------------------------------------------------------------------
SWAP_SIZE="4G"
SWAP_FILE="/swapfile"

if [ -f "$SWAP_FILE" ]; then
    echo -e "${GREEN}✓ Swap file already exists at ${SWAP_FILE}.${NC}"
else
    echo -e "${BLUE}==> [3/7] Creating ${SWAP_SIZE} swap file to prevent build OOM errors...${NC}"
    fallocate -l "$SWAP_SIZE" "$SWAP_FILE" || dd if=/dev/zero of="$SWAP_FILE" bs=1M count=4096
    chmod 600 "$SWAP_FILE"
    mkswap "$SWAP_FILE"
    swapon "$SWAP_FILE"
    echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab

    # Tune swap parameters
    sysctl vm.swappiness=10
    sysctl vm.vfs_cache_pressure=50
    echo "vm.swappiness=10" >> /etc/sysctl.conf
    echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
    echo -e "${GREEN}✓ ${SWAP_SIZE} swap enabled successfully.${NC}"
fi

# ------------------------------------------------------------------------------
# 4. Install Official Docker Engine & Docker Compose Plugin
# ------------------------------------------------------------------------------
echo -e "${BLUE}==> [4/7] Installing official Docker Engine & Docker Compose plugin...${NC}"

if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker is already installed: $(docker --version)${NC}"
else
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # Enable and start Docker service
    systemctl enable docker
    systemctl start docker
    echo -e "${GREEN}✓ Docker Engine installed: $(docker --version)${NC}"
fi

# Add user to docker group
if [ "$ACTUAL_USER" != "root" ]; then
    usermod -aG docker "$ACTUAL_USER"
    echo -e "${GREEN}✓ User '${ACTUAL_USER}' added to 'docker' group.${NC}"
fi

# Configure Docker daemon log rotation (prevents disk space exhaustion)
echo -e "${BLUE}==> [5/7] Configuring Docker daemon log rotation...${NC}"
mkdir -p /etc/docker
cat <<EOF > /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

# ------------------------------------------------------------------------------
# 6. Configure UFW Firewall & Fail2ban
# ------------------------------------------------------------------------------
echo -e "${BLUE}==> [6/7] Configuring UFW Firewall & Fail2ban security...${NC}"

# Allow SSH, HTTP, HTTPS
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Enable UFW non-interactively
echo "y" | ufw enable
ufw status verbose

# Configure Fail2ban for SSH protection
systemctl enable fail2ban
systemctl start fail2ban
echo -e "${GREEN}✓ Firewall and Fail2ban configured.${NC}"

# Disable native web servers to avoid port 80/443 conflicts with Dockerized Nginx
if command -v systemctl &>/dev/null; then
    for srv in nginx apache2 httpd lighttpd; do
        systemctl stop "$srv" 2>/dev/null || true
        systemctl disable "$srv" 2>/dev/null || true
    done
fi

# ------------------------------------------------------------------------------
# 7. Setup Application Deployment Directory
# ------------------------------------------------------------------------------
echo -e "${BLUE}==> [7/7] Preparing application directory at ${INSTALL_DIR}...${NC}"
mkdir -p "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR/backups/db"
chown -R "$ACTUAL_USER":"$ACTUAL_USER" "$INSTALL_DIR"

echo -e "\n${GREEN}${BOLD}=================================================================="
echo "         VPS Provisioning Completed Successfully! 🎉              "
echo "==================================================================${NC}"
echo -e "Next Steps on this Droplet:"
echo -e "  1. Switch to user: ${CYAN}su - ${ACTUAL_USER}${NC} (or log out and log back in)"
echo -e "  2. Clone repository: ${CYAN}git clone <REPO_URL> ${INSTALL_DIR}${NC}"
echo -e "  3. Navigate to app:  ${CYAN}cd ${INSTALL_DIR}${NC}"
echo -e "  4. Create .env:      ${CYAN}cp .env.production.example .env && nano .env${NC}"
echo -e "  5. Issue SSL cert:   ${CYAN}./scripts/init-ssl.sh yourdomain.com your@email.com${NC}"
echo -e "  6. Run deployment:   ${CYAN}./scripts/deploy.sh${NC}"
echo -e "==================================================================\n"
