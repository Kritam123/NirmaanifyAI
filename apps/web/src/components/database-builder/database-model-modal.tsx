'use client';

import React, { useState, useEffect } from 'react';
import {
  DataModel,
  DataModelField,
  DataModelFieldType,
  DataModelRelationType,
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
  Database,
  ArrowUp,
  ArrowDown,
  Key,
  Link2,
} from 'lucide-react';

interface DatabaseModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (model: DataModel) => Promise<void>;
  initialModel?: DataModel | null;
  existingModels?: DataModel[];
}

const FIELD_TYPES: { label: string; value: DataModelFieldType }[] = [
  { label: 'String (Text / UUID)', value: 'String' },
  { label: 'Int (Integer 32/64)', value: 'Int' },
  { label: 'Float (Decimal / Price)', value: 'Float' },
  { label: 'Boolean (True / False)', value: 'Boolean' },
  { label: 'DateTime (Timestamp)', value: 'DateTime' },
  { label: 'Enum (Custom Options)', value: 'Enum' },
  { label: 'Json (Key-Value Document)', value: 'Json' },
  { label: 'Relation (Linked Table)', value: 'Relation' },
];

export function DatabaseModelModal({
  isOpen,
  onClose,
  onSave,
  initialModel,
  existingModels = [],
}: DatabaseModelModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [pluralName, setPluralName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<DataModelField[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialModel) {
      setName(initialModel.name);
      setPluralName(initialModel.pluralName);
      setDescription(initialModel.description || '');
      setFields(initialModel.fields || []);
    } else {
      setName('');
      setPluralName('');
      setDescription('');
      setFields([
        { id: `f-${Date.now()}-1`, name: 'id', type: 'String', isId: true, isUnique: true, defaultValue: 'uuid()' },
        { id: `f-${Date.now()}-2`, name: 'title', type: 'String', isNullable: false },
        { id: `f-${Date.now()}-3`, name: 'createdAt', type: 'DateTime', defaultValue: 'now()' },
      ]);
    }
  }, [initialModel, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialModel) {
      setPluralName(val.endsWith('s') ? val : `${val}s`);
    }
  };

  const handleAddField = () => {
    const newField: DataModelField = {
      id: `f-${Date.now()}`,
      name: `field_${fields.length + 1}`,
      type: 'String',
      isNullable: true,
    };
    setFields([...fields, newField]);
  };

  const handleUpdateField = (index: number, updates: Partial<DataModelField>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };
    setFields(updated);
  };

  const handleDeleteField = (index: number) => {
    if (fields.length <= 1) {
      toast({ title: 'Schema Error', description: 'A table must contain at least 1 field.', type: 'error' });
      return;
    }
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: 'Validation Error', description: 'Model Name is required.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        id: initialModel ? initialModel.id : `model-${name.toLowerCase()}-${Date.now().toString(36)}`,
        name: name.trim(),
        pluralName: pluralName.trim() || `${name}s`,
        description: description.trim(),
        fields,
      });
      onClose();
      toast({
        title: initialModel ? 'Model Updated' : 'Model Created',
        description: `Saved "${name}" with ${fields.length} database columns.`,
        type: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Error Saving Model',
        description: err.message || 'Could not save data model.',
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
      title={initialModel ? `Edit Data Model: ${initialModel.name}` : 'Create Relational Data Model'}
      description="Design PostgreSQL table schema with typed columns, primary keys, and foreign relations."
      className="max-w-4xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit} isLoading={isSubmitting}>
            {initialModel ? 'Save Changes' : 'Create Model'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Model Name (PascalCase Singular)"
            placeholder="e.g. Customer, OrderItem"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <Input
            label="Plural Name (API Resource URI)"
            placeholder="e.g. Customers, OrderItems"
            value={pluralName}
            onChange={(e) => setPluralName(e.target.value)}
          />
        </div>

        <Textarea
          label="Description"
          placeholder="Purpose and entity relationships for this table..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Columns Builder Table */}
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-[#24293D]">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Database Columns ({fields.length})</h4>
              <p className="text-[11px] text-slate-400">Configure PostgreSQL columns, types, and constraints.</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={handleAddField}
            >
              Add Column
            </Button>
          </div>

          <div className="border border-slate-200 dark:border-[#24293D] rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-[#24293D]">
            {fields.map((field, idx) => (
              <div key={field.id} className="p-3 bg-white dark:bg-[#161926] flex flex-wrap sm:flex-nowrap items-center gap-3 text-xs">
                {/* Column Name */}
                <div className="flex-1 min-w-[130px]">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Column Name</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => handleUpdateField(idx, { name: e.target.value })}
                    placeholder="column_name"
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] font-mono text-xs font-semibold"
                  />
                </div>

                {/* Column Type */}
                <div className="w-40 shrink-0">
                  <label className="text-[10px] text-slate-400 block mb-0.5">Data Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => handleUpdateField(idx, { type: e.target.value as DataModelFieldType })}
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] text-xs"
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Relation Target (If Relation) */}
                {field.type === 'Relation' && (
                  <div className="w-36 shrink-0">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Target Table</label>
                    <select
                      value={field.relationTarget || ''}
                      onChange={(e) => handleUpdateField(idx, { relationTarget: e.target.value })}
                      className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#0E121E] border border-slate-200 dark:border-[#24293D] text-xs"
                    >
                      <option value="">Select target...</option>
                      {existingModels.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Constraints: PK, Unique, Nullable */}
                <div className="flex items-center gap-3 pt-3 shrink-0">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(field.isId)}
                      onChange={(e) => handleUpdateField(idx, { isId: e.target.checked })}
                      className="h-3.5 w-3.5 text-[#635BFF] rounded"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">PK</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(field.isUnique)}
                      onChange={(e) => handleUpdateField(idx, { isUnique: e.target.checked })}
                      className="h-3.5 w-3.5 text-[#635BFF] rounded"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">Unique</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(field.isNullable)}
                      onChange={(e) => handleUpdateField(idx, { isNullable: e.target.checked })}
                      className="h-3.5 w-3.5 text-[#635BFF] rounded"
                    />
                    <span className="text-[10px] text-slate-500 font-mono">Nullable</span>
                  </label>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteField(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/10 shrink-0 mt-3"
                  title="Remove column"
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
