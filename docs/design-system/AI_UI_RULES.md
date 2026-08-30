# Critical Rules for AI Agents (AI_UI_RULES.md)

## ⚠️ MANDATORY RULE: Design Context Verification

Before generating or modifying any UI code, every AI agent MUST first resolve:

```typescript
type DesignContext = 'platform' | 'project';
```

### Scenario 1: `designContext === 'platform'`
When building internal Nirmaanify features (Studio UI, Dashboard, CMS Manager, Settings, AI panels):
- **MUST** use `@nirmaanify/ui` components and `@nirmaanify/design-tokens`.
- **MUST** use Nirmaan Indigo (`#635BFF`), AI Violet (`#8B5CF6`), and Launch Cyan (`#22D3EE`).
- **NEVER** introduce arbitrary color hex codes or third-party themes.

### Scenario 2: `designContext === 'project'`
When generating user websites or custom end-user projects:
- **MUST** use user-configured theme preferences, custom fonts, selected UI library (e.g., shadcn, MUI, Chakra), and selected animation library (e.g., Framer Motion, GSAP).
- **NEVER** force Nirmaanify platform internal branding onto user creations unless explicitly requested.
