# Observations

- Query 1 creates and query 2 resumes the exact same UUID with project source in both.
- The identical subprocess returns A before the file change and B after it; tool IDs are distinct and
  each executes once after one accepted unchanged-input approval.
- The active Claude conversation remains continuous while its per-query environment reflects new settings.
- No diagnostic/fallback occurs and original fixture bytes are restored.
