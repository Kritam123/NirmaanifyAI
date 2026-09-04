'use client';

import React, { useState } from 'react';
import {
  CmsCollectionDto,
  CmsCollectionType,
  CmsFieldDto,
  CmsFieldType,
  CreateCmsCollectionDto,
  CreateCmsFieldDto,
} from '@nirmaanify/types';
import {
  Dialog,
  Button,
  Input,
  Select,
  Switch,
  Card,
  Badge,
  useToast,
} from '@nirmaanify/ui';
import {
  Plus,
  Trash2,
  Database,
  Type,
  FileText,
  Hash,
  ToggleLeft,
  Calendar,
  Image as ImageIcon,
  FileUp,
  List,
  Link2,
  Code,
  Layers,
  Settings,
} from 'lucide-react';

const FIELD_TYPE_OPTIONS: Array<{
  value: CmsFieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { value: 'TEXT', label: 'Text (Single Line)', icon: Type, description: 'Titles, slugs, labels, and names' },
  { value: 'RICH_TEXT', label: 'Rich Text / Markdown', icon: FileText, description: 'Formatted article content & HTML' },
  { value: 'NUMBER', label: 'Number', icon: Hash, description: 'Prices, inventory, ratings, quantities' },
  { value: 'BOOLEAN', label: 'Boolean', icon: ToggleLeft, description: 'True/False toggles and flags' },
  { value: 'DATE', label: 'Date & Time', icon: Calendar, description: 'Timestamps, deadlines, events' },
  { value: 'IMAGE', label: 'Image URL', icon: ImageIcon, description: 'Hero banners, avatars, thumbnails' },
  { value: 'FILE', label: 'File URL', icon: FileUp, description: 'PDFs, downloadable documents, zip archives' },
  { value: 'SELECT', label: 'Dropdown / Select', icon: List, description: 'Predefined tags, categories, statuses' },
  { value: 'RELATION', label: 'Relation Link', icon: Link2, description: 'Link to Posts, Authors, or Categories' },
  { value: 'JSON', label: 'Raw JSON Data', icon: Code, description: 'Structured metadata, configs, specs' },
];

interface CmsCollectionBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingCollection?: CmsCollectionDto | null;
  existingCollections?: CmsCollectionDto[];
  onSaveCollection: (dto: CreateCmsCollectionDto) => Promise<any>;
  onAddField?: (collectionId: string, dto: CreateCmsFieldDto) => Promise<any>;
  onDeleteField?: (collectionId: string, fieldId: string) => Promise<any>;
}

