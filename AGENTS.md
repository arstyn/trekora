Unless specifically asked Do not test the app in agent mode, Testing will be done by me. 

# Frontend File Naming Convention (`apps/frontend/src/pages/user`)
When creating or modifying features inside `pages/user`, STRICTLY follow this structure:
1. **Directories**: Use plural names for feature directories (e.g., `bookings`, `packages`, `branches`).
2. **Component Folders**: Use `_components` for all internal component folders inside a feature directory.
3. **Page Files**: All route-level page files must end with `.page.tsx`.
   - **Main feature list page**: `[feature-plural].page.tsx` (e.g., `bookings.page.tsx`)
   - **Create page**: `create-[feature-singular].page.tsx`
   - **Edit page**: `edit-[feature-singular].page.tsx`
   - **View/Details page**: `view-[feature-singular].page.tsx`