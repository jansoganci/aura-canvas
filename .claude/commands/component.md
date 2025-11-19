# Create New Component

Create a new React component for Aura Canvas following project conventions.

## Task
Create a new component named `$ARGUMENTS` in the `components/` directory.

## Requirements
1. Use TypeScript with FC type annotation
2. Mark as client component with `'use client'` if it uses hooks
3. Define Props interface
4. Use Tailwind CSS for styling
5. Memoize callbacks with useCallback
6. Export as default

## Template to follow
```tsx
'use client';

import { FC, useState, useCallback } from 'react';

interface ComponentNameProps {
  // Define props
}

const ComponentName: FC<ComponentNameProps> = ({ /* props */ }) => {
  // Component logic

  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

## After Creation
- Add to app/page.tsx if needed
- Update types.ts if new types needed
- Consider mobile responsiveness
