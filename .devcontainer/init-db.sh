#!/bin/bash
set -euo pipefail

SQL_FILE="/workspaces/PicTime_app/backend/sql/V1__init_pct901s.sql"

: "${MSSQL_SA_PASSWORD:?Please set MSSQL_SA_PASSWORD environment variable or Codespaces secret}"
: "${PCT901S_USER_PASSWORD:?Please set PCT901S_USER_PASSWORD environment variable or Codespaces secret}"

echo "Checking SQL Server connection..."
SQL_READY=false

# Try connecting to localhost (Docker container)
for i in {1..30}; do
  if sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" >/dev/null 2>&1; then
    echo "✓ SQL Server is ready (localhost)"
    SQL_READY=true
    SQL_HOST="localhost"
    break
  fi
  echo "  Waiting for SQL Server... ($i/30)"
  sleep 2
done

if [ "$SQL_READY" = false ]; then
  echo "❌ ERROR: SQL Server is not accessible"
  echo ""
  echo "Checking if mssql container is running..."
  if command -v docker &> /dev/null; then
    docker ps -a -f name=mssql || echo "No mssql container found"
    echo ""
    echo "💡 Try running: bash .devcontainer/start-mssql.sh"
  fi
  echo ""
  echo "⚠️  Skipping database initialization. The application may not work correctly."
  exit 0  # Exit gracefully
fi

if [ ! -f "$SQL_FILE" ]; then
  echo "SQL file not found: $SQL_FILE"
  exit 1
fi

echo "Running DDL: $SQL_FILE"
# Pass PCT901S_USER_PASSWORD as sqlcmd variable
sqlcmd -S "$SQL_HOST" -U SA -P "$MSSQL_SA_PASSWORD" -v PCT901S_USER_PASSWORD="$PCT901S_USER_PASSWORD" -i "$SQL_FILE"

echo ""
echo "✅ Database initialization completed successfully!"
echo ""
echo "You can connect to the database using:"
echo "  Host: localhost"
echo "  Port: 1433"
echo "  Database: pct901s"
echo "  User: pct901s_user"
echo "  Password: (from PCT901S_USER_PASSWORD secret)"
