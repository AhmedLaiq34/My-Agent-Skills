# Inspection and measurement methods

## Select a capability tier

| Available tools | What can be established | Limits |
| --- | --- | --- |
| Rendered browser + styles/geometry + interaction | Visual appearance, scoped exact values, responsive/state behavior | Still requires sampling and visual verification |
| Rendered browser/screenshots + interaction | Composition and observed behavior | Numeric style values/fonts/timing may remain estimated/unknown |
| Browser screenshots only | Visible appearance in captured states | No unobserved interaction or responsive claims |
| HTML/CSS/text fetch only | Declared styles, semantics, copy/links | Cannot establish painted result, cascade applicability, animation, or completed rendering |
| Blocked/unreachable | Error/access state and any independently retrieved public evidence | Do not manufacture an audit or bypass barriers |

Use available connectors first when sufficient. Tool-specific browser rules outrank these general examples. Never pretend a screenshot or resize happened. Avoid replacing the browser's actual rendering with an invented HTML reconstruction.

## Optional collector

`scripts/collect.mjs` is a local, read-only baseline collector for one public HTTP(S) URL per invocation. It starts a fresh browser context for each test viewport, records initial/settled and scrolled viewport images, measures representative styled elements, inspects accessible stylesheet/font/media rules, collects active Web Animations snapshots, and produces a manifest. It scrolls but does not click or submit anything. Site scripts will still run and make ordinary browser requests.

Requirements: Node.js supported by the installed Playwright version (current Playwright requires 20+), Playwright package, Chromium/Chrome. Check existing tools/packages first; do not assume the host's default Node is sufficiently recent. If needed and permitted by the environment, install dependencies into a temporary tools directory (not the user's project):

```bash
npm install --prefix /tmp/design-audit-tools playwright
node <skill-directory>/scripts/collect.mjs \
  --url https://example.com \
  --out /tmp/design-audit/evidence/home \
  --playwright-module /tmp/design-audit-tools/node_modules/playwright/index.mjs \
  --browser /usr/bin/google-chrome
```

Use an actual discovered browser path; omit `--browser` when Playwright's bundled Chromium is installed. Installing browser binaries is optional and should follow host restrictions. Browser path and package path are examples, not portable assumptions. Do not add a `--no-sandbox` flag or weaken the browser to make a failed run succeed.

Options:

- `--viewports desktop:1440x1000,tablet:768x1024,mobile:390x844` (default).
- `--viewports narrow:320x900` for an extra reflow check.
- `--reduced-motion reduce` or `no-preference` (default).
- `--color-scheme dark` or `light` (default).
- `--touch` enables touch/coarse pointer emulation; use separate output folders when comparing with resized desktop.
- `--max-scrolls 10` limits viewport-section capture; manifest reports whether the bottom was reached. Increase for long pages when appropriate.
- `--settle-ms 1200` is a bounded settling interval, not proof of hydration completion.

Read `manifest.json` for navigation/errors, actual capture times, capabilities/limits, and output paths. Each viewport has `initial.png`, `settled.png`, section images, optional `full.png`, and `samples.json`. The manifest's errors are evidence of degraded collection, not site defects. Full screenshot height is capped; section coverage is authoritative. Inspect screenshot files with the host's image viewer before drawing visual conclusions.

The helper is a sampler, not a crawler or audit engine. It does not prove actual glyph fonts, contrast, keyboard behavior, all animations, or a site's token hierarchy. Its main-document sample does not traverse iframe/shadow-root trees. CSSOM security may block cross-origin rules even while computed styles remain available. Sampling is bounded; inspect missing representative components manually. Never interpret its first 220 elements, CSS frequency, or animation count as exhaustive coverage.

## Browser reading procedure

