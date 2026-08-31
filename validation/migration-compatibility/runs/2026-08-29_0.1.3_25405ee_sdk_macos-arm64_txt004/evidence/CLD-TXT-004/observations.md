# CLD-TXT-004 Observations

- Primary: begin marker first appears at `6,849ms` with Stop active and end absent;
  completion/end occur at `13,226ms`, a `6,377ms` separation.
- Confirmation: begin first appears at `7,224ms` with Stop active and end absent;
  completion/end occur at `12,262ms`, a `5,038ms` separation.
- Both prompts omit the full begin/end strings, preventing a user-message false positive.
  Sampling reads assistant paragraph text only; thinking is rendered as a button.
- Both persistent archives have one completed assistant message, exactly one begin and
  end marker, and zero tool events. Workspace manifest remains unchanged.
- The partial screenshot visibly shows the derived begin marker, only the first five
  numbered lines, `Deep diving...`, and the blue Stop button. Its SHA-256 is
  `ba24a3d02f178035e0185394dacc37e33fd4c0dbdeab9ec2a0c37c056ba63689`.
- The completed screenshot visibly shows lines through `confirm-200`, the exact end
  marker, and the normal Send button. Its SHA-256 is
  `e5a0028cb633a6e6a31dd75960e347a431d28fd0c0423861f83ef1844be1644d`.
