# FastApiAdmin Quiet Operations Design System

> Page-specific rules under `pages/` override this file. The approved product specification remains authoritative when generated recommendations conflict.

**Product:** reusable enterprise administration skeleton with integrated AI/RAG operations
**Audience:** enterprise administrators, internal operators, and secondary-development teams
**Platform:** responsive desktop-first web application
**Stack:** Vue 3, TypeScript, Element Plus, SCSS, Tailwind utilities, Iconify/Remix Icon

## Direction

Quiet Operations is calm, dense, and dependable. The interface should feel like a professional operational tool used for hours at a time, not a marketing page or a futuristic AI demo.

- Default light theme with a graphite navigation rail, cool-white work area, and restrained teal actions.
- Dark and system themes remain first-class.
- Hierarchy comes from typography, borders, spacing, and stable grid tracks.
- Panels use borders before shadows; shadows are reserved for overlays.
- AI screens make retrieval, citations, generation, and failures legible without decorative effects.

## Color

### Light

| Role | Value | Project token |
|---|---:|---|
| Canvas | `#F3F5F6` | `--fa-color-canvas` |
| Surface | `#FFFFFF` | `--fa-color-surface` |
| Raised surface | `#FFFFFF` | `--fa-color-surface-raised` |
| Sidebar | `#18232D` | `--fa-color-sidebar` |
| Sidebar selected | `#263842` | `--fa-color-sidebar-active` |
| Primary | `#2D7D72` | `--fa-color-accent` |
| Primary hover | `#256B62` | `--fa-color-accent-hover` |
| Text | `#26333D` | `--fa-color-text` |
| Muted text | `#68747C` | `--fa-color-text-muted` |
| Border | `#DFE5E8` | `--fa-color-border` |
| Success | `#25806F` | `--fa-color-success` |
| Warning | `#B7791F` | `--fa-color-warning` |
| Danger | `#C2413B` | `--fa-color-danger` |
| Information | `#39728C` | `--fa-color-info` |

### Dark

| Role | Value |
|---|---:|
| Canvas | `#0D1318` |
| Surface | `#151D23` |
| Raised surface | `#1B252C` |
| Sidebar | `#0A1014` |
| Text | `#E7EDEF` |
| Muted text | `#9CABB3` |
| Border | `#2C3941` |

Do not use purple or blue gradients, glowing accents, bokeh, glassmorphism, or color as the only state signal.

## Typography

- Prefer the project's existing locally available sans-serif stack; do not add a remote font dependency solely for the redesign.
- Page title: 20–24px, 700 weight, compact line height.
- Panel title: 14–16px, 600–700 weight.
- Body: 13–14px for dense operational surfaces, 15–16px for long-form AI answers.
- Metadata: 12px minimum.
- Numbers use tabular figures where comparison matters.
- Letter spacing is 0.

## Geometry And Density

- Base spacing unit: 4px.
- Common gaps: 8px, 12px, 16px, 20px, 24px.
- Control radius: 5px.
- Panel radius: 6px.
- Overlay radius: 8px maximum.
- Default control height: 36px; compact mode may use 32px.
- Page padding: 22px desktop, 16px tablet, 12px mobile.
- Use stable grid tracks, explicit minimum heights, and ellipsis/wrapping so dynamic content never changes toolbar or tab dimensions.

## Component Rules

### Navigation

- Dark sidebar, grouped labels, one icon family, selected state visible through background plus contrast/border.
- Header contains current context and global tools only.
- Tabs reserve a stable toolbar track and never resize on hover.

### Buttons

- One primary action per page section.
- Use icon-only buttons for familiar tools, with accessible labels and tooltips.
- Hover/pressed/disabled/loading/focus states are mandatory.
- Hover must not translate, scale, or change layout dimensions.

### Tables And Filters

- Order: page header, compact filters, batch actions, table, pagination.
- Keep action columns fixed and concise.
- More than one row of filters collapses behind “更多筛选”.
- Empty, no-result, loading, partial-error, and full-error states are distinct.

### Forms And Overlays

- Simple create/edit flows use right drawers; complex flows may use pages or dialogs.
- Validation is adjacent to fields.
- Dangerous confirmations name the object and impact.
- No nested cards.

### AI/RAG

- Desktop chat uses sessions, conversation, and evidence regions.
- Retrieval stages are explicit: retrieving, reranking, generating, complete, error.
- Citations are numbered and expandable; never fabricate missing citations.
- Document states come only from backend values.
- Streaming content appears progressively without exaggerated typing animation.

## Motion

- Controls: 120–180ms.
- Page entry: 160–220ms, opacity plus no more than 6px movement.
- Drawers/dialogs: about 200ms.
- Animate state changes only; no ambient or looping decoration.
- Respect `prefers-reduced-motion` and reduce nonessential motion to near zero.

## Responsive

- 1440px: full navigation, complete tables, three-column AI workspace.
- 1024px: collapsible navigation and evidence region.
- 768px: drawer navigation, priority table columns, evidence drawer.
- 375px: viewing and light operations; complex tables expose core fields without incoherent horizontal overflow.

## Accessibility

- Minimum 4.5:1 contrast for normal text.
- Visible `:focus-visible` rings.
- Keyboard access for navigation, dialogs, drawers, forms, table actions, and AI panels.
- Status must use text/icon in addition to color.
- Use semantic buttons and headings.
- Preserve the skip-to-content link.

## Forbidden Patterns

- Marketing hero sections inside the operational app.
- Decorative gradients, orbs, glow, glass panels, and oversized rounded cards.
- Cards nested inside cards.
- Generic purple AI palette.
- Emoji as structural icons.
- Layout-shifting hover effects.
- Static numbers presented as live data.
- Full secret values rendered in model configuration.

## Delivery Checklist

- [ ] Light and dark themes visually checked.
- [ ] 375px, 768px, 1024px, and 1440px checked.
- [ ] No overlap, clipping, unplanned horizontal scroll, or layout shift.
- [ ] Loading, empty, no-result, forbidden, partial-error, and full-error states checked.
- [ ] Keyboard path and focus visibility checked.
- [ ] Reduced motion checked.
- [ ] One icon family and no emoji structural icons.
- [ ] `pnpm type-check`, `pnpm test`, and `pnpm build` pass.