1. Record navigation result/final URL. Visually check for consent, challenge, incomplete rendering, or missing assets. An HTTP 200 can still be an error shell.
2. Capture initial and settled views. Await font readiness with a timeout; don't wait forever for network idle on streaming/analytics-heavy sites.
3. Scroll in overlapping viewport increments and inspect the actual sections/footer. Repeat captures where a reveal or lazy image was initially missing. Note persistent headers and overlays.
4. At representative elements read `getComputedStyle()` plus `getBoundingClientRect()`. Capture state/viewport/time and a readable, disambiguated locator. Computed values show the active cascade, not necessarily original author intent. Visual geometry includes transforms.
5. Inspect authored CSS selectively: relevant rules, `@font-face`, CSS variables on root AND components, `@media`/`@container`, keyframes, and pseudo-elements. Cross-origin stylesheet errors are expected; do not bypass restrictions. Downloading allowed public CSS with a normal read tool may help, but still establish which rules apply.
6. Exercise supported controls and keyboard with tool input actions. Avoid changing styles or injecting classes to manufacture a state. Use observational DOM evaluation when permitted, but not as a substitute for real hover/focus interaction.
7. Compare resized and, when possible, touch-emulated views. For breakpoints read authored conditions or resize around a change, recording a tested interval. Container queries are not viewport breakpoints.
8. Revisit representative views under reduced motion. Use a fresh context/reload if initialization reads the preference only once. Keep default/reduced evidence separately.

## Targeted read-only measurement example

Only use evaluation if permitted by the current browser tool. Replace the selector with one actually found:

```js
const el = document.querySelector('main h1');
if (!el) return {error: 'Element not found'};
const s = getComputedStyle(el), r = el.getBoundingClientRect();
return {
  viewport: [innerWidth, innerHeight], scroll: [scrollX, scrollY],
  text: el.textContent.trim().slice(0, 160),
  familyDeclared: s.fontFamily, size: s.fontSize, weight: s.fontWeight,
  lineHeight: s.lineHeight, letterSpacing: s.letterSpacing,
  color: s.color, background: s.backgroundColor,
  rectCssPx: {x: r.x, y: r.y, width: r.width, height: r.height},
  transform: s.transform
};
```

This is a function-body example for evaluation, not a standalone script. An element's transparent background requires ancestor/layer inspection. `document.fonts` lists face/load state; CSS family plus `FontFace.status === 'loaded'` still does not prove every glyph uses that face. Browser-reported rendered fonts are stronger evidence when available.

## Motion measurement

Take snapshots before and after a natural trigger. `document.getAnimations()` can expose current CSS/Web Animations/transitions. Inspect effect targets, `getTiming()`, `getComputedTiming()`, and `getKeyframes()` with finite-number serialization. Finished/transient effects may be absent. Record the time relative to the trigger, not just the timestamp of a stylesheet read.

Inspect transition lists as parallel property/duration/delay/timing-function lists; values are not always one-to-one without CSS list-repetition rules. Do not report default `ease`/`0s` as a meaningful site animation. JavaScript scroll/canvas/video effects require visual frames, video metadata, DOM changes, or other supported inspection. Differentiate an observed repeat from an `iterations: Infinity` declaration.

## Contrast and accessibility spot checks

Use a reliable contrast utility or implement the WCAG sRGB linearization/luminance calculation. Resolve alpha by compositing over the actual backing color first. For gradients/images inspect the relevant worst-case region; if unresolved, don't claim a pass/fail from a flat swatch. Preserve the ratio and tested text size/weight/state. Wide-gamut inputs require suitable conversion, not stripping non-RGB syntax.

Keyboard inspection should record actual focus sequence and response, not just `tabindex` attributes. A bounding box smaller than 24px is not automatically a Target Size failure because spacing and criterion exceptions matter. Use a supported accessibility snapshot or DOM semantics as evidence, with its limitations.

## Boundaries and recovery

- Keep inspection to public pages or authorized sessions. Don't explore arbitrary private routes or enumerate protected endpoints.
- Do not expose session cookies, entered data, tokens, or private content in artifacts. Fresh unauthenticated contexts are preferable for public-site audits.
- Handle consent with a non-consenting option when it enables inspection and is available; record the choice and avoid accepting additional tracking merely to simplify screenshots. Do not obscure/remove overlays and call the result natural behavior.
- If a page fails, retry once through a normal browser load or another permitted read method. Record persistent failure and continue with accessible templates. Do not repeat requests aggressively.
- Keep public asset references; do not bulk download or redistribute copyrighted libraries/media. An audit records observable design, not ownership rights.
- Avoid general security scanning, account creation, purchases, form submission, or unrelated automation. This is a design observation skill.
