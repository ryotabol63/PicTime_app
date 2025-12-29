#!/bin/bash
# Manual initialization script for troubleshooting
# Run this manually if auto-initialization fails

echo "======================================"
echo "  Manual Database Initialization"
echo "======================================"
echo ""

# Check environment variables
if [ -z "$MSSQL_SA_PASSWORD" ]; then
  echo "❌ ERROR: MSSQL_SA_PASSWORD is not set"
  echo "Please set it in Codespaces secrets or export it in your terminal"
  exit 1
fi

if [ -z "$PCT901S_USER_PASSWORD" ]; then
  echo "❌ ERROR: PCT901S_USER_PASSWORD is not set"
  echo "Please set it in Codespaces secrets or export it in your terminal"
  exit 1
fi

echo "✓ Environment variables are set"
echo ""

# Check if mssql container is running
echo "Checking SQL Server container status..."
if ! command -v docker &> /dev/null; then
  echo "❌ ERROR: Docker is not available"
  exit 1
fi

if ! docker ps -f name=mssql | grep -q mssql; then
  echo "❌ ERROR: mssql container is not running"
  echo ""
  echo "Starting SQL Server container..."
  if bash .devcontainer/start-mssql.sh; then
    echo "✓ SQL Server container started"
  else
    echo "❌ ERROR: Failed to start SQL Server container"
    exit 1
  fi
fi

echo "✓ SQL Server container is running"
echo ""

# Try to connect to localhost
echo "Testing SQL Server connection..."
MAX_RETRIES=30
RETRY_COUNT=0
SQL_HOST="localhost"

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if sqlcmd -S "$SQL_HOST" -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" >/dev/null 2>&1; then
    echo "✓ SQL Server is ready!"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "  Attempt $RETRY_COUNT/$MAX_RETRIES - waiting for SQL Server..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ ERROR: SQL Server did not respond after $MAX_RETRIES attempts"
  echo "Container logs:"
  docker logs mssql
  exit 1
fi

# Run initialization
SQL_FILE="/workspace/backend/sql/V1__init_pct901s.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ ERROR: SQL file not found: $SQL_FILE"
  exit 1
fi

echo ""
echo "Running database initialization script..."
if sqlcmd -S "$SQL_HOST" -U SA -P "$MSSQL_SA_PASSWORD" -v PCT901S_USER_PASSWORD="$PCT901S_USER_PASSWORD" -i "$SQL_FILE"; then
  echo ""
  echo "✅ Database initialization completed successfully!"
  echo ""
  echo "You can now test the connection:"
  echo "  sqlcmd -S localhost -U SA -P \"\$MSSQL_SA_PASSWORD\" -Q \"SELECT name FROM sys.databases;\""
  echo "  sqlcmd -S localhost -U pct901s_user -P \"\$PCT901S_USER_PASSWORD\" -d pct901s -Q \"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;\""
else
  echo ""
  echo "❌ ERROR: Database initialization failed"
  exit 1
fi
