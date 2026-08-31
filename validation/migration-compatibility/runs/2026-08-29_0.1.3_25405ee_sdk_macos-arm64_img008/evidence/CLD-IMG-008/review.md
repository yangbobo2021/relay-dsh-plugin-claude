# CLD-IMG-008 Validation Review

## Reasonableness

- Reusing the exact promoted Session tests persistence rather than generating another
  image. A full reload destroys page memory and forces DSH Session reconstruction.
- Both UI recovery and immutable-state equality are necessary: UI alone could re-fetch a
  wrong image, while hashes alone do not prove presentation.

## Reliability

- Automatic exact-Session restoration, text/image order, one visible control, before/
  after screenshots, stable archive/object/source/link/native/Workspace state, and no new
  events all agree after a true page reload.

## Verdict

**Pass, high confidence.** A promoted DSH image survives full page reload and remains
visible from persisted Session and attachment state without another model turn.
