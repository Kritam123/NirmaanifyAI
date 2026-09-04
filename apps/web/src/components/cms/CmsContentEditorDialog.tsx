'use client';

import React, { useState, useEffect } from 'react';
import {
  CmsCollectionDto,
  CmsContentItemDto,
  CmsContentStatus,
  CreateCmsContentItemDto,
} from '@nirmaanify/types';
import {
  Dialog,
  Button,
  Input,
  Textarea,
  Switch,
  Select,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Calendar,
  Save,
  Send,
  Clock,
  CheckCircle2,
  FileCode,
  Image as ImageIcon,
} from 'lucide-react';

interface CmsContentEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  collection: CmsCollectionDto;
  itemToEdit?: CmsContentItemDto | null;
  onSave: (dto: CreateCmsContentItemDto) => Promise<any>;
}

export const CmsContentEditorDialog: React.FC<CmsContentEditorDialogProps> = ({
  isOpen,
  onClose,
  collection,
  itemToEdit,
  onSave,
}) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [slug, setSlug] = useState<string>('');
  const [status, setStatus] = useState<CmsContentStatus>('DRAFT');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit.data || {});
      setSlug(itemToEdit.slug || '');
      setStatus(itemToEdit.status || 'DRAFT');
      setScheduledAt(
        itemToEdit.scheduledAt ? new Date(itemToEdit.scheduledAt).toISOString().slice(0, 16) : ''
      );
    } else {
      // Default values from collection fields
      const defaults: Record<string, any> = {};
      collection.fields.forEach((f) => {
        if (f.defaultValue !== undefined) {
          defaults[f.key] = f.defaultValue;
        } else if (f.type === 'BOOLEAN') {
          defaults[f.key] = false;
        }
      });
      setFormData(defaults);
      setSlug('');
      setStatus('DRAFT');
      setScheduledAt('');
    }
  }, [itemToEdit, collection, isOpen]);

  const handleFieldChange = (key: string, val: any) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: val };
      if (!itemToEdit && (key === 'title' || key === 'name') && !slug) {
        setSlug(
          String(val)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        );
      }
      return next;
    });
  };

  const handleSaveAction = async (targetStatus: CmsContentStatus) => {
    // Basic required check
    for (const field of collection.fields) {
      if (field.required) {
        const val = formData[field.key];
        if (val === undefined || val === null || val === '') {
          toast({
            title: 'Missing Required Field',
            description: `Please enter a value for "${field.name}".`,
            type: 'error',
          });
          return;
        }
      }
    }

    if (targetStatus === 'SCHEDULED' && !scheduledAt) {
      toast({
        title: 'Missing Schedule Date',
        description: 'Please specify a future date & time for publication.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        slug: slug.trim() || undefined,
        data: formData,
        status: targetStatus,
        scheduledAt: targetStatus === 'SCHEDULED' ? new Date(scheduledAt).toISOString() : undefined,
      });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error Saving Content',
        description: err.message || 'Could not save content item',
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
      title={itemToEdit ? `Edit Entry: ${itemToEdit.slug || itemToEdit.id}` : `New ${collection.name} Entry`}
      description={`Fill out the structured fields defined for "${collection.name}".`}
      className="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Save className="h-3.5 w-3.5" />}
              onClick={() => handleSaveAction('DRAFT')}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
            <Button
              variant="default"
              size="sm"
              leftIcon={<Send className="h-3.5 w-3.5" />}
              onClick={() => handleSaveAction('PUBLISHED')}
              disabled={isSubmitting}
            >
              Publish Now
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 max-h-[72vh] overflow-y-auto pr-1">
        {/* URL Slug & Publication Controls */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <Input
                label="Custom URL Slug"
                placeholder="e.g. awesome-new-feature"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div className="sm:w-48 space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select
                className="w-full h-9 rounded-lg border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] px-3 text-xs text-slate-800 dark:text-slate-200"
                value={status}
                onChange={(e) => setStatus(e.target.value as CmsContentStatus)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          {status === 'SCHEDULED' && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <Input
                label="Scheduled Publication Date & Time"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Dynamic Fields generated from Collection Schema */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#635BFF] dark:text-[#A5AEFD]">
            Collection Fields ({collection.fields.length})
          </h4>

          {collection.fields.map((field) => {
            const val = formData[field.key];

            switch (field.type) {
              case 'TEXT':
                return (
                  <Input
                    key={field.key}
                    label={`${field.name}${field.required ? ' *' : ''}`}
                    placeholder={`Enter ${field.name.toLowerCase()}...`}
                    value={val || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                );

              case 'RICH_TEXT':
                return (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{field.name}{field.required ? ' *' : ''}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Markdown &amp; HTML supported</span>
                    </label>
                    <Textarea
                      rows={6}
                      placeholder={`# Write content in markdown or HTML...`}
                      value={val || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    />
                  </div>
                );

              case 'NUMBER':
                return (
                  <Input
                    key={field.key}
                    type="number"
                    label={`${field.name}${field.required ? ' *' : ''}`}
                    placeholder="0"
                    value={val !== undefined ? val : ''}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value ? Number(e.target.value) : '')
                    }
                  />
                );

              case 'BOOLEAN':
                return (
                  <div
                    key={field.key}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {field.name}{field.required ? ' *' : ''}
                      </p>
                      <p className="text-[11px] text-slate-400">Toggle active state</p>
                    </div>
                    <Switch
                      checked={Boolean(val)}
                      onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                    />
                  </div>
                );

              case 'DATE':
                return (
                  <Input
                    key={field.key}
                    type="date"
                    label={`${field.name}${field.required ? ' *' : ''}`}
                    value={val ? String(val).slice(0, 10) : ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                );

              case 'IMAGE':
                return (
                  <div key={field.key} className="space-y-2">
                    <Input
                      label={`${field.name}${field.required ? ' *' : ''}`}
                      placeholder="https://images.unsplash.com/..."
                      value={val || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    />
                    {val && (
                      <div className="relative h-28 w-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-inner">
                        <img src={val} alt={field.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                );

              case 'FILE':
                return (
                  <Input
                    key={field.key}
                    label={`${field.name}${field.required ? ' *' : ''}`}
                    placeholder="https://... /assets/document.pdf"
                    value={val || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                );

              case 'SELECT': {
                const options = field.validation?.options || [];
                return (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {field.name}{field.required ? ' *' : ''}
                    </label>
                    <select
                      className="w-full h-9 rounded-lg border border-slate-200 dark:border-[#24293D] bg-white dark:bg-[#0F111A] px-3 text-xs text-slate-800 dark:text-slate-200"
                      value={val || ''}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                    >
                      <option value="">-- Select option --</option>
                      {options.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label || opt.value}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              case 'RELATION':
                return (
                  <Input
                    key={field.key}
                    label={`${field.name} (${field.validation?.targetCollectionSlug || 'Relation'})${field.required ? ' *' : ''}`}
                    placeholder="Linked entry slug / ID"
                    value={val || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                );

              case 'JSON':
                return (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{field.name}{field.required ? ' *' : ''}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Raw JSON Object</span>
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="{}"
                      className="font-mono text-xs"
                      value={typeof val === 'object' ? JSON.stringify(val, null, 2) : val || ''}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          handleFieldChange(field.key, parsed);
                        } catch {
                          handleFieldChange(field.key, e.target.value);
                        }
                      }}
                    />
                  </div>
                );

              default:
                return (
                  <Input
                    key={field.key}
                    label={field.name}
                    value={val || ''}
                    onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  />
                );
            }
          })}
        </div>
      </div>
    </Dialog>
  );
};
