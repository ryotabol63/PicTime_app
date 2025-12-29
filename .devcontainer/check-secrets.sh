#!/usr/bin/env bash
set -euo pipefail

# Pre-flight check for required Codespaces secrets
MUST_VARS=("MSSQL_SA_PASSWORD" "PCT901S_USER_PASSWORD")
MISSING=()
for v in "${MUST_VARS[@]}"; do
  if [ -z "${!v-}" ]; then
    MISSING+=("$v")
  fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
  echo "\nERROR: Required Codespaces secrets are missing:\n"
  for m in "${MISSING[@]}"; do
    echo "  - $m"
  done
  echo "\nPlease add them at: https://github.com/ryotabol63/PicTime_app/settings/secrets/codespaces"
  echo "Then re-create the Codespace or restart the devcontainer."
  exit 1
fi

echo "All required Codespaces secrets present. Proceeding..."
