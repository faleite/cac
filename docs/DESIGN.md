---
name: Postal Utility System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#5d3f3e'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#916f6c'
  outline-variant: '#e6bdba'
  surface-tint: '#bf0022'
  primary: '#a8001c'
  on-primary: '#ffffff'
  primary-container: '#d3122a'
  on-primary-container: '#ffe6e4'
  inverse-primary: '#ffb3af'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#066018'
  on-tertiary: '#ffffff'
  tertiary-container: '#2a792f'
  on-tertiary-container: '#adffa5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3af'
  on-primary-fixed: '#410005'
  on-primary-fixed-variant: '#930017'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d982'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  touch-target-min: 48px
  margin-mobile: 16px
  gutter-mobile: 12px
---

## Brand & Style

This design system is built for the **CTT Delivery Assistant**, a mobile-first PWA designed for high-frequency utility in diverse environments. The brand personality is efficient, reliable, and authoritative, reflecting the heritage of a national postal service while embracing modern digital speed.

The visual style is **Corporate Modern with a focus on Utility**. It prioritizes extreme legibility and physical ease of use (ergonomics) over decorative flair. The aesthetic utilizes a card-based architecture to organize complex logistical data into digestible, actionable units. High-contrast elements and ample whitespace ensure the interface remains functional under direct sunlight or in fast-paced delivery scenarios.

## Colors

The palette is led by **CTT Red**, used strategically for primary actions and brand presence. To ensure accessibility and reduce visual fatigue, this intense red is balanced against a high-contrast hierarchy of greys.

- **Primary (CTT Red):** Reserved for the "Primary Action" in any view (e.g., "Confirm Delivery," "Start Route").
- **Secondary (Dark Grey):** Used for primary text and iconography to ensure a contrast ratio that exceeds WCAG AAA standards for outdoor visibility.
- **Tertiary (Success Green):** Specifically for "Completed" or "Delivered" states, providing immediate positive reinforcement.
- **Neutral (Surface Grey):** A soft light grey used for background fills and card grouping to separate content from the true white page background.
- **Surface White (#FFFFFF):** Used for the cards themselves to create a clear "layer" above the neutral background.

## Typography

**Inter** is utilized for its exceptional legibility and systematic feel. The type scale is intentionally generous to accommodate "on-the-move" reading. 

Headings are consistently bold to anchor the eye quickly. A specialized `label-bold` style is used for metadata (e.g., Tracking Numbers, Postal Codes) to distinguish them from standard body copy. All touch-related text (buttons and links) adheres to a minimum size of 16px to prevent mis-taps.

## Layout & Spacing

The layout follows a **Mobile-First Fluid Grid** model. While optimized for narrow viewports, the content expands to a max-width of 768px for tablet users, centering the primary "feed" of cards.

A strict **4px baseline grid** governs all spacing. The standard margin for mobile screens is 16px, ensuring content doesn't bleed into the physical edges of the device. All interactive elements must maintain a minimum height/width of 48px to accommodate glove-friendly or hurried touch interactions. Vertical spacing between cards is set at 12px to maintain a clear visual rhythm without wasting excessive screen real estate.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Minimal Shadows**. 

1.  **Background:** The base layer is `neutral_color_hex` (#F5F5F5).
2.  **Surface:** Interactive cards and input containers are pure White (#FFFFFF).
3.  **Elevation:** A single, consistent "Soft Drop" shadow is used for active cards (4px Blur, 2px Y-offset, 8% Black). 
4.  **Floating Elements:** The Bottom Navigation Bar and Floating Action Buttons (FAB) use a more pronounced shadow (12px Blur, 4px Y-offset, 12% Black) to indicate they sit above the scrolling content.

Avoid heavy blurs or glassmorphism to preserve performance on lower-end mobile hardware and ensure maximum contrast.

## Shapes

The shape language uses a **Rounded** (0.5rem) corner radius. This strikes a balance between the professional "square" look of traditional logistics and the friendly "modern" feel of current PWA standards. 

Buttons and input fields share this 8px radius. Larger containers, such as modal sheets or full-width cards, may use the `rounded-lg` (16px) or `rounded-xl` (24px) variants to soften the interface and make the PWA feel more like a native iOS/Android application.

## Components

- **Buttons:** Primary buttons use a solid CTT Red background with white text. Secondary buttons use a thick 2px border in Dark Grey. Active states should involve a slight darkening of the fill color.
- **Inputs:** Text fields must have a minimum height of 56px. Labeling should be persistent (top-aligned) rather than disappearing placeholder text to assist in high-speed data entry.
- **Cards:** The primary container for delivery info. Each card should have a clear "Status Indicator" stripe on the left edge (e.g., Red for Urgent, Green for Delivered, Grey for Pending).
- **Bottom Navigation:** A fixed bar with 4-5 icons (Route, Search, Scan, Profile). Icons must be paired with text labels for clarity. The "Scan" button should be the central, visually distinct element.
- **Chips:** Used for filtering (e.g., "Express," "Signature Required"). Chips use a light grey background and change to CTT Red with white text when selected.
- **Lists:** High-density lists (like address history) should use 16px vertical padding and a subtle 1px divider (#E0E0E0).