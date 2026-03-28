# Checkbox Component

This layout component has been refactored to natively integrate Webflow's design system using Tailwind CSS and `radix-ui` primitive.

## Design Variables Handled
- Radius: `4px` (using `rounded`)
- Background: `var(--background-input)`
- Shadow: `var(--input-inner-shadow)`
- Interactive states: Default primary accent color (`data-[state=checked]`), standard danger ring (`aria-invalid`), basic focus-visible outline.

## Usage Guide
```tsx
import { Checkbox } from "@/components/ui/checkbox"

// Basic Usage
<Checkbox />

// Associated with label
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label
    htmlFor="terms"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Accept terms and conditions
  </label>
</div>
```

## Anti-Patterns
- **Do not manually set radius**: (e.g., `rounded-sm` or `rounded-full`). The component handles Webflow's 4px natively.
- **Do not manually restyle standard background colors for inactive states**: Ensure it falls back correctly to the defined Webflow token.
