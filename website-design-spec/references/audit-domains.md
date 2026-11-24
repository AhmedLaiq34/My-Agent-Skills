# UI/UX extraction checklist

Use relevant sections. “Not present in inspected views” differs from “not tested.” Capture exceptions instead of forcing a coherent system where the site is inconsistent.

## 1. Design language and principles

Describe composition before choosing aesthetic labels: hierarchy, focal elements, scale contrast, symmetry/asymmetry, density, negative space, rhythm, alignment, proximity, repetition, grouping, figure/ground, continuity. Connect interpretations to concrete examples; use repeated evidence for site-wide principles.

Identify brand signatures: expressive typography, shapes, editorial framing, section transitions, illustration motifs, data presentation, cursor treatment, and motion. Distinguish conventions from signatures. Marketing and documentation may use different systems.

Infer audience/tasks from navigation and copy. Explain how CTA hierarchy, progressive disclosure, proof, and reading order support them. Do not claim measured trust, usability, or conversion benefits without research data.

## 2. Information architecture and journeys

Capture global/local navigation, menus, active-page indication, breadcrumbs, search/filtering, anchors, footer, external destinations, and mobile equivalents. Show observed templates rather than every link.

Trace entry → discover → compare/understand → action/destination. Record labels, feedback, reversibility, orientation, and where access/authorization stops inspection. Applications may require object relationships, sidebar/table/detail patterns, density controls, and safely observable empty/error/loading states.

## 3. Color and surfaces

Capture backgrounds, raised/alternate surfaces, text hierarchy, accents, borders/dividers, interactive states, focus, status colors, overlays, gradients, image tint, and themes. Separate decorative colors from action/status colors.

For main colors record exact authored/resolved value, space/alpha, proposed semantic role, component/selector/state, and evidence. Include hex only for exact sRGB equivalents; preserve wide-gamut values and opacity. Preserve gradient stops/position/angle, blending, and filters when verified. Do not infer a whole scale from two colors.

Describe approximate prominence visually: DOM frequency is not screen-area coverage. Confirm the painted background behind text, including ancestors, images, overlays, and pseudo-elements before calculating contrast.

## 4. Fonts and typography

Identify declared stacks, available/loaded faces, weights/ranges, italics, variable axes, and sources. Distinguish CSS alias, marketing name, filename, and confirmed rendered font. A font inspector or supported rendered-font API can strengthen identification; glyph fallbacks and Unicode subsets can vary within a sentence.

Build a role table for display/hero, H1/H2/H3, body, small/supporting text, nav, CTA, eyebrow, code/data, and legal text where present. Record family, size, weight, line-height, tracking, case/decoration, alignment, maximum measure, and desktop/mobile values. Preserve `normal` as unknown numeric leading. Identify manual breaks versus responsive wrapping and emphasis treatments. Wait for fonts to avoid specifying fallback layout.

Look for fluid scaling, media/container changes, truncation, hyphenation, balanced wrapping, tabular numerals, and translated/long-content behavior where observed. Do not identify proprietary fonts by appearance alone.

## 5. Layout, spacing, shape, elevation

Capture gutters/max-widths, content/full-bleed regions, grid tracks, gaps, alignment, section padding, vertical rhythm, card sizes, text widths, and media placement. Identify fixed/fluid/sticky/overlap behavior, including actual header behavior on scroll.

Distinguish layout boxes from transformed visual rectangles. Record CSS px, viewport, and container. Investigate repeated spacing before proposing a scale; do not impose a 4px/8px grid. Capture border styles, radii by role, shadow offsets/blur/spread/color, filters, dividers, stacking contexts, and overlays. Runtime z-indices do not necessarily reveal a global layering system.

## 6. Components and states

Document component families rather than DOM nodes:

| Family | Inspect when present |
| --- | --- |
| Navigation | Header/logo, mega menu, drawer, tabs, breadcrumbs, footer |
| Actions | Primary/secondary/tertiary buttons, text links, icon buttons, disabled/loading |
| Content | Features, testimonials, logos, article cards, pricing, comparison tables |
| Inputs | Labels, help, required indication, errors/validation, autocomplete |
| Feedback | Toasts, notices, progress, skeletons, success/error/empty states |
| Disclosure | Accordions, dialogs, popovers, tooltips, carousels |
| Specialized | Code, chat, demos, metrics, charts/maps, media |

