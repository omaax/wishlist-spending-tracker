<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context

- **Framework:** Next.js 16.2 (Turbopack)
- **Styling:** Tailwind v4, shadcn v4 (`base-nova` style)
- **UI Primitives:** `@base-ui/react` v1.6 (wrapped in shadcn components under `src/components/ui/`)
- **Server State:** `@tanstack/react-query` v5
- **Storage:** IndexedDB via `idb` (in `src/lib/db.ts`)
- **Charts:** recharts v3.9.2 (internal to `src/components/ui/chart.tsx` only)
- **Types:** `src/lib/types.ts`

# Frontend Engineering Rules

## Core Principles

- Always prioritize maintainability, readability, and consistency over speed.
- Before writing new code, inspect the existing codebase for reusable components, hooks, utilities, types, and patterns.
- Match the project's existing architecture and coding style unless explicitly instructed otherwise.
- Make the smallest change necessary to solve the problem.

## Components

### Reuse First

Before creating a new component:

1. Search the project for an existing component that already solves the problem.
2. If an existing component can be extended with minimal changes, extend it instead of duplicating functionality.
3. Only create a new component when the functionality is genuinely unique.

Never duplicate UI that already exists.

### Component Size

Components should have a single responsibility.

If a component starts handling multiple unrelated concerns, split it into smaller components.

Avoid creating "god components."

### Extend, Don't Replace

When modifying existing functionality, prefer extending or composing existing components over replacing them. Do not rewrite a working component unless the task explicitly requires it or the existing implementation cannot reasonably support the new requirement.

## State Management

### Avoid Prop Drilling

Never pass props through multiple intermediate components just to reach a deeply nested child.

Instead prefer:

- Context (when state is shared within a feature)
- Feature-specific custom hooks
- TanStack Query for server state

Prop drilling is acceptable only for one or two levels.

### Server State

Do not store server data in component state or global state unnecessarily.

Use TanStack Query for:

- fetching
- caching
- invalidation
- mutations
- loading states
- error states

### Local State

Keep state as close as possible to where it is used.

Do not lift state unless multiple components actually need it.

## Reusability

Whenever logic appears in more than one place:

- extract a custom hook
- extract a utility function
- extract a shared component

Avoid copy-paste.

## Styling

Reuse existing UI primitives. Our shadcn components are in `src/components/ui/`. Do not create new button, card, modal, input, table, badge, or dialog styles if equivalent components already exist there.

Keep spacing, typography, colors, and sizing consistent with the existing design system.

## Architecture

Keep business logic out of UI components.

Prefer:

- hooks for logic (see `src/lib/query-hooks.ts`)
- utilities for transformations (see `src/lib/utils.ts`)
- components for rendering

Components should mainly describe UI.

## Performance

Avoid unnecessary:

- re-renders
- API calls
- useEffect usage
- state updates

Memoize only when there is a measurable benefit.

Do not optimize prematurely.

## Code Quality

Always:

- remove dead code
- remove unused imports
- avoid duplicated logic
- use meaningful names
- keep functions focused

Leave the surrounding code cleaner than you found it.

## TypeScript

Avoid `any`.

Reuse existing types from `src/lib/types.ts` whenever possible.

Create shared types instead of redefining the same interfaces.

Use strict typing.

## File Organization

Keep related files together.

`src/components/ui/` for reusable primitives, `src/components/<feature>/` for feature-specific components.

Do not move files unless it provides a clear architectural improvement.

## Refactoring

If solving a task reveals obvious technical debt:

- make small safe improvements
- do not perform unrelated large refactors
- never rewrite working code just because another approach is preferred

## Before Creating Anything New

Always check whether the project already has:

- a reusable component
- a reusable hook
- a utility function
- a shared type
- a service
- a layout
- a provider
- a design pattern

Reuse first. Create second.

## Pull Request Standard

Every implementation should satisfy the following:

- Minimal code changes
- No duplicated logic
- No unnecessary abstractions
- No prop drilling
- Existing components reused whenever possible
- Architecture remains consistent
- Fully typed
- Readable and maintainable
- Easy for another developer to extend

The goal is not just to make the feature work — the goal is to improve the codebase while preserving consistency and long-term maintainability.
