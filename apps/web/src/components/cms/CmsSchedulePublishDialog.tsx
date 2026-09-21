'use client';

import React, { useState } from 'react';
import { CmsContentItemDto } from '@nirmaanify/types';
import { Dialog, Button, Input, useToast } from '@nirmaanify/ui';
import { Clock } from 'lucide-react';

interface CmsSchedulePublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: CmsContentItemDto | null;
  onSchedule: (itemId: string, scheduledAtIso: string) => Promise<boolean>;
}

export const CmsSchedulePublishDialog: React.FC<CmsSchedulePublishDialogProps> = ({
  isOpen,
  onClose,
  item,
  onSchedule,
}) => {
  const { toast } = useToast();
  // Default to tomorrow 09:00 AM
  const defaultDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const [scheduledAt, setScheduledAt] = useState<string>(defaultDate);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!item) return;
    if (!scheduledAt) {
      toast({
        title: 'Date Required',
        description: 'Please select a future date and time.',
        type: 'error',
      });
      return;
    }

    const targetDate = new Date(scheduledAt);
    if (isNaN(targetDate.getTime()) || targetDate.getTime() <= Date.now()) {
      toast({
        title: 'Invalid Date',
        description: 'Scheduled publication date must be in the future.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await onSchedule(item.id, targetDate.toISOString());
      if (ok) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Publication"
      description={`Automate release for "${item?.slug || item?.id}". When the time arrives, this item will automatically be switched to PUBLISHED status.`}
      className="max-w-md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            leftIcon={<Clock className="h-3.5 w-3.5" />}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Confirm Schedule
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <Input
          label="Publication Date & Time *"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-700 dark:text-violet-300">
          <p className="font-semibold">⚡ Automated Background Dispatch</p>
          <p className="mt-0.5 text-[11px] opacity-80">
            Nirmaanify's BullMQ worker queue actively processes scheduled items and promotes them to the live edge API.
          </p>
        </div>
      </div>
    </Dialog>
  );
};
