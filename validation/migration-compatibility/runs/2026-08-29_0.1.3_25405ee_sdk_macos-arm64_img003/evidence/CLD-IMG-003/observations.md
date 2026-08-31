# CLD-IMG-003 Observations

- Two separate paste actions produce two DSH previews. The pre-send screenshot visibly
  orders red square first and blue circle second, even though both labels are the neutral
  `clipboard.png`.
- DSH persists two different content-addressed attachment refs in that same order, and
  each local stored object matches its corresponding fixture digest.
- The linked native Claude user message is exactly `[image,image,text]`. Decoded image 0
  matches red-square bytes; decoded image 1 matches blue-circle bytes.
- The prompt contains none of `SQUARE`, `CIRCLE`, `RED`, or `BLUE`; the exact answer
  preserves the supplied order. DSH and native tool counts are zero.
- Replay state points to the image-bearing business Session and the turn completes once.
