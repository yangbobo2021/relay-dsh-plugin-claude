# CLD-TXT-003 Observations

- Persisted terminal payload is exactly:

  ````markdown
  # Relay Markdown 1003

  1. alpha
  2. beta

  ```js
  const marker = "CLD_MD_CODE_1003";
  console.log(marker);
  ```
  ````

- Expected and actual raw-text SHA-256 are both
  `03ebf85086d580ba5b659a4eb968221a89cdb69242f41e832186444a53782169`.
- Web DOM contains one level-one heading, one ordered list with exact items `alpha`,
  `beta`, and one code region whose text retains the exact newline and punctuation.
- Archive has one assistant message/text block, completed turn, and zero tool events.
  Link store adds exactly the new DSH→Claude Session pair.
- Workspace manifest remains
  `b68ece075dc2bdc11492d8a446a20d09dcb1ac3016b573fa28e8343a3322c953`.
  Screenshot SHA-256 is
  `d29339db6617bb2f2310a3d42d04d261802a10687265a2641ddd7cdb1ee283fa`.
