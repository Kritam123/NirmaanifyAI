# Authentication & NextAuth (Auth.js v5) Feature Report

## Overview
Nirmaanify AI features a multi-provider authentication engine powered by **NextAuth (Auth.js v5)**, integrated with a NestJS backend and Prisma ORM. It supports traditional credentials alongside Google and GitHub OAuth social logins, backed by a dedicated `SocialAccount` entity and an account linking mechanism that resolves same-email collisions.

---

## Architecture Diagram

```mermaid
flowchart TD
    A[User Browser] -->|Click Google/GitHub Login| B[NextAuth v5 Client]
    B -->|OAuth Flow| C[OAuth Provider (Google / GitHub)]
    C -->|Authorization Code / Tokens| D[NextAuth Route Handler (/api/auth/[...nextauth])]
    D -->|signIn Callback| E[API Client (apiClient.auth.oauthLogin)]
    E -->|POST /api/v1/auth/oauth| F[NestJS AuthController]
    F -->|AuthService.oauthLogin| G{User Exists by Email?}
    G -->|Yes| H[Link SocialAccount to Existing User]
    G -->|No| I[Create New User + Personal Studio + SocialAccount]
    H --> J[Return JWT + Active Workspace]
    I --> J[Return JWT + Active Workspace]
    J --> K[Session Token Encrypted in Cookie]
    K --> L[Dashboard / Protected Routes]
```

---

## 1. Dedicated `SocialAccount` Model

In `packages/database/prisma/schema.prisma`, social accounts are decoupled into their own model to record identity data, refresh tokens, and rich profile payloads for future telemetry.

```prisma
enum AuthProvider {
  CREDENTIALS
  GOOGLE
  GITHUB
}

model User {
  id              String               @id @default(uuid())
  email           String               @unique
  passwordHash    String?              // Nullable for pure OAuth sign-ins
  name            String
  avatarUrl       String?
  role            UserRole             @default(MEMBER)
  primaryProvider AuthProvider         @default(CREDENTIALS)
  isEmailVerified Boolean              @default(false)
  isActive        Boolean              @default(true)
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  socialAccounts  SocialAccount[]
  workspaces      Workspace[]          @relation("WorkspaceOwner")
  memberships     WorkspaceMember[]
  projectMembers  ProjectMember[]
  resetTokens     PasswordResetToken[]
  auditLogs       AuditLog[]

  @@map("users")
}

model SocialAccount {
  id                String       @id @default(uuid())
  userId            String
  provider          AuthProvider
  providerAccountId String
  email             String?
  displayName       String?
  avatarUrl         String?
  accessToken       String?      @db.Text
  refreshToken      String?      @db.Text
  expiresAt         Int?
  tokenType         String?
  scope             String?
  idToken           String?      @db.Text
  sessionState      String?
  profileData       Json         @default("{}") // Full provider profile for analytics
  lastLoginAt       DateTime     @default(now())
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt

  user              User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
  @@index([email])
  @@map("social_accounts")
}
```

---

## 2. Same-Email Collision Resolution

When a user signs in via an OAuth provider:
1. **Existing User Match**: If an account with the same verified email already exists in the system (created earlier via Email/Password or another provider), the new provider account is linked directly to the existing `User` entity.
2. **Data Preservation**: The user retains all existing workspaces, project memberships, and administrative roles without account divergence or credential collision errors.
3. **Analytics Tracking**: `profileData` and `lastLoginAt` are refreshed on each login for cohort analytics.

---

## 3. Environment Variables Configuration

The following keys are configured in both root `.env` and `apps/web/.env.local`:

```env
# NextAuth v5 Core
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000/api/auth
NEXTAUTH_SECRET=super_secret_nirmaanify_nextauth_key_32chars!
AUTH_SECRET=super_secret_nirmaanify_nextauth_key_32chars!
AUTH_TRUST_HOST=true

# GitHub OAuth Provider
# Callback: http://localhost:3000/api/auth/callback/github
AUTH_GITHUB_ID=Ov23liReCCOMeLgMqmtC
AUTH_GITHUB_SECRET=06bcff4ca0a9537d2e9717f4869de6965608bd78
GITHUB_CLIENT_ID=Ov23liReCCOMeLgMqmtC
GITHUB_CLIENT_SECRET=06bcff4ca0a9537d2e9717f4869de6965608bd78

# Google OAuth Provider
# Callback: http://localhost:3000/api/auth/callback/google
AUTH_GOOGLE_ID=448602182428-3lvdeihn2ln2isgl3gk3vfdnu156cadi.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=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
GOOGLE_CLIENT_ID=448602182428-3lvdeihn2ln2isgl3gk3vfdnu156cadi.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

---

## 4. UI Components

- **`SocialAuthButtons.tsx`**: Horizontal inline flex buttons for `[  GitHub ]` and `[  Google ]` with dynamic spinner states.
- **`LoginForm.tsx` & `RegisterForm.tsx`**: Standard forms with password visibility toggles, strength meters, and NextAuth session integration.
- **`NextAuthSessionProvider.tsx`**: High-performance React context wrapper supplying authentication state to the entire tree.
