'use client';

import React, { Suspense } from 'react';
import { AuthLayoutWrapper, ResetPasswordForm } from '../../../components/auth';
import { Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <AuthLayoutWrapper
      title="Create new password"
      subtitle="Ensure your new password meets security requirements."
      badgeText="Credential Update"
    >
      <Suspense
        fallback={
          <div className="flex justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-[#635BFF]" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthLayoutWrapper>
  );
}
