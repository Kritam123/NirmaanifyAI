# Nirmaanify Design System v1.0

> **Strict Governance Standard for the Nirmaanify AI Platform**

---

## 1. Architectural Rule: Context Separation

Nirmaanify AI strictly separates two design environments:

```text
┌─────────────────────────────────────────────────────────────┐
│                    NIRMAANIFY PLATFORM                      │
│   (Dashboard, Studio, CMS, Backend, DB, AI Assistant)       │
│               STRICT DESIGN SYSTEM ENFORCED                 │
└─────────────────────────────────────────────────────────────┘
                              ≠
┌─────────────────────────────────────────────────────────────┐
│                     USER PROJECT                            │
│           (Generated Web App, Custom Frontend)              │
│               TOTAL CREATIVE USER FREEDOM                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Brand Palette

| Role | Color Name | Hex Code | Token |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | Nirmaan Indigo | `#635BFF` | `brandColors.nirmaanIndigo[500]` |
| **Primary Action** | Build Blue | `#3B82F6` | `brandColors.buildBlue[500]` |
| **AI Intelligence** | AI Violet | `#8B5CF6` | `brandColors.aiViolet[500]` |
| **Launch Accent** | Launch Cyan | `#22D3EE` | `brandColors.launchCyan[400]` |

### Surface Tokens (Dark Mode Default)

- **Canvas Background:** `#090A0F`
- **Surface Layer 1:** `#0F111A`
- **Surface Layer 2:** `#161926`
- **Surface Elevated:** `#1E2337`
- **Border Default:** `#24293D`
- **Text Primary:** `#F8FAFC`
- **Text Secondary:** `#94A3B8`
- **Text Muted:** `#64748B`

---

## 3. Typography Hierarchy

- **Display & UI Font:** `Poppins` (Modern geometric sans-serif for headings, badges, and platform UI)
- **Code & Tokens:** `Geist Mono` (Monospaced font for JSON schema, code generation, and key shortcuts)

---

## 4. Spacing System

4px baseline grid:
- `4px` (`0.25rem` / `space-1`)
- `8px` (`0.5rem` / `space-2`)
- `12px` (`0.75rem` / `space-3`)
- `16px` (`1.0rem` / `space-4`)
- `24px` (`1.5rem` / `space-6`)
- `32px` (`2.0rem` / `space-8`)
- `48px` (`3.0rem` / `space-12`)
- `64px` (`4.0rem` / `space-16`)
