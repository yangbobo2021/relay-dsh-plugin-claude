# Observations

- Runtime and real SDK query preserve the exact Chinese/spaced cwd with no encoding loss.
- Bash `pwd` returns the normalized same directory; Read and Write use exact Unicode/spaced absolute paths.
- Source marker/digest and created output bytes are exact; only Write requests approval.
- Output is removed after capture; source remains byte-identical.
