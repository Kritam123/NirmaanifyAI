# GitHub Actions CI/CD Secrets Setup & Concurrency Guide

To enable automated Continuous Deployment (CD) from GitHub directly to your DigitalOcean VPS, you need to configure repository secrets in GitHub.

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

## 4. Pipeline Concurrency & Execution Priority

The CI/CD pipeline enforces **strict single-runner execution** (`concurrency.group: nirmaanify-single-runner`) to ensure no concurrent runners execute at any time.

```mermaid
flowchart TD
    subgraph PR_Phase["1. Pull Request (Highest Priority)"]
        PR["Open / Update PR"] --> CI["CI Runner: Lint, Typecheck, Build\n(cancel-in-progress: true)"]
        CI --> Passed["Checks Pass & PR Approved"]
    end

    subgraph Merge_Phase["2. Main Branch After Merge (Sequential Deployment)"]
        Passed --> Merge["Merge PR into main"]
        Merge --> CD["Deploy Runner: Verify Gate + SSH Deploy + Health Check\n(cancel-in-progress: false)"]
        CD --> Live["Live on DigitalOcean VPS! 🚀"]
    end
```

### Key Principles:
1. **Single Runner Across Repository**: Both `ci.yml` and `deploy.yml` share the concurrency group `nirmaanify-single-runner`. GitHub guarantees that at most **one runner** executes at any time.
2. **PR Priority**: Pull requests have immediate priority for code quality checks. When new commits are pushed to a PR, any previous in-progress run is superseded (`cancel-in-progress: true`) so developers receive rapid feedback.
3. **Deployment After Merge**: The CD deployment workflow only triggers on `push` to `main` (after a PR is merged) or manual `workflow_dispatch`. It runs strictly on **one runner** from verification to droplet rollout, and queues safely (`cancel-in-progress: false`) to prevent deployment collisions.
