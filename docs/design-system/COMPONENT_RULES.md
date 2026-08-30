# Nirmaanify Component Rules & Standards

## Golden Rules for All `@nirmaanify/ui` Components

1. **Accessibility First:**
   - Must support full keyboard navigation (`Tab`, `Space`, `Enter`, `Esc`, Arrows).
   - Must have accessible focus rings (`focus-visible:ring-2 focus-visible:ring-[#635BFF]`).
   - Must include proper ARIA attributes (`aria-expanded`, `aria-label`, `aria-checked`).

2. **Dual Theme Support:**
   - Every component MUST look intentional and high-contrast in both **Dark Mode** (default) and **Light Mode**.
   - Use semantic theme tokens (`bg-white dark:bg-[#0F111A]`, `text-slate-900 dark:text-slate-100`).

3. **Mandatory State Support:**
   - **Default State**
   - **Hover / Active State** (`active:scale-[0.98]`)
   - **Focus State**
   - **Disabled State** (`disabled:opacity-50 disabled:pointer-events-none`)
   - **Loading State** (where applicable, with spinners or skeleton waves)

4. **Zero Random Inline Styles:**
   - All styling must originate from design tokens or Tailwind utility classes connected to `@nirmaanify/design-tokens`.
