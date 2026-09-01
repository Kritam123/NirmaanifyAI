import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { apiClient } from './api';

const getCleanEnv = (val?: string): string | undefined => {
  const trimmed = val?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    GitHub({
      clientId: getCleanEnv(process.env.AUTH_GITHUB_ID) || getCleanEnv(process.env.GITHUB_CLIENT_ID),
      clientSecret: getCleanEnv(process.env.AUTH_GITHUB_SECRET) || getCleanEnv(process.env.GITHUB_CLIENT_SECRET),
    }),
    Google({
      clientId: getCleanEnv(process.env.AUTH_GOOGLE_ID) || getCleanEnv(process.env.GOOGLE_CLIENT_ID),
      clientSecret: getCleanEnv(process.env.AUTH_GOOGLE_SECRET) || getCleanEnv(process.env.GOOGLE_CLIENT_SECRET),
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const authRes = await apiClient.auth.login({
          email: credentials.email as string,
          password: credentials.password as string,
        });

        if (authRes && authRes.user) {
          return {
            id: authRes.user.id,
            name: authRes.user.name,
            email: authRes.user.email,
            image: authRes.user.avatarUrl,
            role: authRes.user.role,
            accessToken: authRes.accessToken,
            activeWorkspace: authRes.activeWorkspace,
            provider: 'CREDENTIALS',
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Handle OAuth account linking & attribute storage
      if (account && account.provider !== 'credentials') {
        const providerName = account.provider.toUpperCase() as 'GOOGLE' | 'GITHUB';
        
        const socialAccountData = {
          provider: providerName,
          providerAccountId: account.providerAccountId || (account as any).id || user.id || 'oauth-id',
          email: user.email,
          name: user.name || (profile as any)?.name || user.email.split('@')[0],
          avatarUrl: user.image || (profile as any)?.avatar_url || (profile as any)?.picture,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          idToken: account.id_token,
          profileData: {
            login: (profile as any)?.login,
            bio: (profile as any)?.bio,
            locale: (profile as any)?.locale,
            verified: (profile as any)?.email_verified ?? true,
            providerRaw: profile || {},
          },
        };

        const syncedAuth = await apiClient.auth.oauthLogin(socialAccountData);
        (user as any).id = syncedAuth.user.id;
        (user as any).role = syncedAuth.user.role;
        (user as any).accessToken = syncedAuth.accessToken;
        (user as any).activeWorkspace = syncedAuth.activeWorkspace;
        (user as any).socialAccount = socialAccountData;
        (user as any).provider = providerName;
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'OWNER';
        token.provider = (user as any).provider || (account?.provider ? account.provider.toUpperCase() : 'CREDENTIALS');
        token.accessToken = (user as any).accessToken;
        token.activeWorkspace = (user as any).activeWorkspace;
        token.socialAccount = (user as any).socialAccount;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).provider = token.provider as string;
        (session.user as any).activeWorkspace = token.activeWorkspace;
        (session.user as any).socialAccount = token.socialAccount;
      }
      (session as any).accessToken = token.accessToken;
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'super_secret_nirmaanify_nextauth_key_32chars!',
});
