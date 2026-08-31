# Observations

- A completed native source transcript exists and is absent from all 70 live link records.
- Live new-Session UI exposes Workspace, preset, prompt, access and model—not native Session ID/import/resume.
- Backend execution supports resume by ID internally, but DSH capability exposes only provider identity.
- Adapter only resumes an ID already stored for that DSH Session; an unlinked DSH Session calls create instead.
- Link-store `set` is private persistence machinery, not a supported user/API migration path.
