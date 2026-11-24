# Deliverable contract

Create an evidence-backed handoff. Adapt depth to actual complexity; mark absent/untested domains without filler.

## `design-spec.md`

### 1. Scope and evidence

Record URL/final URL, capture time/timezone, scope, browser/capability tier, viewport/DPR/zoom where known, input emulation, locale/theme/motion, access/consent, and limitations. Include:

`template | URL | viewports | states tested | evidence IDs | gaps`

Differentiate visually inspected, text-only, blocked, and links-only pages. Evidence IDs must resolve to existing artifacts with relevant region/selector/JSON pointer. Preserve timestamps in the manifest even if prose uses a date only.

### 2. Design language

Describe visual character and 3–6 supported principles: evidence → repeated pattern → likely purpose (inferred). Cover hierarchy, rhythm, composition, signatures, density, reading/action priorities. Avoid unsupported psychology or brand intent.

### 3. Architecture and templates

Map navigation and observed journeys. Describe the supplied page section by section: purpose, background, layout, text/media relationship, components, transitions, evidence. Explain differences in sampled templates without repeating common foundations.

### 4. Foundations

Use populated tables:

- **Color:** normalized role/name, exact value/space/alpha, usage/state, evidence, confidence.
- **Typography:** role, family verification status, size/weight/leading/tracking/case, width/wrapping, responsive values, evidence.
- **Layout/spacing:** containers, gutters, grids, gaps, section padding, repeated values, responsive rules/exceptions.
- **Shape/elevation/layering:** radii, borders, shadows, dividers, overlays, sticky/stacking behavior.
- **Assets:** direction, icon/logo treatment, crop/aspect rules, URLs, rights unknowns.

Retain authored expressions alongside resolved values. Do not replace a `clamp()` rule with one universal pixel value.

### 5. Components and states

Inventory components and detail important repeated ones: anatomy, styles, dimensions, content limits, roles, responsive variants. Use:

`component | default | hover | focus | active/open | disabled/loading/error | evidence`

Reference shared rules or mark untested/not applicable. Include actual CTA/navigation behavior/destinations. Distinguish pressed `:active` from active navigation selection.

### 6. Motion

For prominent effects record trigger, properties, start/end, duration/delay/easing or scroll mapping, stagger/repeat, interruption, mobile/reduced-motion behavior, evidence. Separate observed motion, measured declarations, and proposed reconstruction. Unknown timing stays unknown.

### 7. Responsive behavior

Compare inspected widths: navigation, typography, columns/order, gutters, imagery, controls, sticky behavior, overflow, motion. Separate authored thresholds, experimentally bounded changes, and unknown breakpoints. Note 320px/zoom/input-emulation limitations.

### 8. Content, accessibility, resilience

Explain copy/task patterns and actual scoped semantic, keyboard, contrast, reflow, target, loading, and motion observations. Use criteria/methods for findings. Preserve observed defects rather than silently correcting the design.

### 9. Reconstruction and unknowns

Prioritize observed visual signatures, reusable constraints, and exceptions. Mark proposed names and inferred rules. Do not claim source recovery or choose an implementation framework without reason. List unknowns and verification paths. Include an evidence index/manifest link. Recommendations are optional only when requested.

## `design-tokens.json`

Valid UTF-8 JSON, without comments, NaN, or Infinity literals. This is an **audit observation format**, not DTCG interchange. A requested DTCG export must be separate and validated against the published format, with provenance in permitted extensions or a sidecar.

Example (replace example values; they are not site facts):

```json
{
  "schemaVersion": "1.0",
  "site": "https://example.com",
  "capturedAt": "2026-01-01T00:00:00Z",
  "scope": "Representative public pages",
  "naming": "Normalized audit names; original names retained only where verified",
  "tokens": [
    {
      "name": "color.text.primary",
      "category": "color",
      "value": "rgb(24, 24, 24)",
      "unit": null,
      "role": "Body text on the main light surface",
      "sourceName": null,
      "status": "measured",
      "method": "getComputedStyle().color",
      "confidence": "high",
      "conditions": {"viewport": [1440, 1000], "state": "default", "theme": "light"},
      "evidence": ["E003"],
      "locator": "main p:first-of-type",
      "notes": "Scoped to this paragraph, not all site text"
    }
  ],
  "unknowns": [
    {"category": "motion", "detail": "Reveal easing", "reason": "Timing inspection unavailable"}
  ]
}
```

Categories may include color, typography, spacing, dimension, layout, border, radius, shadow, opacity, layering, motion, breakpoint. Composite typography values can carry fontSize/lineHeight etc.; preserve units/conditions. Do not invent missing categories or use zero for unknown. Keep authored expressions separate from resolved values. Scope variants by state/theme/viewport/component. Inferred tokens remain inferred even when inputs were measured.

## Evidence manifest

Preserve ID, URL/final URL, timestamp, viewport, state/input/environment, artifact, method, selector/region/JSON pointer, status, caveats. Multiple claims can share an artifact when regions/locators are clear. Helper `samples.json` records can become evidence once indexed. Do not use an unrelated screenshot as sole support for a measurement.

## Quality gate

1. Open key screenshots to check loading/overlays/artifacts.
2. Trace palette/font/layout/motion claims to supporting evidence.
3. Account for sampled templates and whole-page sections.
4. Distinguish observed states from untested suggestions.
5. Parse JSON; reconcile prose/JSON values and units.
6. Resolve links and accurately state coverage/gaps.
