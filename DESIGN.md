---
name: ParkPilot
description: Field Ops Console for CAMT smart parking administration
colors:
  camt-blue: "#245f9f"
  camt-blue-deep: "#164675"
  ink: "#17202a"
  muted: "#566273"
  surface: "#ffffff"
  canvas: "#f4f6f8"
  line: "#d8dee6"
  success: "#16845b"
  warning: "#9a6a00"
  danger: "#c3343f"
  info: "#2d6f92"
typography:
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.25
rounded:
  sm: "4px"
  md: "8px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.camt-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "16px"
---

# Design System: ParkPilot

## 1. Overview

**Creative North Star: "Field Ops Console"**

ParkPilot should feel like a campus infrastructure console used by administrators who need live answers, not a marketing dashboard. The visual system is restrained, compact, and map-forward: panels are flat, labels are direct, and status color is reserved for operational meaning.

**Key Characteristics:**
- Compact product typography with strong alignment.
- Flat white and light-gray surfaces with restrained CAMT blue accents.
- Semantic green, yellow, red, and blue only for state.
- Parking map, incident state, and export actions are treated as operational tools.

## 2. Colors

The palette uses CAMT blue as identity and action color, with clear semantic colors for parking and device state.

### Primary
- **CAMT Blue** (#245f9f): Primary actions, selected navigation, active filters, and focused controls.
- **CAMT Deep Blue** (#164675): High-emphasis hover states and compact brand marks.

### Neutral
- **Canvas** (#f4f6f8): App background.
- **Surface** (#ffffff): Panels, tables, dialogs, and toolbars.
- **Ink** (#17202a): Primary text.
- **Muted** (#566273): Secondary text that still meets readable contrast.
- **Line** (#d8dee6): Dividers, table borders, and input borders.

### Semantic
- **Success** (#16845b): Available spots, online devices, approved access.
- **Warning** (#9a6a00): Moderate demand, degraded devices, pending access.
- **Danger** (#c3343f): Occupied/full spots, offline devices, rejected/revoked access.

## 3. Typography

**Body Font:** Inter/system sans stack.

**Character:** Practical, compact, and unshowy. Use weight and alignment to create hierarchy; avoid display-sized typography inside admin surfaces.

### Hierarchy
- **Title** (700, 20px, 1.25): Page titles and important panel headings.
- **Section** (700, 16px, 1.35): Panel titles.
- **Body** (400-500, 14px, 1.5): Operational text and table cells.
- **Label** (600, 12-13px, normal case): Form labels, filters, and metadata.

## 4. Elevation

Depth is conveyed through tonal layering, borders, and state changes. Shadows are minimal and structural, never decorative.

### Shadow Vocabulary
- **Raised control** (`box-shadow: 0 1px 2px rgb(15 23 42 / 0.08)`): Optional for sticky headers and active popovers only.

## 5. Components

### Buttons
- **Shape:** 8px radius.
- **Primary:** CAMT blue background, white text, compact padding.
- **Hover / Focus:** Deep blue hover and visible outline ring.
- **Secondary:** White surface, line border, ink text.

### Cards / Containers
- **Corner Style:** 8px radius.
- **Background:** White over canvas.
- **Shadow Strategy:** Flat by default.
- **Border:** 1px line border.
- **Internal Padding:** 16-24px depending on density.

### Inputs / Fields
- **Style:** White or subtle neutral fill, 1px border, 8px radius.
- **Focus:** CAMT blue border and outline ring.
- **Error / Disabled:** Semantic state colors with text, never color alone.

### Navigation
- Compact fixed sidebar on desktop, drawer on mobile. Active state uses CAMT blue tint, icon, and text color; inactive state stays neutral.

### Parking Map
- The map is an operational approximation until exact physical coordinates are available. It should prioritize scan speed: lot lanes, grouped spots, selected spot state, and clear legend.

## 6. Do's and Don'ts

### Do:
- **Do** use CAMT blue for action and selection only.
- **Do** keep admin panels compact and aligned.
- **Do** provide loading, empty, error, and degraded states.
- **Do** show focus rings on keyboard navigation.

### Don't:
- **Don't** use over-rounded cards, `rounded-2xl`, or `rounded-3xl` in admin surfaces.
- **Don't** pair decorative shadows with borders.
- **Don't** use gradient text, glassmorphism, or floating hero metrics.
- **Don't** make heatmap colors decorative; they must communicate occupancy or device state.
