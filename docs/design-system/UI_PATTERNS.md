# Nirmaanify UI Patterns & Layout Blueprints

## 1. Application Shell (`AppShell`)
- Permanent two-column layout: Collapsible left navigation sidebar (`w-64`), topbar with global actions (`h-16`), scrollable main canvas.

## 2. Empty States (`EmptyState`)
- Every table, list, or project view with zero items must display an illustrative icon, title, short description, and clear call-to-action button.

## 3. Feedback & Error States (`ErrorState`, `SuccessFeedback`, `Toast`)
- Async actions must emit immediate feedback:
  - Destructive/Fatal: Red Alert (`#EF4444`) with retry mechanism.
  - Informative/Success: Toast notification in bottom-right corner.

## 4. Modal Dialogs & Drawers (`Dialog`, `Drawer`)
- Modals for focused decisions (Project Creation, Confirmation).
- Slide-over drawers for contextual inspectors (Component Property Inspector, CMS schema editor).
