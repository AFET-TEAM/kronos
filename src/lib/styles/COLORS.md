# Color System Documentation

This project uses a centralized color management system that supports both light and dark themes.

## File Structure

- **`colors.ts`** - TypeScript definitions for all colors organized by theme
- **`colors.scss`** - CSS variables for use in SCSS files
- **`colorUtils.ts`** - Utility functions for programmatic color access

## Usage

### In TypeScript/JavaScript

```typescript
import { lightTheme, darkTheme, getColorPalette } from '$lib/styles/colors';
import { themeStore } from '$lib/store/themeStore';

// Get colors for current theme
$: currentTheme = $themeStore;
$: colors = getColorPalette(currentTheme);

// Access specific colors
const primaryColor = colors.primary;
const brandColor = colors.brand.spacePurple;
const buttonColor = colors.ui.button.primary;
```

### In SCSS Files

Use CSS variables that automatically switch based on the theme:

```scss
.my-component {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  
  &:hover {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
  }
}
```

### In Tailwind Classes

Colors are available as Tailwind utility classes:

```html
<div class="bg-primary text-text border-border">
  <button class="bg-ui-button-primary hover:bg-ui-button-primary-hover">
    Click me
  </button>
</div>
```

### Dark Mode Support

The color system automatically switches based on the `dark` class on the document element. The theme store manages this:

```svelte
<script>
  import { themeStore, toggleTheme } from '$lib/store/themeStore';
</script>

<button on:click={toggleTheme}>
  Current theme: {$themeStore}
</button>
```

## Available Color Categories

### Primary Colors
- `primary`, `primaryHover`, `primaryLight`, `primaryDark`

### Secondary Colors
- `secondary`, `secondaryHover`, `secondaryLight`, `secondaryDark`

### Background Colors
- `background`, `backgroundSecondary`, `backgroundTertiary`, `backgroundOverlay`

### Text Colors
- `text`, `textSecondary`, `textTertiary`, `textPlaceholder`, `textInverse`

### Border Colors
- `border`, `borderSecondary`, `borderHover`

### Semantic Colors
- `success`, `warning`, `error`, `info`

### Brand Colors
- `brand.spacePurple`, `brand.oceanBlue`, `brand.sapphire`, etc.

### UI Component Colors
- `ui.button.*` - Button-specific colors
- `ui.header.*` - Header-specific colors
- `ui.card.*` - Card-specific colors

## Adding New Colors

1. Add the color to both `lightTheme` and `darkTheme` in `colors.ts`
2. Add the corresponding CSS variable to `colors.scss` (both `:root` and `.dark`)
3. Optionally add it to `tailwind.config.ts` if you want it as a Tailwind class

## Migration Guide

### Replacing Hardcoded Colors in SCSS

**Before:**
```scss
.my-element {
  color: #2d2d2d;
  background: #ffffff;
}
```

**After:**
```scss
.my-element {
  color: var(--color-text);
  background: var(--color-background);
}
```

### Replacing Hardcoded Colors in Components

**Before:**
```svelte
<div style="background-color: #18a0fb; color: #ffffff;">
```

**After:**
```svelte
<div class="bg-primary text-text-inverse">
<!-- or -->
<div style="background-color: var(--color-primary); color: var(--color-text-inverse);">
```

