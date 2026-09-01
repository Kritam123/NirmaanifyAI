'use client';

import React from 'react';
import { AuthLayoutWrapper, LoginForm } from '../../../components/auth';

export default function LoginPage() {
  return (
    <AuthLayoutWrapper
      title="Welcome back"
      subtitle="Sign in to your account and continue building."
      badgeText="Platform Authentication"
    >
      <LoginForm />
    </AuthLayoutWrapper>
  );
}
