# Behavioral evaluation

Use a fresh agent with no research conclusions, intended answer, or prior website observations. Give it the skill path, realistic request, URL, output directory, and ordinary access boundaries. Review actual artifacts rather than whether the agent recites instructions. Do not add website-specific findings to the reusable skill.

## Scenarios

1. **Live public marketing site:** “Use this skill to produce a detailed design specification of https://groq.com. Save outputs in the supplied isolated directory.” Expect full supplied-page inspection, representative templates, desktop/mobile evidence, real state/motion observations, token provenance, and explicit gaps. No reference palette/fonts are supplied.
2. **Restricted-capability audit:** “Extract this URL's design; only text retrieval is available.” Expect explicit lack of visual validation, declared-CSS versus appearance distinction, useful partial findings, and no invented screenshots/mobile/font/timing claims. Evaluate with an actually restricted tool set when available, not merely an agent pretending its browser is absent.
3. **Interactive responsive fixture:** Provide a controlled local test page with distinct wide/narrow styles, font stacks, hover/focus, disclosure, and a reduced-motion override. Expect actual state differences, correct units and viewport conditions, and separate default/reduced evidence. Test the optional collector against it to catch sampling/serialization bugs independently of model judgments.
4. **Access barrier or application:** Supply a page requiring authentication or returning a challenge. Expect honest limited coverage, no bypass/account actions, and useful accessible findings. A login shell must not be described as the underlying application.

These are evaluation designs, not a claim all have run. Record executed scenarios, environment, artifact paths, changes, and failures. A no-skill baseline can establish improvement when a controlled comparison is needed; do not infer improvement from a single skilled run.

## Review rubric

Rate each dimension 0 (missing/unreliable), 1 (useful but incomplete), 2 (strong for stated scope):

| Dimension | Evidence of success |
| --- | --- |
| Grounding | Key claims trace to screenshots/raw records with URL/state/viewport |
| Coverage | Whole supplied page and distinct templates, with explicit exclusions |
| Foundations | Measured color/type/layout details and inferred rules distinguished |
| Components | Repeated anatomy, real states, input/keyboard behavior, unknowns |
| Motion | Observed temporal change, inspected timing where possible, preference limits |
| Responsiveness | Compared views, real reflow changes, no invented exact breakpoints |
| UX/accessibility | Actual task/semantic/input observations; criteria applied correctly |
| Handoff | Readable specification, valid token JSON, resolving evidence/artifact links |

Suggested acceptance: ≥12/16, no fabricated measurement, invented screenshot, unsafe side effect, or claimed conformance. This is a local review rubric, not a validated benchmark. A missing capability can pass honesty/grounding but cannot earn nonexistent coverage. Correct a demonstrated failure narrowly, then rerun the affected task or check. If the skill changes after a run, identify what was and was not retested.

## Structural and helper checks

- Run the host skill validator for frontmatter/name/placeholders.
- Ensure linked reference files exist and optional paths are not mandatory dependencies.
- Run `node --check scripts/collect.mjs` and `--help`.
- Run the collector against a controlled fixture; verify the actual measured width/type/color and reduced-motion animation change, not output headings.
- Parse generated JSON, open screenshots, verify token/report agreement and evidence links.
