# Plan: PRD-WEB-06 — UX, Design System & Layouts

## 1. Context & Goal
Establish a shared Design System and UI Kit to ensure consistency, accessibility, and responsiveness across the Seedfy Web platform (Landing + Web App).

**Key Objectives:**
- Centralize UI components in `packages/ui`.
- Implement responsive layouts (Marketing vs. App).
- Ensure Accessibility (A11y) compliance.
- Modernize stack (React 19 + Tailwind CSS v4).

## 2. Technical Architecture

### Stack
- **Framework**: React 19 (Server Components compatible).
- **Styling**: Tailwind CSS v4.
- **Icons**: Lucide React.
- **Primitives**: Radix UI (for accessible interactive components like Dialogs, Popovers).
- **Package**: `@seedfy/ui` (workspace package).

### Strategy
1.  **Tailwind v4 Adoption**: Align `packages/ui` with `apps/web` to use Tailwind v4. Components in `ui` will ship uncompiled source (TSX) and rely on the consumer application (`apps/web`) to process CSS.
2.  **Shadcn/ui Compatibility**: Adopt shadcn/ui patterns for component architecture (Headless UI + Tailwind).
3.  **CSS Variables**: Define design tokens (colors, radius) in `apps/web/src/app/globals.css` that `packages/ui` components will reference.

## 3. Design Tokens (Theming)

We will define the following semantic tokens in CSS variables:

- **Colors**:
    - `background` / `foreground`
    - `primary` / `primary-foreground` (Brand color)
    - `secondary` / `secondary-foreground`
    - `muted` / `muted-foreground`
    - `accent` / `accent-foreground`
    - `destructive` / `destructive-foreground`
    - `border`, `input`, `ring`
- **Radius**: `radius` (sm, md, lg)

## 4. Scope of Work

### Phase 1: Foundation & Infrastructure
- [ ] Upgrade `packages/ui` dependencies (React 19, Tailwind 4).
- [ ] Configure `apps/web` globals for theming.
- [ ] Install `class-variance-authority` (cva), `clsx`, `tailwind-merge` in `packages/ui`.

### Phase 2: Core Components (Atoms)
Create reusable components in `packages/ui`:
- [ ] **Button**: Variants (default, outline, ghost, link, destructive).
- [ ] **Input / Textarea**: Form controls with focus states.
- [ ] **Label**: A11y compliant label.
- [ ] **Card**: Container with Header, Title, Content, Footer.
- [ ] **Skeleton**: Loading states.
- [ ] **Badge**: Status indicators.
- [ ] **Avatar**: User profile images.

### Phase 3: Interactive Components (Molecules)
- [ ] **Dialog / Modal**: Using Radix UI Dialog.
- [ ] **Sheet**: For Mobile Sidebar / Drawer.
- [ ] **DropdownMenu**: For user actions.
- [ ] **Toast**: Notification system (using `sonner` as present in deps).

### Phase 4: Layouts (Organisms)
Implement in `apps/web` (using `ui` components):
- [ ] **AppShell**:
    - Desktop: Fixed Sidebar (Collapsible).
    - Mobile: Topbar + Drawer (Sheet) or Bottom Nav.
- [ ] **LandingShell**:
    - Responsive Navbar (Hamburger menu on mobile).
    - Footer.

## 5. Implementation Plan

1.  **Setup**: Align `packages/ui` package.json.
2.  **Tokens**: Write CSS variables in `apps/web/src/app/globals.css`.
3.  **Utils**: Ensure `cn` utility is robust.
4.  **Components**: Implement Button, Input, Card, Sheet.
5.  **Refactor**: Update existing layouts in `apps/web` to use the new system.

## 6. Verification
- Verify responsiveness on Desktop, Tablet, Mobile.
- Check A11y (keyboard navigation, screen reader support).
- Validate "Dark Mode" readiness (even if not active, tokens should support it).
