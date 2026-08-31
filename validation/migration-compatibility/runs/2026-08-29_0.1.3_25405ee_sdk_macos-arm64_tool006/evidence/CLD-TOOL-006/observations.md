# CLD-TOOL-006 Observations

- Claude read both intended files, then issued two exact `replace_all:false` Edit calls.
  No alternate mutation tool ran.
- The second Edit activity started while the first awaited approval; DSH serialized the
  approval decisions. Each exact target surfaced once and was allowed once.
- Both native tool results report success and the turn ends only after both complete.
- Independent hashes equal both precomputed after states. The five unrelated files retain
  their before hashes, the seven-file set is unchanged, and no attachment object was added.
