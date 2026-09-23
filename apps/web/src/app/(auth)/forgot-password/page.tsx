'use client';

import React from 'react';
import { AuthLayoutWrapper, ForgotPasswordForm } from '../../../components/auth';

export default function ForgotPasswordPage() {
  return (
    <AuthLayoutWrapper
      title="Reset your password"
      subtitle="We'll send you instructions to recover your architecture studio access."
      badgeText="Account Recovery"
    >
      <ForgotPasswordForm />
    </AuthLayoutWrapper>
  );
}
