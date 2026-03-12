#!/usr/bin/env bash
set -Eeuo pipefail

# cleanup-cache.sh
# One-click cleanup for Docker build cache / dangling resources + common package caches.
# Safety: DOES NOT remove Docker volumes.

DRY_RUN=0
AGGRESSIVE=0

usage() {
  cat <<'EOF'
Usage: cleanup-cache.sh [--dry-run] [--aggressive] [--help]

Options:
  --dry-run      Show what would run, but do not execute cleanup commands.
  --aggressive   Also run apt autoremove (more aggressive package cleanup).
  -h, --help     Show this help.

What it cleans:
  - Docker build cache, unused images, stopped containers, unused networks
  - Common package caches (apt/dnf/yum/apk/pacman, npm/pnpm/yarn, pip)

What it does NOT clean:
  - Docker volumes (data safety)
EOF
}

run_cmd() {
  local cmd="$*"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] $cmd"
  else
    eval "$cmd"
  fi
}

log() {
  printf '\n== %s ==\n' "$*"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1 ;;
    --aggressive) AGGRESSIVE=1 ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
  shift
done

log "Docker cleanup (no volumes)"
if command -v docker >/dev/null 2>&1; then
  run_cmd "docker system df || true"
  run_cmd "docker builder prune -af || true"
  run_cmd "docker image prune -af || true"
  run_cmd "docker container prune -f || true"
  run_cmd "docker network prune -f || true"
  run_cmd "docker system prune -af || true"
  run_cmd "docker system df || true"
else
  echo "Docker not found, skipped."
fi

log "Package cache cleanup"

# APT
if command -v apt-get >/dev/null 2>&1; then
  run_cmd "apt-get clean || true"
  run_cmd "apt-get autoclean -y || true"
  if [[ "$AGGRESSIVE" -eq 1 ]]; then
    run_cmd "apt-get autoremove -y || true"
  fi
  echo "APT done."
fi

# DNF / YUM
if command -v dnf >/dev/null 2>&1; then
  run_cmd "dnf clean all || true"
  echo "DNF done."
fi
if command -v yum >/dev/null 2>&1; then
  run_cmd "yum clean all || true"
  echo "YUM done."
fi

# APK
if command -v apk >/dev/null 2>&1; then
  run_cmd "apk cache clean || true"
  echo "APK done."
fi

# Pacman
if command -v pacman >/dev/null 2>&1; then
  run_cmd "yes | pacman -Scc || true"
  echo "Pacman done."
fi

# Node package managers
if command -v npm >/dev/null 2>&1; then
  run_cmd "npm cache clean --force || true"
  echo "NPM done."
fi
if command -v pnpm >/dev/null 2>&1; then
  run_cmd "pnpm store prune || true"
  echo "PNPM done."
fi
if command -v yarn >/dev/null 2>&1; then
  run_cmd "yarn cache clean || true"
  echo "Yarn done."
fi

# Python package managers
if command -v pip >/dev/null 2>&1; then
  run_cmd "pip cache purge || true"
  echo "pip done."
fi
if command -v pip3 >/dev/null 2>&1; then
  run_cmd "pip3 cache purge || true"
  echo "pip3 done."
fi

log "Finished"
echo "Done. (volumes untouched)"
