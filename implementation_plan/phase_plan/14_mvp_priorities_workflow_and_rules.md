# 6. MVP PRIORITY LEVELS

To avoid making the project too large, features should be prioritized.

## P0 — MUST HAVE

```text
Design System
Authentication
Projects
AI Planning
Visual Builder
Component Registry
Project Schema
Preview
Export
```

---

## P1 — HIGH PRIORITY

```text
CMS
Backend Toggle
NestJS Basic Generation
Database Models
API Generation
Package Selection
```

---

## P2 — AFTER MVP

```text
Advanced Plugin Marketplace
Advanced AI Agents
GitHub Integration
Deployment Providers
Collaboration
Real-time Multiplayer
ER Diagram
Advanced Animation Editor
```

---

# 7. RECOMMENDED DAILY WORKFLOW

Every development task should follow:

```text
1. SELECT FEATURE
        ↓
2. WRITE REQUIREMENTS
        ↓
3. CHECK ARCHITECTURE
        ↓
4. CHECK DESIGN SYSTEM
        ↓
5. CHECK EXISTING COMPONENTS
        ↓
6. IMPLEMENT BACKEND
        ↓
7. IMPLEMENT FRONTEND
        ↓
8. CONNECT API
        ↓
9. TEST
        ↓
10. DOCUMENT
        ↓
11. MERGE
```

For UI work:

```text
FEATURE REQUEST
       ↓
CHECK DESIGN CONTEXT
       ↓
PLATFORM OR PROJECT?
       ↓
CHECK EXISTING PATTERNS
       ↓
REUSE COMPONENTS
       ↓
CREATE ONLY MISSING COMPONENTS
       ↓
TEST LIGHT/DARK MODE
       ↓
RESPONSIVE TEST
       ↓
ACCESSIBILITY TEST
```

---

# 8. WEEKLY DEVELOPMENT RHYTHM

A recommended workflow for each week:

## Monday

```text
Planning
Architecture
Task Breakdown
```

## Tuesday–Wednesday

```text
Main Implementation
```

## Thursday

```text
Integration
Bug Fixing
Edge Cases
```

## Friday

```text
Testing
Refactoring
Documentation
Demo
```

## Weekend or Final Day

```text
Review
Backlog Update
Next Week Planning
```

---

# 9. DEVELOPMENT RULES

## Rule 1

Do not build features directly into the main application without reusable architecture.

```text
Build System
Not One-Time Code
```

---

## Rule 2

Do not let AI generate arbitrary UI for the Nirmaanify platform.

All internal AI-generated UI must follow:

```text
Nirmaanify Design System
```

---

## Rule 3

Keep the project schema separate from generated code.

```text
PROJECT STATE
≠
GENERATED REACT CODE
```

Use:

```text
Project Schema
→ Renderer
→ Code Generator
```

---

## Rule 4

Backend is optional.

```text
Simple Website
→ Frontend Only

E-commerce
→ Frontend + Backend + Database

Blog
→ Frontend + CMS

SaaS
→ Full Stack
```

---

## Rule 5

Every generated project owns its own design context.

```text
Nirmaanify Platform
→ Fixed Design System

User Project
→ Custom Design System
```

---

# 10. FINAL MASTER PRODUCT FLOW

```text
USER
 │
 ▼
NIRMAANIFY AI
 │
 ▼
CREATE PROJECT
 │
 ▼
DESCRIBE IDEA
 │
 ▼
AI PROJECT PLANNER
 │
 ▼
ARCHITECTURE PLAN
 │
 ▼
USER APPROVAL
 │
 ▼
PROJECT GENERATION
 │
 ├──────────────────────────────┐
 ▼                              ▼
FRONTEND                       BACKEND
 │                              │
 ▼                              ▼
VISUAL STUDIO                  NESTJS
 │                              │
 ▼                              ▼
COMPONENT TREE                 MODULES
 │                              │
 ├──────────────┐               ▼
 ▼              ▼            DATABASE
CMS          PACKAGES            │
 │              │                ▼
 └──────────────┴────────────── APIs
                │
                ▼
             PLUGINS
                │
                ▼
             AI AGENTS
                │
                ▼
              PREVIEW
                │
                ▼
               BUILD
                │
        ┌───────┴────────┐
        ▼                ▼
      EXPORT           DEPLOY
```

---

# FINAL 36-WEEK OUTCOME

At the end of this roadmap, Nirmaanify AI should have a working foundation for becoming an AI-powered full-stack application builder where users can:

```text
✓ Describe an application using AI

✓ Generate a project plan

✓ Choose frontend libraries

✓ Choose animation packages

✓ Build pages visually

✓ Drag and drop components

✓ Edit component properties

✓ Create CMS collections

✓ Manage content

✓ Enable a NestJS backend

✓ Configure backend modules

✓ Create database models

✓ Generate APIs

✓ Install supported packages

✓ Install plugins

✓ Use specialized AI agents

✓ Preview applications

✓ Build projects

✓ Export source code

✓ Deploy applications
```

Most importantly, the platform itself remains visually consistent because every new internal feature follows:

```text
NIRMAANIFY DESIGN TOKENS
        ↓
NIRMAANIFY COMPONENT SYSTEM
        ↓
NIRMAANIFY UI PATTERNS
        ↓
NIRMAANIFY DESIGN GOVERNANCE
        ↓
AI AGENT DESIGN CONTEXT
        ↓
CONSISTENT PLATFORM EXPERIENCE
```

While every website or application built by a customer remains:

```text
Independent
Customizable
Brandable
Exportable
```

# Final Product Principle

> **Nirmaanify AI builds the platform with consistency and builds user projects with freedom.**
