#!/bin/bash
set -euo pipefail

echo "======================================"
echo "  Starting SQL Server in Docker"
echo "======================================"
echo ""

: "${MSSQL_SA_PASSWORD:?Please set MSSQL_SA_PASSWORD environment variable or Codespaces secret}"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker is not available"
    echo "Waiting for Docker to be ready..."
    for i in {1..30}; do
        if command -v docker &> /dev/null; then
            echo "✓ Docker is now available"
            break
        fi
        echo "  Waiting for Docker... ($i/30)"
        sleep 2
    done
    
    if ! command -v docker &> /dev/null; then
        echo "❌ ERROR: Docker did not become available"
        exit 1
    fi
fi

# Wait for Docker daemon to be ready
echo "Waiting for Docker daemon to be ready..."
for i in {1..30}; do
    if docker info >/dev/null 2>&1; then
        echo "✓ Docker daemon is ready"
        break
    fi
    echo "  Waiting for Docker daemon... ($i/30)"
    sleep 2
done

if ! docker info >/dev/null 2>&1; then
    echo "❌ ERROR: Docker daemon did not become ready"
    exit 1
fi

# Check if mssql container already exists
EXISTING_CONTAINER=$(docker ps -aq -f name=mssql 2>/dev/null || true)

if [ -n "$EXISTING_CONTAINER" ]; then
    echo "Found existing mssql container: $EXISTING_CONTAINER"
    
    # Check if it's running
    if docker ps -q -f name=mssql | grep -q .; then
        echo "✓ SQL Server container is already running"
        exit 0
    else
        echo "Starting existing SQL Server container..."
        docker start mssql
        echo "✓ SQL Server container started"
    fi
else
    echo "Creating new SQL Server container..."
    docker run -d \
        --name mssql \
        -e 'ACCEPT_EULA=Y' \
        -e "MSSQL_SA_PASSWORD=${MSSQL_SA_PASSWORD}" \
        -e 'MSSQL_PID=Developer' \
        -p 1433:1433 \
        mcr.microsoft.com/mssql/server:2022-latest
    
    echo "✓ SQL Server container created and started"
fi

echo ""
echo "Waiting for SQL Server to be ready..."
for i in {1..60}; do
    if docker exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" >/dev/null 2>&1; then
        echo "✓ SQL Server is ready!"
        echo ""
        echo "Connection details:"
        echo "  Host: localhost"
        echo "  Port: 1433"
        echo "  User: SA"
        echo "  Password: (from MSSQL_SA_PASSWORD secret)"
        break
    fi
    echo "  Waiting for SQL Server... ($i/60)"
    sleep 2
done

if ! docker exec mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" >/dev/null 2>&1; then
    echo "❌ ERROR: SQL Server did not become ready"
    echo "Container logs:"
    docker logs mssql
    exit 1
fi

echo ""
echo "✅ SQL Server is running and ready to accept connections"
