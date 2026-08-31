'use client';

import React, { useState, useEffect } from 'react';
import {
  CmsCollection,
  CmsEntry,
  CmsEntryStatus,
  CreateEntryDto,
} from '@nirmaanify/types';
import {
  Dialog,
  Button,
  Input,
  Textarea,
  Select,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Archive,
  Save,
  Send,
} from 'lucide-react';

interface ContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreateEntryDto) => Promise<void>;
  collection: CmsCollection;
  initialEntry?: CmsEntry | null;
}

export function ContentEditorModal({
  isOpen,
  onClose,
  onSave,
  collection,
  initialEntry,
}: ContentEditorModalProps) {
  const { toast } = useToast();
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<CmsEntryStatus>('DRAFT');
  const [scheduledDate, setScheduledDate] = useState('');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEntry) {
      setSlug(initialEntry.slug);
      setStatus(initialEntry.status);
      setScheduledDate(initialEntry.scheduledPublishAt ? initialEntry.scheduledPublishAt.slice(0, 16) : '');
      setFormData(initialEntry.data || {});
    } else {
      setSlug('');
      setStatus('DRAFT');
      setScheduledDate('');
      const defaults: Record<string, any> = {};
      collection.fields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          defaults[f.key] = f.defaultValue;
        } else if (f.type === 'BOOLEAN') {
          defaults[f.key] = false;
        } else if (f.type === 'NUMBER') {
          defaults[f.key] = 0;
        } else {
          defaults[f.key] = '';
        }
      });
      setFormData(defaults);
    }
  }, [initialEntry, collection, isOpen]);

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Auto-generate slug from title or name if slug is empty
    if (!initialEntry && (key === 'title' || key === 'name') && typeof value === 'string') {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleSave = async (targetStatus?: CmsEntryStatus) => {
    const finalStatus = targetStatus || status;

    if (!slug.trim()) {
      toast({ title: 'Validation Error', description: 'Entry URL Slug is required.', type: 'error' });
      return;
    }

    // Check required fields
    for (const f of collection.fields) {
      if (f.required && (formData[f.key] === undefined || formData[f.key] === '')) {
        toast({ title: 'Missing Required Field', description: `Please fill in "${f.name}".`, type: 'error' });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSave({
        slug: slug.trim(),
        status: finalStatus,
        data: formData,
        scheduledPublishAt: finalStatus === 'SCHEDULED' && scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      });

      onClose();
      toast({
        title: finalStatus === 'PUBLISHED' ? 'Entry Published! 🚀' : 'Entry Saved',
        description: `Successfully updated entry in "${collection.name}".`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Error Saving Entry',
        description: err.message || 'Could not save entry.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialEntry ? `Edit Entry: ${initialEntry.slug}` : `New Entry in ${collection.name}`}
      description={`Manage content data fields based on the ${collection.name} schema.`}
      className="max-w-4xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                status === 'PUBLISHED'
                  ? 'cyan'
                  : status === 'SCHEDULED'
                  ? 'indigo'
                  : 'secondary'
              }
              size="sm"
            >
              Current Status: {status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave('DRAFT')}
              isLoading={isSubmitting && status === 'DRAFT'}
              leftIcon={<Save className="h-3.5 w-3.5" />}
            >
              Save Draft
            </Button>
            <Button
              variant="default"
              onClick={() => handleSave('PUBLISHED')}
              isLoading={isSubmitting && status === 'PUBLISHED'}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              Publish Now
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Entry Metadata Header: Slug & Status Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
          <div className="sm:col-span-2">
            <Input
              label="URL Slug (Permanent Key)"
              placeholder="e.g. intro-to-ai-architecture"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Lifecycle Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CmsEntryStatus)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] font-semibold"
            >
              <option value="DRAFT">Draft (Unpublished)</option>
              <option value="PUBLISHED">Published (Live on site)</option>
              <option value="SCHEDULED">Scheduled Release</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          {status === 'SCHEDULED' && (
            <div className="sm:col-span-3 pt-2">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Scheduled Date & Time</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D]"
              />
            </div>
          )}
        </div>

        {/* Dynamic Schema-Driven Form Fields */}
        <div className="space-y-4 pt-2">
          {collection.fields.map((f) => {
            const val = formData[f.key] !== undefined ? formData[f.key] : '';

            return (
              <div key={f.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {f.name}
                    {f.required && <span className="text-rose-500 ml-1">*</span>}
                  </label>
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    {f.type}
                  </span>
                </div>

                {/* TEXT */}
                {f.type === 'TEXT' && (
                  <Input
                    placeholder={f.placeholder || `Enter ${f.name}...`}
                    value={val}
                    onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  />
                )}

                {/* RICH_TEXT */}
                {f.type === 'RICH_TEXT' && (
                  <Textarea
                    placeholder={f.placeholder || `Write detailed ${f.name} content...`}
                    rows={6}
                    value={val}
                    onChange={(e) => handleFieldChange(f.key, e.target.value)}
                  />
                )}

                {/* NUMBER */}
                {f.type === 'NUMBER' && (
                  <Input
                    type="number"
                    placeholder="0"
                    value={val}
                    onChange={(e) => handleFieldChange(f.key, Number(e.target.value))}
                  />
                )}

                {/* BOOLEAN */}
                {f.type === 'BOOLEAN' && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => handleFieldChange(f.key, e.target.checked)}
                      className="h-4 w-4 text-[#635BFF] rounded"
                    />
                    <span className="text-xs text-slate-500">
                      {val ? 'Enabled / True' : 'Disabled / False'}
                    </span>
                  </div>
                )}

                {/* DATE */}
                {f.type === 'DATE' && (
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => handleFieldChange(f.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
                  />
                )}

                {/* IMAGE */}
                {f.type === 'IMAGE' && (
                  <div className="space-y-2">
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      value={val}
                      onChange={(e) => handleFieldChange(f.key, e.target.value)}
                    />
                    {val && (
                      <div className="h-28 w-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]">
                        <img src={val} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {/* SELECT */}
                {f.type === 'SELECT' && f.options && (
                  <select
                    value={val}
                    onChange={(e) => handleFieldChange(f.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D]"
                  >
                    <option value="">Select an option...</option>
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {/* JSON / RELATION */}
                {(f.type === 'JSON' || f.type === 'RELATION') && (
                  <Textarea
                    placeholder='{"key": "value"}'
                    rows={3}
                    value={typeof val === 'object' ? JSON.stringify(val, null, 2) : val}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleFieldChange(f.key, parsed);
                      } catch {
                        handleFieldChange(f.key, e.target.value);
                      }
                    }}
                  />
                )}

                {f.helpText && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{f.helpText}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Dialog>
  );
}
