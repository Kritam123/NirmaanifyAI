'use client';

import React, { Suspense } from 'react';
import { AuthLayoutWrapper, VerifyEmailForm } from '../../../components/auth';
import { Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <AuthLayoutWrapper
      title="Verify your email"
      subtitle="Confirm your identity to unlock all platform capabilities."
      badgeText="Email Verification"
    >
      <Suspense
        fallback={
          <div className="flex justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#635BFF]" />
          </div>
        }
      >
        <VerifyEmailForm />
      </Suspense>
    </AuthLayoutWrapper>
  );
}
