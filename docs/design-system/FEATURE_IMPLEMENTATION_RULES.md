# Feature Implementation Rules

When adding a new feature to Nirmaanify AI:

1. **Verify Token Compliance:** Check that colors, fonts, and spacing reference `@nirmaanify/design-tokens`.
2. **Reuse Core Primitives:** Check if a component already exists in `@nirmaanify/ui` before creating new ones.
3. **Responsive Breakpoints:** Ensure the layout gracefully degrades on mobile (`<768px`), tablet (`768-1024px`), and desktop (`>1024px`).
4. **Dark/Light Mode Contrast:** Verify text contrast ratios satisfy WCAG 2.1 AA standard (4.5:1 for normal text, 3:1 for large text).
