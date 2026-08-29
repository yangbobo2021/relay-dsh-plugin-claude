const CLAUDE_PLUGIN_KEYS = new Set(["type", "path", "skipMcpDiscovery"]);

export function normalizeClaudePlugins(value, label = "Claude plugins") {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new TypeError(`${label} must be an array`);

  return value.map((plugin, index) => {
    const entryLabel = `${label}[${index}]`;
    if (!plugin || typeof plugin !== "object" || Array.isArray(plugin)) {
      throw new TypeError(`${entryLabel} must be an object`);
    }
    for (const key of Object.keys(plugin)) {
      if (!CLAUDE_PLUGIN_KEYS.has(key)) throw new TypeError(`${entryLabel}.${key} is not supported`);
    }
    if (plugin.type !== "local") throw new TypeError(`${entryLabel}.type must be "local"`);
    if (typeof plugin.path !== "string" || !plugin.path.trim()) {
      throw new TypeError(`${entryLabel}.path must be a non-empty string`);
    }
    if (plugin.skipMcpDiscovery !== undefined && typeof plugin.skipMcpDiscovery !== "boolean") {
      throw new TypeError(`${entryLabel}.skipMcpDiscovery must be a boolean`);
    }
    return {
      type: "local",
      path: plugin.path,
      ...(plugin.skipMcpDiscovery === undefined ? {} : { skipMcpDiscovery: plugin.skipMcpDiscovery }),
    };
  });
}
