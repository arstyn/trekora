# Design Guidelines

## Loading States

### Page & Table Loading
The default loading style for full pages, data tables, and major content blocks is the **Skeleton Loader** (`Skeleton` component). This provides a perceived performance boost by giving users a visual placeholder of the layout before the content actually renders.

### Actions & Button Clicks
For button clicks, form submissions, and inline actions, use a **Circular Loader** (spinner) animation. The button should enter a disabled/loading state while the circular loader spins, preventing double submissions and providing immediate feedback.

## Empty States

### Standard Empty State
When a list, table, or section has no content to display, use a structured empty state instead of plain text like "No results". The standard empty state design should include:
- A descriptive **Icon** inside a soft-colored circular background (e.g., `bg-primary/10`).
- A prominent **Title** indicating what is missing (e.g., "No packages yet").
- A short, helpful **Description** offering context or next steps.
- (Optional) A **Call to Action (CTA)** button if the user can create or add the missing item from this state.
