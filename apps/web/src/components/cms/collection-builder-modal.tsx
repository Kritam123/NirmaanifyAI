'use client';

import React, { useState, useEffect } from 'react';
import {
  CmsCollection,
  CmsFieldDefinition,
  CmsFieldType,
  CreateCollectionDto,
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
  Plus,
  Trash2,
  Layers,
  Sparkles,
  ArrowUp,
  ArrowDown,
  FileText,
  ShoppingBag,
  Tag,
  Users,
} from 'lucide-react';

interface CollectionBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreateCollectionDto) => Promise<void>;
  initialCollection?: CmsCollection | null;
  templates?: { id: string; name: string; slug: string; description: string; fields: CmsFieldDefinition[] }[];
}

const FIELD_TYPES: { label: string; value: CmsFieldType }[] = [
  { label: 'Short Text (String)', value: 'TEXT' },
  { label: 'Rich Text (Article Body / HTML)', value: 'RICH_TEXT' },
  { label: 'Number (Price, Integer, Decimal)', value: 'NUMBER' },
  { label: 'Boolean (Switch / Flag)', value: 'BOOLEAN' },
  { label: 'Date / Timestamp', value: 'DATE' },
  { label: 'Image URL (Media)', value: 'IMAGE' },
  { label: 'File URL (Document / PDF)', value: 'FILE' },
  { label: 'Select (Dropdown Options)', value: 'SELECT' },
  { label: 'Relation (Linked Collection)', value: 'RELATION' },
  { label: 'Custom JSON (Key-Value AST)', value: 'JSON' },
];

export function CollectionBuilderModal({
  isOpen,
  onClose,
  onSave,
  initialCollection,
  templates = [],
}: CollectionBuilderModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Folder');
  const [fields, setFields] = useState<CmsFieldDefinition[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial state
  useEffect(() => {
    if (initialCollection) {
      setName(initialCollection.name);
      setSlug(initialCollection.slug);
      setDescription(initialCollection.description || '');
      setIcon(initialCollection.icon || 'Folder');
      setFields(initialCollection.fields || []);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIcon('Folder');
      setFields([
        { id: `f-${Date.now()}-1`, name: 'Title / Headline', key: 'title', type: 'TEXT', required: true, helpText: 'Primary identifier' },
        { id: `f-${Date.now()}-2`, name: 'URL Slug', key: 'slug', type: 'TEXT', required: true, helpText: 'Unique route slug' },
      ]);
    }
  }, [initialCollection, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialCollection) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
  };

  const handleAddField = () => {
    const newField: CmsFieldDefinition = {
      id: `f-${Date.now()}`,
      name: 'New Field',
      key: `field_${fields.length + 1}`,
      type: 'TEXT',
      required: false,
      helpText: '',
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<CmsFieldDefinition>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const handleDeleteField = (index: number) => {
    if (fields.length <= 1) {
      toast({ title: 'Schema Error', description: 'A collection must contain at least 1 field.', type: 'error' });
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleMoveField = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const copy = [...fields];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setFields(copy);
  };

  const handleApplyTemplate = (tmpl: any) => {
    setName(tmpl.name);
    setSlug(tmpl.slug);
    setDescription(tmpl.description);
    setFields(tmpl.fields);
    toast({ title: 'Template Loaded', description: `Populated schema from ${tmpl.name}`, type: 'info' });
  };

  const handleSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      toast({ title: 'Validation Error', description: 'Collection Name and Slug are required.', type: 'error' });
      return;
    }

    if (fields.length === 0) {
      toast({ title: 'Validation Error', description: 'Add at least one field to this schema.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        icon,
        fields,
      });
      onClose();
      toast({
        title: initialCollection ? 'Collection Updated' : 'Collection Created',
        description: `Saved "${name}" schema with ${fields.length} fields.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Error Saving Collection',
        description: err.message || 'Could not save collection.',
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
      title={initialCollection ? `Edit Collection Schema: ${initialCollection.name}` : 'Create CMS Collection Schema'}
      description="Define declarative content structures, validation constraints, and field types."
      className="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} isLoading={isSubmitting}>
            {initialCollection ? 'Save Changes' : 'Create Collection'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Quick Starter Templates */}
        {!initialCollection && templates.length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#635BFF]" />
              Quick Starter Blueprint Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {templates.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="p-2.5 rounded-lg bg-white dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] hover:border-[#635BFF] text-left transition-all group"
                >
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-[#635BFF]">
                    {tmpl.name}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{tmpl.fields.length} fields</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collection General Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Collection Name"
            placeholder="e.g. Blog Articles, Storefront Items"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <Input
            label="Collection Slug (API Endpoint Key)"
            placeholder="e.g. blog-articles, products"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>

        <Textarea
          label="Description"
          placeholder="Brief description of this collection content type..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Fields Schema Builder Table */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-[#24293D]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Collection Fields ({fields.length})</h4>
              <p className="text-[11px] text-slate-400">Configure typed attributes and validation rules.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={handleAddField}
            >
              Add Field
            </Button>
          </div>

          <div className="border border-slate-200 dark:border-[#24293D] rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-[#24293D]">
            {fields.map((field, idx) => (
              <div key={field.id} className="p-3 bg-white dark:bg-[#161926] flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                  <button
                    type="button"
                    onClick={() => handleMoveField(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-[#24293D] rounded disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveField(idx, 'down')}
                    disabled={idx === fields.length - 1}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-[#24293D] rounded disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>

                {/* Field Label */}
                <div className="flex-1 min-w-[120px]">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Label</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      handleUpdateField(idx, {
                        name: newName,
                        key: newName.toLowerCase().replace(/[^a-z0-9_]+/g, '_'),
                      });
                    }}
                    placeholder="Field Name"
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] text-xs font-semibold"
                  />
                </div>

                {/* Field Key */}
                <div className="w-32 shrink-0">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Key</label>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => handleUpdateField(idx, { key: e.target.value })}
                    placeholder="field_key"
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] text-xs font-mono text-slate-500"
                  />
                </div>

                {/* Field Type */}
                <div className="w-44 shrink-0">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => handleUpdateField(idx, { type: e.target.value as CmsFieldType })}
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] text-xs"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Required Toggle */}
                <div className="flex items-center gap-1.5 pt-3 shrink-0">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                    className="h-3.5 w-3.5 text-[#635BFF] rounded"
                  />
                  <span className="text-[11px] text-slate-500">Required</span>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteField(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/10 shrink-0 mt-3"
                  title="Remove field"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