For key components record anatomy, dimensions/padding, text roles, surfaces, icons, responsive variants, content constraints, states, keyboard/touch behavior, motion, semantics, and evidence. Mark unobserved states unknown. Inspect focus-visible separately from hover. Check Escape/dismissal, focus movement/return, tab order, and background scrolling for overlays where supported.

## 7. Motion and choreography

Inventory observed entrances, scroll reveals, parallax, pinning, navigation transitions, hover/press, count-ups, marquees/carousels, page transitions, diagrams, video, canvas/WebGL, SVG/Lottie, and cursor effects.

Use: `element → trigger → from/to properties → duration/delay → easing/spring → stagger/order → repeat/reverse → interruption/reset → responsive/reduced-motion behavior → evidence`.

Record units/direction. Scroll-linked motion needs scroll range/mapping, not invented duration. Spring parameters require inspected data; otherwise describe response qualitatively. Computed transforms are single frames. `getAnimations()` can miss requestAnimationFrame/canvas effects. Libraries/declarations are clues until tied to visible behavior.

Observe multiple moments. Capture state frames at known relative times or local recordings when possible. Do not disable motion before documenting it; optional frozen screenshots can follow. Check whether reduced motion removes/substitutes/slows/leaves effects unchanged; a media query alone does not establish the result.

## 8. Assets and art direction

Describe logos/variants, icons/strokes/fills, illustration perspective, photography/crop/lighting/grading, textures/noise, masks, aspect ratios, decorative patterns, and consistency. Record available asset URLs and roles; distinguish intrinsic/rendered dimensions and `object-fit`/position.

Inspect SVG/pseudo-elements when visuals are absent from image records. Embedded/canvas media may need screenshots and behavioral description. Reference proprietary assets without implying redistribution rights for fonts/logos/photos/artwork.

## 9. Content and UX writing

Capture tone, sentence/headline patterns, vocabulary, capitalization, CTA verbs, density, proof, microcopy, errors, help, and disclosure. Use short distinctive examples, not wholesale copying. Explain how copy/layout guide scanning and decisions. Note localization/RTL/number/date formats only when inspected.

## 10. Responsive and input behavior

Compare navigation, columns/order, typography/wrapping, gutters/section spacing, media crop, stacking/visibility, sticky behavior, overflow/tables, controls, and motion. Resized desktop does not prove touch behavior: record touch/pointer emulation separately. Two widths do not prove exact breakpoints.

Inspect 320 CSS px reflow and zoom/text resizing when available. Note clipping, unexpected two-axis scrolling, obscured controls, and usable viewport after banners. Distinguish intentionally horizontal components/tables from page overflow. Theme/forced-colors, coarse pointer, landscape, localization, and browser differences are conditional extensions, not guarantees.

## 11. Accessibility and resilience

Report scoped checks, not certification: landmarks/headings, semantics/names, labels/help/errors, alt text, tab order/focus, hover/focus disclosure, selected/expanded state, modals, color-only meaning, text legibility, target spacing, motion controls, media alternatives.

For WCAG 2.2 AA spot checks, normal text needs ≥4.5:1; large text ≥3:1 (18pt/24 CSS px regular or 14pt/about 18.67 CSS px bold). Essential non-text UI indicators generally need ≥3:1 against adjacent colors; apply criterion-specific exceptions. Target Size (Minimum) is 24×24 CSS px with spacing and other exceptions, not a universal 44px minimum. Enhanced 44×44 is AAA. Animation from interaction is AAA; other motion requirements such as pause/stop/hide can apply at lower levels. Focus Appearance is AAA; visible focus and focus-not-obscured have separate applicable criteria.

Record tested pairs/state/background/ratio, target sizes/spacing, method, and criterion before calling a failure. Automated scans/screenshots cannot establish conformance. Mark gradients/images, hidden content, screen-reader behavior, and unchecked routes as appropriate uncertainties.

## 12. Perceived performance

Describe observed layout shifts, blank/loading periods, missing images/fonts, delayed interaction, lazy loading, skeletons, and continuous animation. Session slowness can reflect the audit environment; record conditions before attributing causes.

If measured, distinguish lab from field data, device/network/tool, samples, and date. Core Web Vitals cover loading (LCP), response (INP), and stability (CLS). Screenshots, navigation duration, and Lighthouse alone do not prove real-user passing rates. No performance score is required for extraction.
