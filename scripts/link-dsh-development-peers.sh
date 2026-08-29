#!/usr/bin/env bash
set -euo pipefail

plugin_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
dsh_root="${DSH_ROOT:-}"
if [[ -z "$dsh_root" && -f "$plugin_root/../../upstream/deepseek-harness/package.json" ]]; then
  dsh_root="$plugin_root/../../upstream/deepseek-harness"
fi
if [[ -z "$dsh_root" && -f "$plugin_root/upstream/deepseek-harness/package.json" ]]; then
  dsh_root="$plugin_root/upstream/deepseek-harness"
fi
if [[ -z "$dsh_root" || ! -f "$dsh_root/package.json" ]]; then
  printf 'Set DSH_ROOT to a prepared official deepseek-harness checkout.\n' >&2
  exit 1
fi

source_root="$dsh_root/node_modules/.pnpm/node_modules/@deepseek-ai"
target_root="$plugin_root/node_modules/@deepseek-ai"
peers=(
  cordis dsh-api-remotes dsh-client-connection dsh-client-locale
  dsh-client-runtime dsh-client-ui-conversation dsh-client-ui-primitives
  dsh-client-ui-settings dsh-client-ui-sidebar dsh-client-ui-slots dsh-client-ui-theme dsh-llm
  dsh-session dsh-tools dsh-typert-protocol
)

mkdir -p "$target_root"
for peer in "${peers[@]}"; do
  source="$source_root/$peer"
  target="$target_root/$peer"
  if [[ ! -e "$source" ]]; then
    printf 'Missing DSH workspace peer: %s\nRun pnpm install in DSH_ROOT first.\n' "$source" >&2
    exit 1
  fi
  rm -rf "$target"
  ln -s "$source" "$target"
done
