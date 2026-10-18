#!/usr/bin/env bash
# Run the crew against the active Spec Kit feature.
#   scripts/crew.sh review                  read-only BA + tech-lead review of spec, plan and tasks
#   scripts/crew.sh implement "<scope>"     qa -> developer -> tech-lead -> business-analyst, up to 3 rounds
# Set CREWS_MOCK=true for a dry run that makes no Claude calls.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

kind="${1:-}"
scope="${2:-}"

case "$kind" in
  review|implement) ;;
  *) sed -n '2,5p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2; exit 2 ;;
esac

if [ "$kind" = implement ] && [ -z "$scope" ]; then
  echo "implement needs a scope, e.g. scripts/crew.sh implement \"Phase 1 and Phase 2 tasks\"" >&2
  exit 2
fi

feature_json=".specify/feature.json"
if [ ! -f "$feature_json" ]; then
  echo "No active feature: $feature_json is missing. Run /speckit-specify in an interactive session first." >&2
  exit 1
fi

feature_dir="$(jq -r '.feature_directory // empty' "$feature_json")"
feature_dir="${feature_dir#"$root"/}"
feature_dir="${feature_dir%/}"
if [ -z "$feature_dir" ] || [ ! -d "$feature_dir" ]; then
  echo "Active feature directory '$feature_dir' does not exist." >&2
  exit 1
fi

if [ ! -f "$feature_dir/spec.md" ]; then
  echo "$feature_dir/spec.md not found." >&2
  exit 1
fi
if [ "$kind" = implement ] && [ ! -f "$feature_dir/tasks.md" ]; then
  echo "$feature_dir/tasks.md not found. Run /speckit-plan and /speckit-tasks first." >&2
  exit 1
fi

feature="$(basename "$feature_dir")"

# Context files, only those that exist (crews refuses a task naming a missing file).
context=()
for f in setup.md .specify/memory/constitution.md \
         "$feature_dir/spec.md" "$feature_dir/plan.md" "$feature_dir/tasks.md" \
         "$feature_dir/tests/behaviour-checklist.md" \
         "$feature_dir/tests/tdd-evidence.md" "$feature_dir/tdd-evidence.md"; do
  [ -f "$f" ] && context+=("$f")
done
context_json="$(printf '%s\n' "${context[@]}" | jq -R . | jq -s .)"

task_file="tasks/${kind}-${feature}.json"

if [ "$kind" = review ]; then
  jq -n --argjson context "$context_json" --arg dir "$feature_dir" '{
    description: ("Pre-implementation review of the Spec Kit feature in " + $dir + ". Review spec.md, plan.md and tasks.md (whichever exist) against setup.md. Business-analyst: are requirements complete, testable and consistent with the acceptance criteria? Tech-lead: is the design sound, layered as the directives require, and does the Verification Plan cover the risks? Do not modify any file."),
    agents: ["business-analyst", "tech-lead"],
    mode: "parallel",
    context: $context,
    aggregator: true
  }' > "$task_file"
else
  jq -n --argjson context "$context_json" --arg dir "$feature_dir" --arg scope "$scope" '{
    description: ("Implement the Spec Kit feature in " + $dir + ". Scope: " + $scope + ". Follow tasks.md order and the integrated TDD rules. QA writes and records the failing tests for the scope, the developer makes them pass and marks tasks done through the gate, the tech-lead and business-analyst review. Do nothing outside this scope."),
    agents: ["qa", "developer", "tech-lead", "business-analyst"],
    mode: "sequential",
    context: $context,
    retry: { maxRounds: 3, reviewerAgent: "tech-lead" }
  }' > "$task_file"
fi

echo "Wrote $task_file" >&2
exec crews run "$task_file"
