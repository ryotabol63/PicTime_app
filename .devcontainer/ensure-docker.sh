#!/bin/bash
# Ensure Docker daemon is running
# This script handles the Docker-in-Docker initialization

set -e

echo "🔧 Ensuring Docker daemon is running..."

# Wait for Docker daemon to be available
for i in {1..30}; do
  if docker info >/dev/null 2>&1; then
    echo "✓ Docker daemon is already running"
    exit 0
  fi
  
  if [ $i -eq 1 ]; then
    echo "Docker daemon not running, starting it..."
    # Start dockerd in the background with sudo
    sudo rm -f /tmp/dockerd.log
    sudo touch /tmp/dockerd.log
    sudo chmod 666 /tmp/dockerd.log
    sudo dockerd > /tmp/dockerd.log 2>&1 &
  fi
  
  echo "  Waiting for Docker daemon... ($i/30)"
  sleep 2
done

echo "❌ ERROR: Docker daemon did not start"
exit 1