export const CmsCollectionBuilderDialog: React.FC<CmsCollectionBuilderDialogProps> = ({
  isOpen,
  onClose,
  existingCollection,
  existingCollections = [],
  onSaveCollection,
  onAddField,
  onDeleteField,
}) => {
  const { toast } = useToast();

  const [name, setName] = useState(existingCollection?.name || '');
  const [slug, setSlug] = useState(existingCollection?.slug || '');
  const [description, setDescription] = useState(existingCollection?.description || '');
  const [type, setType] = useState<CmsCollectionType>(existingCollection?.type || 'CUSTOM');

  // New field draft state
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldType, setNewFieldType] = useState<CmsFieldType>('TEXT');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldDefault, setNewFieldDefault] = useState('');
  const [newFieldRelationTarget, setNewFieldRelationTarget] = useState('');
  const [newFieldSelectOptions, setNewFieldSelectOptions] = useState('');
  const [newFieldMin, setNewFieldMin] = useState<string>('');
  const [newFieldMax, setNewFieldMax] = useState<string>('');

  // Local draft fields for new collection creation
  const [draftFields, setDraftFields] = useState<CreateCmsFieldDto[]>(
    existingCollection?.fields || [
      { name: 'Title', key: 'title', type: 'TEXT', required: true, order: 0 },
      { name: 'Slug', key: 'slug', type: 'TEXT', required: true, order: 1 },
    ]
  );

  const resetFieldForm = () => {
    setNewFieldName('');
    setNewFieldKey('');
    setNewFieldType('TEXT');
    setNewFieldRequired(false);
    setNewFieldDefault('');
    setNewFieldRelationTarget('');
    setNewFieldSelectOptions('');
    setNewFieldMin('');
    setNewFieldMax('');
    setIsAddingField(false);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!existingCollection) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleFieldNameChange = (val: string) => {
    setNewFieldName(val);
    setNewFieldKey(
      val
        .trim()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, (chr) => chr.toLowerCase())
    );
  };

  const handleAppendField = async () => {
    if (!newFieldName.trim()) {
      toast({ title: 'Validation Error', description: 'Field Name is required', type: 'error' });
      return;
    }

    const key =
      newFieldKey.trim() ||
      newFieldName
        .trim()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[A-Z]/, (chr) => chr.toLowerCase());

    const validation: any = {};
    if (newFieldMin) validation.min = Number(newFieldMin);
    if (newFieldMax) validation.max = Number(newFieldMax);
    if (newFieldType === 'RELATION' && newFieldRelationTarget) {
      validation.targetCollectionSlug = newFieldRelationTarget;
    }
    if (newFieldType === 'SELECT' && newFieldSelectOptions) {
      validation.options = newFieldSelectOptions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => ({ label: s, value: s.toLowerCase().replace(/\s+/g, '-') }));
    }

    const fieldDto: CreateCmsFieldDto = {
      name: newFieldName.trim(),
      key,
      type: newFieldType,
      required: newFieldRequired,
      defaultValue: newFieldDefault ? newFieldDefault : undefined,
      validation,
      order: draftFields.length,
    };

    if (existingCollection && onAddField) {
      await onAddField(existingCollection.id, fieldDto);
    } else {
      setDraftFields([...draftFields, fieldDto]);
    }

    resetFieldForm();
  };

  const handleRemoveField = async (indexOrId: number | string) => {
    if (existingCollection && onDeleteField && typeof indexOrId === 'string') {
      await onDeleteField(existingCollection.id, indexOrId);
    } else if (typeof indexOrId === 'number') {
      setDraftFields(draftFields.filter((_, idx) => idx !== indexOrId));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: 'Validation Error', description: 'Collection name is required', type: 'error' });
      return;
    }

    await onSaveCollection({
      name: name.trim(),
      slug: slug.trim() || undefined,
      description: description.trim() || undefined,
      type,
      fields: draftFields,
    });

    onClose();
  };

  const renderFieldIcon = (fieldType: CmsFieldType) => {
    const item = FIELD_TYPE_OPTIONS.find((f) => f.value === fieldType);
    const Icon = item ? item.icon : Type;
    return <Icon className="h-3.5 w-3.5 text-[#635BFF]" />;
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={existingCollection ? `Collection Settings: ${existingCollection.name}` : 'New Collection'}
      description={existingCollection ? 'Update collection details and manage fields.' : 'Create a new collection to structure your content.'}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            {existingCollection ? 'Save Changes' : 'Create Collection'}
          </Button>
        </>
      }
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Collection General Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Collection Name *"
            placeholder="e.g. Case Studies"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <Input
            label="Slug (URL identifier) *"
            placeholder="e.g. case-studies"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            disabled={Boolean(existingCollection)}
          />
        </div>

        <Input
          label="Description"
          placeholder="Brief summary of what this collection contains..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Schema Fields Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-[#635BFF]" />
                <span>Fields ({existingCollection ? existingCollection.fields.length : draftFields.length})</span>
              </h4>
              <p className="text-xs text-slate-500">Define what information each entry stores (e.g. Title, Cover Image, Content).</p>
            </div>
            {!isAddingField && (
              <Button
                variant="outline"
                size="xs"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => setIsAddingField(true)}
              >
                Add Field
              </Button>
            )}
          </div>

          {/* List of current fields */}
          <div className="space-y-2">
            {(existingCollection ? existingCollection.fields : draftFields).map((field, idx) => (
              <div
                key={field.key || idx}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[#24293D] bg-slate-50 dark:bg-[#161926] text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#0F111A] border border-slate-200 dark:border-slate-800">
                    {renderFieldIcon(field.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{field.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">({field.key})</span>
                      {field.required && (
                        <Badge variant="warning" size="sm">Required</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Type: {field.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => handleRemoveField((field as any).id || idx)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Field Inline Card */}
          {isAddingField && (
            <Card className="p-4 border-2 border-[#635BFF]/30 bg-white dark:bg-[#12141F] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h5 className="text-xs font-bold text-[#635BFF] dark:text-[#A5AEFD] uppercase tracking-wider">
                  New Schema Field
                </h5>
                <Button variant="ghost" size="xs" onClick={resetFieldForm}>
                  Cancel
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Field Name *"
                  placeholder="e.g. Featured Image"
                  value={newFieldName}
                  onChange={(e) => handleFieldNameChange(e.target.value)}
                />
                <Input
                  label="Field Key (API identifier) *"
                  placeholder="e.g. featuredImage"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Field Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {FIELD_TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = newFieldType === opt.value;
                    return (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => setNewFieldType(opt.value)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all ${
                          isSelected
                            ? 'border-[#635BFF] bg-[#635BFF]/5 ring-1 ring-[#635BFF]'
                            : 'border-slate-200 dark:border-[#24293D] hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-[#635BFF]' : 'text-slate-400'}`} />
                          {isSelected && <Badge variant="indigo" size="sm">Active</Badge>}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                          {opt.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Field Settings based on Type */}
              {newFieldType === 'RELATION' && (
                <Input
                  label="Relation Target Collection Slug"
                  placeholder="e.g. authors, categories"
                  value={newFieldRelationTarget}
                  onChange={(e) => setNewFieldRelationTarget(e.target.value)}
                />
              )}

              {newFieldType === 'SELECT' && (
                <Input
                  label="Select Options (Comma-separated)"
                  placeholder="Option 1, Option 2, Option 3"
                  value={newFieldSelectOptions}
                  onChange={(e) => setNewFieldSelectOptions(e.target.value)}
                />
              )}

              {newFieldType === 'NUMBER' && (
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Min Value"
                    type="number"
                    value={newFieldMin}
                    onChange={(e) => setNewFieldMin(e.target.value)}
                  />
                  <Input
                    label="Max Value"
                    type="number"
                    value={newFieldMax}
                    onChange={(e) => setNewFieldMax(e.target.value)}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Input
                  label="Default Value"
                  placeholder="Optional default..."
                  value={newFieldDefault}
                  onChange={(e) => setNewFieldDefault(e.target.value)}
                />
                <div className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-800 self-end">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Required Field</span>
                  <Switch
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="xs" variant="default" onClick={handleAppendField}>
                  Add to Schema
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Dialog>
  );
};
