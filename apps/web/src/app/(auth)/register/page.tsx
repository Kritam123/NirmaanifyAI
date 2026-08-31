'use client';

import React from 'react';
import { AuthLayoutWrapper, RegisterForm } from '../../../components/auth';

export default function RegisterPage() {
  return (
    <AuthLayoutWrapper
      title="Create your account"
      subtitle="Start building intelligent full-stack apps with Nirmaanify."
      badgeText="Developer Onboarding"
    >
      <RegisterForm />
    </AuthLayoutWrapper>
  );
}
