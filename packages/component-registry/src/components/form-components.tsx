import React from 'react';
import { z } from 'zod';
import { ComponentDefinition } from '../types';
import { Input, Textarea, Select, Checkbox, Switch, Button } from '@nirmaanify/ui';

// ==========================================
// 1. FORM CONTAINER
// ==========================================
export const FormDefinition: ComponentDefinition<{
  title: string;
  submitButtonText: string;
}> = {
  id: 'form',
  name: 'Form Container',
  category: 'forms',
  description: 'Interactive form container with inputs and submit action.',
  icon: 'FormInput',
  allowedChildren: true,
  defaultProps: {
    title: 'Contact Form',
    submitButtonText: 'Submit Inquiry',
  },
  propsSchema: z.object({
    title: z.string().default('Contact Form'),
    submitButtonText: z.string().default('Submit Inquiry'),
  }),
  inspectorControls: [
    { name: 'title', label: 'Form Title', type: 'text', group: 'content', defaultValue: 'Contact Form' },
    { name: 'submitButtonText', label: 'Submit Button Text', type: 'text', group: 'content', defaultValue: 'Submit Inquiry' },
  ],
  component: ({ title, submitButtonText, children, style }) => {
    return (
      <form
        onSubmit={(e) => e.preventDefault()}
        style={style}
        className="p-6 rounded-2xl bg-white dark:bg-[#161926] border border-slate-200 dark:border-[#24293D] shadow-sm space-y-4 max-w-md w-full"
      >
        {title && <h4 className="font-bold text-base text-slate-900 dark:text-white">{title}</h4>}
        <div className="space-y-3">{children}</div>
        {submitButtonText && (
          <Button variant="default" className="w-full mt-2">
            {submitButtonText}
          </Button>
        )}
      </form>
    );
  },
};

// ==========================================
// 2. INPUT FIELD
// ==========================================
export const InputDefinition: ComponentDefinition<{
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'password' | 'number';
  helperText?: string;
}> = {
  id: 'input',
  name: 'Input Field',
  category: 'forms',
  description: 'Single-line input with label and helper text.',
  icon: 'TextCursorInput',
  allowedChildren: false,
  defaultProps: {
    label: 'Email Address',
    placeholder: 'alex@company.com',
    type: 'email',
    helperText: 'We will never share your email.',
  },
  propsSchema: z.object({
    label: z.string().default('Email Address'),
    placeholder: z.string().default('alex@company.com'),
    type: z.enum(['text', 'email', 'password', 'number']).default('text'),
    helperText: z.string().optional(),
  }),
  inspectorControls: [
    { name: 'label', label: 'Field Label', type: 'text', group: 'content', defaultValue: 'Email Address' },
    { name: 'placeholder', label: 'Placeholder', type: 'text', group: 'content', defaultValue: 'alex@company.com' },
    { name: 'helperText', label: 'Helper Text', type: 'text', group: 'content', defaultValue: '' },
  ],
  component: ({ label, placeholder, type = 'text', helperText, style }) => {
    return (
      <div style={style} className="w-full">
        <Input
          label={label}
          placeholder={placeholder}
          type={type}
          helperText={helperText}
          readOnly
        />
      </div>
    );
  },
};

// ==========================================
// 3. TEXTAREA
// ==========================================
export const TextareaDefinition: ComponentDefinition<{
  label: string;
  placeholder: string;
  rows: number;
}> = {
  id: 'textarea',
  name: 'Textarea Field',
  category: 'forms',
  description: 'Multi-line text input field for messages and descriptions.',
  icon: 'AlignLeft',
  allowedChildren: false,
  defaultProps: {
    label: 'Message',
    placeholder: 'Type your message here...',
    rows: 3,
  },
  propsSchema: z.object({
    label: z.string().default('Message'),
    placeholder: z.string().default('Type your message here...'),
    rows: z.number().default(3),
  }),
  inspectorControls: [
    { name: 'label', label: 'Field Label', type: 'text', group: 'content', defaultValue: 'Message' },
    { name: 'placeholder', label: 'Placeholder', type: 'text', group: 'content', defaultValue: 'Type your message here...' },
    { name: 'rows', label: 'Rows Count', type: 'slider', min: 2, max: 10, group: 'layout', defaultValue: 3 },
  ],
  component: ({ label, placeholder, rows = 3, style }) => {
    return (
      <div style={style} className="w-full">
        <Textarea label={label} placeholder={placeholder} rows={rows} readOnly />
      </div>
    );
  },
};
