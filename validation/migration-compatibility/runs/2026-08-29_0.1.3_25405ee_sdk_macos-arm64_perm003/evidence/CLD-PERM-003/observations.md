# Observations

- The production Runtime retained `read-only/on-request`; the real SDK query used native `plan`.
- Claude executed one exact Read and no Write/Edit/Bash or approval request, then explicitly cited Plan mode.
- The read digest was unchanged and the absent target stayed absent at terminal completion and after 2s.
- Final marker is exact but preceded by the native restriction explanation; this is a presentation deviation only.
