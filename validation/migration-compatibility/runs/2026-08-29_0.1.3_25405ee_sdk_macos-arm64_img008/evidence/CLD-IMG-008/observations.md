# CLD-IMG-008 Observations

- Before reload, the exact CLD-IMG-007 Session contains its text followed by one visible
  promoted `generated-img006.png` image.
- A full Web page reload reboots DSH and automatically restores that same selected Session.
  The post-reload DOM again contains exact text followed by exactly one image control.
- Archive, attachment object, source PNG, Relay link, native Session filename set,
  Workspace paths, and file digests are all unchanged. No new turn/event is persisted.
- Different DOM/screenshot digests reflect a real reload/render cycle; immutable Session
  and attachment digests establish that the recovered image comes from persisted state.
