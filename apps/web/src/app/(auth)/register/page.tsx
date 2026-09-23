'use client';

import React from 'react';
import { AuthLayoutWrapper, RegisterForm } from '../../../components/auth';

export default function RegisterPage() {
  return (
    <AuthLayoutWrapper
      title="Create your account"
      subtitle="Start designing system architectures, cloud topologies, and UML diagrams."
      badgeText="Architect Onboarding"
    >
      <RegisterForm />
    </AuthLayoutWrapper>
  );
}
