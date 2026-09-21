# GitHub Actions CI/CD Secrets Setup Guide

To enable automated Continuous Deployment (CD) from GitHub directly to your DigitalOcean VPS, you need to configure 3 repository secrets in GitHub.

---

## 1. How to Add Secrets in GitHub

1. Open your repository on GitHub.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add each of the secrets listed below.

---

## 2. Required GitHub Secrets

| Secret Name | Description | Example |
|---|---|---|
| `DO_HOST` | The public IPv4 address or domain of your DigitalOcean Droplet | `164.92.100.50` |
| `DO_USER` | The SSH username on the Droplet (usually `root` or a deploy user) | `root` |
| `DO_SSH_KEY` | Private SSH Key used to authenticate with your Droplet without a password | *(See instructions below)* |
| `DO_PORT` *(Optional)* | SSH port (defaults to 22 if omitted) | `22` |

---

## 3. How to Generate / Find Your `DO_SSH_KEY`

If you already use an SSH key to connect to your droplet (`ssh root@<IP>`), you can use your existing private key.

### Option A: Generate a Dedicated Deploy Key Pair (Recommended)

Run on your local machine:
```bash
# Generate dedicated key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./id_deploy -N ""
```

1. **Add the Public Key to your DigitalOcean Droplet:**
   ```bash
   cat ./id_deploy.pub | ssh root@<DROPLET_IP> "cat >> ~/.ssh/authorized_keys"
   ```
2. **Copy the Private Key for GitHub Secret `DO_SSH_KEY`:**
   ```bash
   cat ./id_deploy
   ```
   Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`), and paste it as the value for `DO_SSH_KEY` in GitHub.

---

## 4. How the CI/CD Pipeline Operates

```mermaid
flowchart LR
    A["Push / PR to GitHub"] --> B["CI Workflow\n(Lint, Typecheck, Build)"]
    B -->|Passed| C{"Branch == main?"}
    C -->|Yes| D["CD Workflow\n(SSH into Droplet)"]
    C -->|No| E["Done (Checks Passed)"]
    D --> F["Git Pull & scripts/deploy.sh"]
    F --> G["Health Check Verified & Live! 🚀"]
```

### Automatic Trigger:
- Every `git push` to `main` or `master` will run tests, verify builds, SSH into your Droplet, pull the latest code, build Docker containers, sync database schemas, and reload the platform with zero downtime!

### Manual Trigger:
- You can manually trigger a deployment to any branch at any time from GitHub:
  1. Go to **Actions** tab in your repository.
  2. Select **CD (Deploy to DigitalOcean VPS)**.
  3. Click **Run workflow** and choose your branch.
