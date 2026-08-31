# Observations

- Both queries use the exact same cwd/command; Relay preserves the two requested source lists.
- With local included, Bash returns `LOCAL_3003`; with project alone it returns `SHARED_3003`.
- Each variable expansion triggers one normal approval, accepted with unchanged input, then completes.
- No diagnostic, retry, fallback, user-setting change or Workspace mutation occurs.
