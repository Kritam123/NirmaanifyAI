# ==============================================================================
# Nirmaanify AI: Full-Stack Micro-VM Sandbox Template (E2B & Local Docker)
# ==============================================================================
FROM node:22-bookworm-slim

# Install system dependencies (git, curl, bash, procps, python3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    bash \
    procps \
    python3 \
    make \
    g++ \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

# Set working directory for developer projects
WORKDIR /home/user/project

# Pre-install global CLI tools for instant execution
RUN npm install -g @nestjs/cli prisma turbo tsx

# Expose ports: 3000 (Next.js frontend), 4000 (NestJS backend API)
EXPOSE 3000 4000

# Set user environment
ENV NODE_ENV=development
ENV PORT=4000
ENV WEB_PORT=3000
ENV HOST=0.0.0.0

# Start command
CMD ["bash"]
