# Gabriel Family Clinic - Design System Documentation

## Overview

The Gabriel Family Clinic Design System is a comprehensive, healthcare-focused design system built with WCAG AAA compliance, elderly accessibility, and Singapore market localization at its core.

### Key Features

- **WCAG AAA Compliant**: 7:1 contrast ratios for all text-background combinations
- **Elderly-Friendly**: 18px base font size, 44px+ touch targets
- **Healthcare-Focused**: Medical interface patterns and color coding
- **Singapore Localized**: British English, SGT timezone, SGD currency
- **Performance-Optimized**: <50KB CSS bundle, 60fps animations
- **Fully Typed**: TypeScript support throughout

---

## Design Tokens

### Colors

Tri-tone color palette optimized for healthcare interfaces:

**Professional Blue** (`#1E40AF`) - Primary brand color
- Conveys trust, professionalism, medical expertise
- Used for primary actions, headers, navigation

**Emerald** (`#10B981`) - Success and health indicators
- Represents health, growth, positive outcomes
- Used for success states, health metrics, completed appointments

**Warm Neutrals** (`#F8FAFC`) - Comfortable backgrounds
- Creates approachable, non-clinical atmosphere
- Used for backgrounds, cards, subtle elements

#### Usage

```typescript
import { colors } from '@/design-system/tokens';

// Access color values
const primaryColor = colors.primary[800]; // #1E40AF
const successColor = colors.emerald[500]; // #10B981
const background = colors.neutral[50];    // #F8FAFC

// Healthcare-specific colors
const emergency = colors.healthcare.emergency;     // #dc2626
const routine = colors.healthcare.routine;         // #10b981
const prescription = colors.healthcare.prescription; // #7c3aed
```

#### Accessible Combinations

All color combinations are tested for WCAG AAA compliance (7:1 contrast ratio):

```typescript
import { accessibleCombinations } from '@/design-system/tokens';

// Pre-validated combinations
const primary = accessibleCombinations.primary;
// { background: '#1e40af', text: '#ffffff', border: '#1d4ed8' }
```

---

### Typography

Elderly-friendly typography system with 18px base font size:

#### Font Sizes

```typescript
import { typography } from '@/design-system/tokens';

// Font sizes (all values accessible to elderly users)
typography.fontSize.base    // { size: '18px', lineHeight: '1.5' }
typography.fontSize.lg      // { size: '20px', lineHeight: '1.5' }
typography.fontSize.xl      // { size: '24px', lineHeight: '1.4' }
typography.fontSize['2xl']  // { size: '30px', lineHeight: '1.4' }
```

#### Presets

```typescript
import { typographyPresets } from '@/design-system/tokens';

// Pre-configured typography for common elements
const h1Styles = typographyPresets.h1;
const buttonStyles = typographyPresets.button;
const appointmentTimeStyles = typographyPresets.appointmentTime;
```

---

### Spacing

Touch-friendly spacing system with 44px+ minimum touch targets:

#### Touch Targets

```typescript
import { spacing } from '@/design-system/tokens';

// Touch target sizes
spacing.touchTarget.minimum     // '44px' - WCAG AAA minimum
spacing.touchTarget.standard    // '48px' - Comfortable
spacing.touchTarget.large       // '56px' - Elderly-friendly
spacing.touchTarget.extraLarge  // '64px' - Critical actions
```

#### Component Spacing

```typescript
// Button spacing
spacing.button.minHeight  // '44px'
spacing.button.paddingX.md // '24px'
spacing.button.paddingY.md // '12px'

// Form spacing
spacing.form.fieldGap     // '24px' - Gap between fields
spacing.form.labelGap     // '8px' - Gap between label and input
```

---

### Motion & Animation

Gentle, healthcare-appropriate animations with reduced motion support:

#### Durations

```typescript
import { motion } from '@/design-system/tokens';

motion.duration.fast    // '200ms' - Quick interactions
motion.duration.normal  // '300ms' - Standard transitions
motion.duration.slow    // '500ms' - Gentle, healthcare-appropriate
```

#### Easing

```typescript
// Healthcare-appropriate easing
motion.easing.gentle  // 'cubic-bezier(0.25, 0.1, 0.25, 1)'
motion.easing.smooth  // 'cubic-bezier(0.4, 0.0, 0.2, 1)'
```

#### Transitions

```typescript
import { motion } from '@/design-system/tokens';

// Pre-configured transitions
motion.transition.fadeGentle     // Gentle fade for healthcare
motion.transition.slideGentle    // Gentle slide for healthcare
motion.transition.button         // Quick button feedback
```

---

### Accessibility

WCAG AAA compliance utilities and tokens:

#### Focus Management

```typescript
import { accessibility } from '@/design-system/tokens';

// Focus ring configuration
accessibility.focus.outlineWidth   // '3px'
accessibility.focus.outlineColor   // '#2563eb'
accessibility.focus.outlineOffset  // '2px'
```

#### Touch Targets

```typescript
// Minimum touch target sizes
accessibility.touchTarget.minimum      // 44px
accessibility.touchTarget.recommended  // 48px
accessibility.touchTarget.large        // 56px
```

#### Screen Reader Support

```typescript
// Screen reader only styles
const srOnlyStyles = accessibility.srOnly;
// Applies visually hidden but accessible to screen readers
```

---

## Components

### Button

Elderly-friendly button with WCAG AAA compliance and 44px+ touch targets.

#### Basic Usage

```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary" size="md">
  Book Appointment
</Button>
```

#### Variants

