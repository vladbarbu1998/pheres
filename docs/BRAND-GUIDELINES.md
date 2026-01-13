# Brand Text Styling Guidelines

This document defines how brand names should be styled throughout the Pheres website.

## Brand Names

The following names must ALWAYS use the `BrandWord` component:

- **Pheres**
- **Narcisa Pheres**

## Usage

```tsx
import { BrandWord } from "@/components/ui/brand-word";

// In paragraphs and body text:
<p>
  At <BrandWord>Pheres</BrandWord>, we create exceptional jewelry.
</p>

// For the founder's name:
<p>
  Founded by <BrandWord>Narcisa Pheres</BrandWord> in 2006.
</p>
```

## Styling Applied

The `BrandWord` component applies:
- **Font**: Times New Roman (serif)
- **Transform**: UPPERCASE
- **Letter-spacing**: 0.15em

This ensures consistent brand presentation across all pages.

## When to Use

- All body text where "Pheres" or "Narcisa Pheres" appears
- Page introductions and descriptions
- Section content mentioning the brand
- Footer text (already uses `.brand-word` class)

## CSS Class Alternative

For non-React contexts (plain HTML), use the CSS class:

```html
<span class="brand-word">Pheres</span>
```

## Examples in Codebase

- `src/pages/Story.tsx` - Founder section
- `src/pages/Press.tsx` - Page hero intro
- `src/pages/ConciergeService.tsx` - Introduction section
- `src/components/layout/Footer.tsx` - Copyright text
