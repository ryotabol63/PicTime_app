#!/bin/bash
set -euo pipefail

SQL_FILE="/workspace/backend/sql/V1__init_pct901s.sql"

: "${MSSQL_SA_PASSWORD:?Please set MSSQL_SA_PASSWORD environment variable or Codespaces secret}"
: "${PCT901S_USER_PASSWORD:?Please set PCT901S_USER_PASSWORD environment variable or Codespaces secret}"

echo "Waiting for SQL Server to be ready..."
for i in {1..60}; do
  if sqlcmd -S mssql -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" >/dev/null 2>&1; then
    echo "SQL Server ready"
    break
  fi
  echo "waiting for sqlserver... ($i)"
  sleep 2
done

if [ ! -f "$SQL_FILE" ]; then
  echo "SQL file not found: $SQL_FILE"
  exit 1
fi

echo "Running DDL: $SQL_FILE"
# Pass PCT901S_USER_PASSWORD as sqlcmd variable
sqlcmd -S mssql -U SA -P "$MSSQL_SA_PASSWORD" -v PCT901S_USER_PASSWORD="$PCT901S_USER_PASSWORD" -i "$SQL_FILE"

echo "Database init completed"
