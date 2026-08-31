# CLD-IMG-001 Observations

- The deterministic PNG is 640×480 and contains no text. Pixel samples independently
  establish yellow background, purple triangle, and two green circles.
- DSH composer and settled chat each display exactly one `clipboard.png` image.
- DSH persists one image ref whose content-addressed ID, dimensions, byte count, and
  stored-object digest match the fixture exactly.
- The linked native Claude user record contains `[image, text]`. Decoding that exact
  Base64 image gives the same 13,080 bytes and SHA-256 as the fixture and DSH object.
- The decisive closed-vocabulary final equals the precommitted observation exactly.
  There are zero DSH tool events and zero native tool blocks, so Claude did not inspect
  the similarly located Workspace file through Read/Bash.
- The title-only native Session contains no image. Relay replay state points to the
  image-bearing business Session, and the turn ends completed.