- `primary` - Main actions (Professional Blue)
- `secondary` - Alternative actions (Emerald)
- `outline` - Less prominent actions
- `ghost` - Subtle actions
- `danger` - Destructive actions
- `success` - Positive actions

#### Sizes

- `sm` - Small (44px min height)
- `md` - Medium (48px min height) - Default
- `lg` - Large (56px min height)
- `xl` - Extra Large (64px min height) - Elderly-friendly

#### Props

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}
```

#### Examples

```tsx
// Primary action
<Button variant="primary" size="lg">
  Confirm Appointment
</Button>

// With loading state
<Button variant="primary" loading={isSubmitting}>
  Submit Form
</Button>

// With icons
<Button variant="secondary" leftIcon={<CalendarIcon />}>
  Schedule
</Button>

// Full width
<Button variant="primary" fullWidth>
  Continue
</Button>

// Accessible
<Button 
  variant="primary"
  ariaLabel="Book appointment for Monday, 15th March"
>
  Book Now
</Button>
```

---

## Utilities

### Design System Utilities

```typescript
import { designSystemUtils } from '@/design-system/utilities';

// Accessibility utilities
const focusRing = designSystemUtils.a11y.focusRing();
const touchTarget = designSystemUtils.a11y.touchTarget('large');

// Typography utilities
const clampedText = designSystemUtils.typography.clamp(3);
const responsiveText = designSystemUtils.typography.responsiveText('18px', '20px', '22px');

// Spacing utilities
const stack = designSystemUtils.spacing.stack(4, 'vertical');
const responsivePadding = designSystemUtils.spacing.responsivePadding('16px', '24px', '32px');

// Healthcare utilities
const emergencyBadge = designSystemUtils.healthcare.emergencyBadge();
const appointmentStatus = designSystemUtils.healthcare.appointmentStatus('scheduled');
```

---

## Theme Configuration

### Healthcare Theme

The default healthcare theme is pre-configured with optimal settings:

```typescript
import { healthcareTheme } from '@/design-system/themes/healthcare';

// Access theme values
healthcareTheme.colors.primary        // '#1e40af'
healthcareTheme.typography.fontSize.base  // '18px'
healthcareTheme.spacing['11']         // '44px'
```

### Custom Themes

Create custom themes extending the base:

```typescript
import { createTheme, designTokens } from '@/design-system/tokens';

const customTheme = createTheme({
  colors: {
    ...designTokens.colors,
    primary: {
      ...designTokens.colors.primary,
      800: '#custom-color', // Override primary color
    },
  },
});
```

---

## Best Practices

### Accessibility

1. **Always use accessible color combinations**
   ```typescript
   import { accessibleCombinations } from '@/design-system/tokens';
   // Use pre-validated combinations
   ```

2. **Enforce minimum touch targets**
   ```tsx
   // All interactive elements should have 44px+ height
   <button className="min-h-[44px]">...</button>
   ```

3. **Provide focus indicators**
   ```tsx
   <button className="focus-visible:ring-2 focus-visible:ring-primary-600">
     ...
   </button>
   ```

4. **Use semantic HTML**
   ```tsx
   // Good
   <button onClick={handleClick}>Click me</button>
   
   // Avoid
   <div onClick={handleClick}>Click me</div>
   ```

### Performance

1. **Use CSS custom properties for dynamic values**
2. **Prefer transform and opacity for animations**
3. **Respect reduced motion preferences**
4. **Use will-change sparingly**

### Healthcare-Specific

1. **Color coding for appointment types**
   - Emergency: Red
   - Urgent: Orange
   - Routine: Emerald
   - Follow-up: Blue

2. **Clear visual hierarchy for medical information**
3. **Generous white space for readability**
4. **Large, clear typography for prescriptions**

---

## Testing

### Accessibility Testing

```typescript
import { a11yValidation } from '@/design-system/tokens';

// Check contrast ratio
const contrastCheck = a11yValidation.checkContrast('#1e40af', '#ffffff');
console.log(contrastCheck);
// { ratio: 7.0, passes: true, level: 'AAA' }

// Check touch target
const touchCheck = a11yValidation.checkTouchTarget(48, 48);
console.log(touchCheck);
// { passes: true, minimum: 44, actual: { width: 48, height: 48 } }

// Check font size
const fontCheck = a11yValidation.checkFontSize(18);
console.log(fontCheck);
// { passes: true, minimum: 18, actual: 18 }
```

---

## Migration Guide

### From Phase 1 to Phase 2

1. Update imports to use design system tokens:
   ```typescript
   // Old
   const color = '#1e40af';
   
   // New
   import { colors } from '@/design-system/tokens';
   const color = colors.primary[800];
   ```

2. Replace hardcoded values with design tokens:
   ```tsx
   // Old
   <button className="h-12 px-6 bg-blue-800">Click</button>
   
   // New
   import { Button } from '@/components/ui/button';
   <Button variant="primary" size="md">Click</Button>
   ```

3. Use design system utilities:
   ```tsx
   // Old
   <div className="min-h-[44px] focus:ring-2 focus:ring-blue-600">
   
   // New
   import { designSystemUtils } from '@/design-system/utilities';
   <div className={cn(
     designSystemUtils.a11y.touchTarget(),
     designSystemUtils.a11y.focusRing()
   )}>
   ```

---

## Support

For questions or issues with the design system, please refer to:
- Implementation Plan: `/docs/master-implementation-plan.md`
- Phase 2 Details: `/docs/phase-2-detailed-plan.md`
- Component Examples: `/app/page.tsx`

---

**Version**: 2.0.0  
**Last Updated**: 2025-11-05  
**Phase**: 2 of 9 - Design System & Component Library Foundation
