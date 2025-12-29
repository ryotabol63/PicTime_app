#!/bin/bash
# Setup script for using external SQL Server
# This is for Codespaces where Docker-in-Docker is complex

set -euo pipefail

echo "=================================="
echo "  SQL Server Setup for Codespaces"
echo "=================================="
echo ""

: "${MSSQL_SA_PASSWORD:?Please set MSSQL_SA_PASSWORD environment variable or Codespaces secret}"
: "${PCT901S_USER_PASSWORD:?Please set PCT901S_USER_PASSWORD environment variable or Codespaces secret}"

echo "✓ Environment variables are set"
echo ""

# Install mssql-tools if not present
if ! command -v sqlcmd &> /dev/null; then
    echo "Installing mssql-tools..."
    sudo apt-get update
    sudo ACCEPT_EULA=Y apt-get install -y mssql-tools unixodbc-dev
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc
    export PATH="$PATH:/opt/mssql-tools/bin"
fi

echo ""
echo "📋 IMPORTANT: SQL Server Setup Required"
echo ""
echo "Since Codespaces has limitations with Docker Compose, you have two options:"
echo ""
echo "Option 1: Use Azure SQL Database (Recommended for Codespaces)"
echo "  - Create an Azure SQL Database"
echo "  - Update application.properties with connection string"
echo ""
echo "Option 2: Run SQL Server locally"
echo "  - Run the following command to start SQL Server in Docker:"
echo "    docker run -e 'ACCEPT_EULA=Y' -e \"MSSQL_SA_PASSWORD=\$MSSQL_SA_PASSWORD\" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2025-latest"
echo ""
echo "After SQL Server is accessible, run:"
echo "  bash .devcontainer/manual-init.sh"
echo ""

# Try to detect if SQL Server is running locally
if command -v docker &> /dev/null; then
    echo "Checking for existing SQL Server containers..."
    MSSQL_CONTAINER=$(docker ps -q -f ancestor=mcr.microsoft.com/mssql/server:2025-latest 2>/dev/null | head -1)
    
    if [ -n "$MSSQL_CONTAINER" ]; then
        echo "✓ Found running SQL Server container: $MSSQL_CONTAINER"
        
        # Update MSSQL_HOST based on container
        CONTAINER_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$MSSQL_CONTAINER")
        if [ -n "$CONTAINER_IP" ]; then
            echo "✓ SQL Server IP: $CONTAINER_IP"
            echo "export MSSQL_HOST=$CONTAINER_IP" >> ~/.bashrc
        fi
    else
        echo "⚠️  No SQL Server container found running"
    fi
fi

echo ""
echo "Setup script completed."
