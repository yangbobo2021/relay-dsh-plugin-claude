#!/usr/bin/env bash
set -euo pipefail
plugin_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec node "$plugin_root/scripts/link-dsh-development-peers.mjs"
