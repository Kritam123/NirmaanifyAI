'use client';

import React from 'react';
import { AuthLayoutWrapper, LoginForm } from '../../../components/auth';

export default function LoginPage() {
  return (
    <AuthLayoutWrapper
      title="Welcome back"
      subtitle="Sign in to your account and continue designing system architectures."
      badgeText="Architecture Studio Sign In"
    >
      <LoginForm />
    </AuthLayoutWrapper>
  );
}
