# CLD-TXT-010 Validation Review

## Reasonableness

- Filename-set differencing prevents accidental inspection or attribution of unrelated
  native Sessions. Link and replay IDs resolve which of the two new files is business.
- Conversational record counts test history pollution directly; DSH route/events and UI
  independently test title generation and presentation.

## Reliability

- The first trial proved structural isolation, but its title answer happened to equal the
  required business marker. That content collision could conceal a weak text-level
  assertion, so it was not accepted alone.
- A fresh second trial produced different business and title answers. Exact native files,
  link absence, archive route/replay state, zero title matches in business history, one
  business assistant, zero tools, digests, and screenshot all agree.
- `ai-title` is explicitly classified rather than silently ignored: it is metadata and
  does not carry a `message.role`, so it is not a business conversation turn.

## Verdict

**Pass, high confidence.** DSH title generation runs in a separate ephemeral, unlinked
Claude Session; neither its prompt nor its distinct answer enters business conversation
history.
