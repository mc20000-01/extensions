#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if command -v twext >/dev/null 2>&1; then TW=(twext); else TW=(npx --yes @twextjs/twext); fi
for d in SenseColor AdvancedTImers OptomisedBlocks moremaths comments; do
  echo "== $d"
  (cd "$d" && "${TW[@]}" validate && "${TW[@]}" build)
done
