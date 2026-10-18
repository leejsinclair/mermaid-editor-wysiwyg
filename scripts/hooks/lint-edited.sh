#!/usr/bin/env bash
# Claude Code PostToolUse hook (Edit|Write|MultiEdit): lint the file that was just written.
# Exit 2 with the linter output on stderr, which Claude Code feeds back to the agent to fix.
# Applies to the interactive session and to crew agents alike (both read .claude/settings.json).
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$root" || exit 0

file="$(jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[ -n "$file" ] && [ -f "$file" ] || exit 0
rel="${file#"$root"/}"

# Tooling not installed yet (fresh clone before npm install): do not block work.
[ -x node_modules/.bin/eslint ] || exit 0

# Generated, vendored and Spec Kit/crew-owned paths are not linted.
case "$rel" in
  node_modules/*|build/*|.react-router/*|playwright-report/*|test-results/*|.git/*|.specify/*|.crews/*|.claude/*|tools/*|package-lock.json) exit 0 ;;
esac

bin="node_modules/.bin"
out=""
status=0
run() { local o; o="$("$@" 2>&1)" || { status=2; out+="$o"$'\n'; }; }

case "$rel" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs) run "$bin/eslint" --max-warnings 0 "$rel" ;;
  *.css)                              run "$bin/stylelint" "$rel" ;;
  *.html|*.htm)                       run "$bin/htmlhint" "$rel" ;;
  *.mmd|*.mermaid)                    run node scripts/lint-mermaid.mjs "$rel" ;;
  *.md)
    run node scripts/lint-mermaid.mjs "$rel"   # diagrams are checked everywhere, including specs/
    case "$rel" in specs/*|setup.md) ;; *) run "$bin/markdownlint-cli2" --no-globs "$rel" ;; esac
    ;;
esac

if [ "$status" -ne 0 ]; then
  printf 'Lint failed for %s. Fix these before continuing:\n%s' "$rel" "$out" >&2
fi
exit "$status"
