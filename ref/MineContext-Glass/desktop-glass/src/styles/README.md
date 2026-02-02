# CSS Architecture for MineContext Glass

## Structure Overview

This directory contains all styling assets for the MineContext Glass frontend, organized following a clean architecture pattern.

## Files and Their Purpose

### Core Files
- `tokens.css` - Design system variables (colors, typography, spacing, etc.)
- `index.css` - Global base styles (body, html selection, focus states)
- `README.md` - This documentation file

### Component Styles
- `app.css` - Layout components and dashboard structure
- `background.css` - ChromaticBackground component styles
- `header.css` - Header component styles
- `generate-action.css` - GenerateAction component styles
- `highlight-carousel.css` - HighlightCarousel component styles
- `report-composer.css` - ReportComposer component styles
- `status-toast.css` - StatusToast component styles
- `timeline-board.css` - TimelineBoard component styles
- `upload-panel.css` - UploadPanel component styles
- `visual-mosaic.css` - VisualMosaic component styles

### Special Case
- `../components/SystemStatus.css` - Maintained separately due to unique light theme styling

## Import Strategy

### Single Entry Point
All styles are imported through `styles/index.css` from `App.tsx`:

```typescript
// App.tsx
import "./styles/index.css";
```

### Import Order (from index.css)
1. **Design Tokens** (`tokens.css`) - Must be imported first
2. **Base Styles** (`../index.css`) - Global styles
3. **Component Styles** - All component-specific styles
4. **SystemStatus** - Imported separately from its component file

## Benefits

1. **Single Responsibility**: Each CSS file has a clear, focused purpose
2. **Eliminated Duplication**: CSS variables consolidated in one location
3. **Consistent Import Strategy**: No more scattered CSS imports across components
4. **Maintainable**: Clear hierarchy and dependency structure
5. **Performance Optimized**: Better CSS bundling and loading

## Migration Notes

- Previously, each component imported its own CSS file
- CSS variables were duplicated between `index.css` and `tokens.css`
- `SystemStatus` component maintains separate import due to unique light theme
- Container styling moved from `app.css` to component-specific CSS files

## Adding New Components

When adding new components:

1. Create component CSS file in `styles/` directory
2. Add import to `styles/index.css` in appropriate section
3. Do **not** import CSS from the component file itself
4. Follow existing naming conventions: `{component-name}.css`

## Design Token Usage

Always use CSS variables from `tokens.css` instead of hard-coded values:

```css
/* Good */
.my-component {
  background: var(--color-surface-primary);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
}

/* Bad */
.my-component {
  background: #0f172a;
  padding: 16px;
  border-radius: 12px;
}
```