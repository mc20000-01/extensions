#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

usage() {
  cat <<'EOF'
Build, publish and push every extension in this repo.

Usage: ./make-all.sh (--token TOKEN | --authed) --message TEXT

  -t, --token TOKEN    Hub token to publish with
  -a, --authed         Use the session saved by `twext login` instead
  -m, --message TEXT   Commit message for the extensions that changed
  -h, --help           Show this help

Every subfolder with a twext.yml is validated, built and published, then
this runs `git add .`, `git commit -m TEXT` and `git push`.
EOF
}

token=""
authed=0
message=""

while [ $# -gt 0 ]; do
  case "$1" in
    -t|--token)
      [ $# -ge 2 ] || { echo "error: $1 needs a token" >&2; exit 2; }
      token="$2"
      shift 2
      ;;
    -a|--authed)
      authed=1
      shift
      ;;
    -m|--message)
      [ $# -ge 2 ] || { echo "error: $1 needs a message" >&2; exit 2; }
      message="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [ -z "$token" ] && [ "$authed" -eq 0 ]; then
  echo "error: pass --token TOKEN or --authed" >&2
  usage >&2
  exit 2
fi
if [ -n "$token" ] && [ "$authed" -eq 1 ]; then
  echo "error: pass only one of --token and --authed" >&2
  exit 2
fi
if [ -z "$message" ]; then
  echo "error: pass --message TEXT or -m TEXT" >&2
  usage >&2
  exit 2
fi

if command -v twext >/dev/null 2>&1; then
  TW=(twext)
else
  TW=(npx --yes @twextjs/twext)
fi

count=0
for d in */; do
  d="${d%/}"
  [ -f "$d/twext.yml" ] || continue
  count=$((count + 1))
  echo "== $d"
  (cd "$d" && "${TW[@]}" validate && "${TW[@]}" build)
  if [ -n "$token" ]; then
    # Pass the token through the environment so it stays out of `ps`.
    (cd "$d" && TWEXTHUB_TOKEN="$token" "${TW[@]}" publish)
  else
    (cd "$d" && "${TW[@]}" publish)
  fi
done

if [ "$count" -eq 0 ]; then
  echo "error: no subfolder with a twext.yml" >&2
  exit 1
fi

echo "== git"
git add .
if git diff --cached --quiet; then
  echo "nothing to commit"
else
  git commit -m "$message"
fi
git push
