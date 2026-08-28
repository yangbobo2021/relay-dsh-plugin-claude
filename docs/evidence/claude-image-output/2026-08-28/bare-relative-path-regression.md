# Bare Relative Image Path Regression Evidence

DSH reference: `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`

## Reported behavior

Claude created `football.svg` in the Session workspace. Its first final answer
mentioned the plain filename `football.svg`, but no image appeared. A later
answer mentioned `/Users/boboyang/test3/football.svg`, and the same file then
rendered successfully.

## Root cause and related gaps

The bare-path expression required `/`, `./`, or `../`, despite the specification
promising bare relative paths. The existing unit and DSH Web acceptance tests
used `./football.svg`, so they did not exercise Claude's natural plain-filename
wording.

The same review found and covered these adjacent gaps:

- unprefixed directory-relative paths such as `renders/football.svg`;
- natural Chinese punctuation and Markdown emphasis around paths;
- Windows-style path extraction;
- compound extensions such as `package.svg.js` being partially matched;
- ordinary Markdown links being treated as image candidates; and
- remote image URI schemes being reconsidered as local path fragments.

## Delivery acceptance evidence

| Scenario | Evidence |
| --- | --- |
| Exact first-turn wording promotes the SVG | `a first-turn bare SVG filename becomes a standard DSH image block` uses `已在 football.svg 中创建...` and the real DSH `BlockAssembler` produces `reasoning`, `text`, `image` |
| Bare SVG is converted once | `a bare SVG filename in natural assistant prose is rasterized` verifies a `football.png` attachment with the declared 16 x 10 dimensions |
| Relative, absolute, Windows, Chinese, and Markdown forms preserve order | `final-answer image path syntax preserves mention order and removes duplicates` |
| Ordinary links and remote references do not trigger previews | `non-image links and remote image URIs are not local image candidates` |
| Non-image links do not suppress structured image fallback | `final paths are authoritative and structured attachments are fallback-only` includes a `README.md` link and still returns the structured image |
| Existing image output and input behavior remains intact | The complete 82-test plugin suite passed |

## Verification results

The focused image-output and adapter suites passed 46 tests with 0 failures.

An independent temporary checkout reproduced the repository layout used by CI,
checked out and built the official DSH reference above, installed plugin
dependencies with `npm ci --ignore-scripts`, and ran:

```bash
npm run verify
```

Result:

- TypeScript passed.
- All 82 plugin tests passed with 0 failures, skips, or todos.
- Host and client production bundles built successfully.
- `git diff --exit-code -- lib` confirmed reproducible tracked bundles.
- `git diff --check` passed.
- `npm pack --dry-run` contained the expected 15 package files.
- Dependency installation reported 0 vulnerabilities.

## Evidence boundary

The regression is in the plugin's final-text path parser, not in DSH rendering.
The adapter test proves that the formerly missed first answer now emits the
standard persisted DSH image block. Existing real DSH Web evidence for this
same block and SVG-to-PNG path remains in `README.md` in this directory and in
`docs/evidence/claude-svg-output/2026-08-28/README.md`.
