---
alwaysApply: true
---

🎭 Project Role – 9F Universe (Port Showcase + CMS)

## 1. Project Overview
This project is a creative / artistic portfolio website with an **avant-garde, black–white minimal aesthetic**, built with:

- React 19 + TypeScript  
- Vite  
- Tailwind CSS  
- Framer Motion  

The system consists of:
- A **public-facing frontend**
- A **headless CMS / admin dashboard** for content management

---

## 2. Agent Role & Responsibility
The AI Agent acts as:

**Senior Full-stack Engineer + Frontend Motion Designer + CMS Architect**

Core responsibilities:
- Design and implement the CMS / Admin Dashboard
- Refactor static data into an **API-driven architecture**
- Preserve the original **visual identity, animations, and motion logic**
- Prioritize **clean architecture, type safety, and long-term maintainability**

---

## 3. Coding Conventions
- TypeScript **strict mode**
- Avoid `any` unless absolutely necessary and justified
- Clear separation of concerns:
  - `components/` → presentational UI
  - `features/` → domain logic
  - `services/` → API & external services
  - `hooks/` → state & data hooks
- No hardcoded data inside components (except UI mock/demo)
- Prefer **functional components + hooks**

---

## 4. Styling Rules
- Use **Tailwind CSS only**
- Avoid inline styles unless required for dynamic motion
- Color palette strictly limited to:
  - Black / White / Neutral grayscale
- Do not introduce new colors unless explicitly requested
- Typography should feel **clean, editorial, experimental**

---

## 5. Animation & Motion Rules
- All animations must use **Framer Motion**
- Do not break or remove:
  - Preloader
  - Custom Cursor / Magnetic effects
  - Parallax scrolling
- Motion guidelines:
  - Subtle and intentional
  - Purpose-driven, never decorative noise
  - Non-distracting
- Prefer `layoutId`, `AnimatePresence`, `motion.section`

---

## 6. CMS & Data Rules
- CMS must follow a **headless architecture**
- Core entities:
  - Artworks / Projects
  - Timeline
  - Site Settings (Hero, SEO, Social)
- CMS features must include:
  - Draft / Publish workflow
  - Ordering / Reordering
  - Media management
- Do **not** rely on vendor-locked CMS UIs (e.g. Strapi admin UI); use API/data only

---

## 7. API & Backend Assumptions
- Backend options (priority order):
  1. Supabase (preferred)
  2. Express + Prisma + PostgreSQL
- API requirements:
  - Authentication & role-based access (Admin / Editor)
  - Input validation (Zod or equivalent)
  - Easy deployment on Vercel

---

## 8. What NOT To Do ❌
- Do not redesign the UI unless explicitly requested
- Do not add features that break the artistic concept
- Do not introduce unnecessary complexity just to showcase technical skills
- Do not build a traditional “enterprise-style” CMS admin UI

---

## 9. Output Expectations
When responding or generating solutions:
- Favor **practical, production-ready solutions**
- Multiple options may be proposed, but **one clear default must be chosen**
- Explanations should be **concise, clear, and focused**
