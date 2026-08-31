import { existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// A directory wildcard bypasses package exports for subpaths such as /types.
// Map the official package's actual declaration exports, including transitive
// brands and UI augmentations, instead of falling back to a parent's npm tree.
export function declarationPaths(manifest, directory) {
  const paths = {};
  const exports = manifest.exports ?? { '.': { types: manifest.types } };
  const entries = Object.keys(exports).some(key => key.startsWith('.')) ? exports : { '.': exports };
  for (const [subpath, conditions] of Object.entries(entries)) {
    const target = declarationTarget(conditions);
    if (!target) continue;
    const name = manifest.name + (subpath === '.' ? '' : subpath.slice(1));
    paths[name] = [resolve(directory, target)];
  }
  return paths;
}

function declarationTarget(value) {
  if (typeof value === 'string') return /\.(?:[cm]?ts|tsx)$/.test(value) ? value : null;
  if (!value || typeof value !== 'object') return null;
  return declarationTarget(value.types) ?? declarationTarget(value.import) ?? declarationTarget(value.default);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const sourceRoot = resolve(process.argv[2], 'node_modules/.pnpm/node_modules/@deepseek-ai');
  const paths = {};
  for (const entry of readdirSync(sourceRoot)) {
    if (!existsSync(join(sourceRoot, entry, 'package.json'))) continue;
    const directory = realpathSync(join(sourceRoot, entry));
    const manifestPath = join(directory, 'package.json');
    if (!existsSync(manifestPath)) continue;
    Object.assign(paths, declarationPaths(JSON.parse(readFileSync(manifestPath, 'utf8')), directory));
  }
  if (!paths['@deepseek-ai/dsh-session/types'] || !paths['@deepseek-ai/dsh-brand']) {
    throw new Error('Prepared official DSH declaration exports are incomplete');
  }
  writeFileSync(join(pluginRoot, 'node_modules/.relay-dsh-types.json'), JSON.stringify({ compilerOptions: { paths } }, null, 2) + '\n');
}
