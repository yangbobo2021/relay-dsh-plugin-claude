export function installModelSelection(ctx, preset, provider, otherProvider) {
  let stopped = false;
  const selecting = new Set();
  const pending = new Set();

  const sync = () => {
    if (stopped) return;
    const list = ctx.sessions.list.getSnapshot();
    const id = list.current;
    if (id === undefined || list.byId[id]?.blank !== true) return;
    if (selecting.has(id)) {
      pending.add(id);
      return;
    }

    const selectedPreset = list.byId[id]?.projectionValues?.agentPreset;
    if (selectedPreset !== preset && selectedPreset === otherProvider) return;
    selecting.add(id);
    void (async () => {
      const directory = ctx.modelDirectories.directoryFor(id);
      const models = await directory.load();
      if (stopped || !models.current) return;
      const latest = ctx.sessions.list.getSnapshot().byId[id];
      if (ctx.sessions.list.getSnapshot().current !== id || latest?.blank !== true || latest.projectionValues?.agentPreset !== selectedPreset) {
        pending.add(id);
        return;
      }
      // Model projection changes also update the Session list in alpha.2.
      // Do not reset a chosen model or select again on our own projection update.
      if (selectedPreset === preset && models.current.provider === provider) return;
      const target = selectedPreset === preset
        ? models.groups.find((group) => group.id === provider)
        : models.current.provider === provider
          ? models.groups.find((group) => group.id !== provider && group.id !== otherProvider)
          : undefined;
      const model = target?.models[0];
      if (!target || !model) return;
      await directory.select({
        provider: target.id,
        model: model.id,
        ...(model.reasoning?.defaultEffort
          ? { reasoningEffort: model.reasoning.defaultEffort }
          : {}),
      });
    })().catch(() => {}).finally(() => {
      selecting.delete(id);
      if (pending.delete(id)) sync();
    });
  };

  const off = ctx.sessions.list.subscribe(sync);
  sync();
  return () => { stopped = true; off(); };
}
