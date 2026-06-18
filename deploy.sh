#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="Admin"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() {
  printf '[%s] %s\n' "$PROJECT_NAME" "$1"
}

build_frontend() {
  if [ -d "$ROOT_DIR/frontend" ]; then
    log "Building frontend"
    cd "$ROOT_DIR/frontend"
    npm install
    npm run build
  fi
}

restart_services() {
  if [ -f "$ROOT_DIR/docker-compose.yaml" ]; then
    log "Restarting docker compose services"
    cd "$ROOT_DIR"
    docker compose up -d --build
  fi
}

main() {
  build_frontend
  restart_services
  log "Done"
}

main "$@"
