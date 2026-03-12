#!/usr/bin/env bash
set -Eeuo pipefail

REPO_DIR="${1:-/root/.openclaw/workspace}"
REMOTE_URL="git@github.com:Haha-li/openClaw-skills-own.git"
BRANCH="main"
MSG="${2:-chore: sync scripts and skills}"

cd "$REPO_DIR"

# Ensure origin
if git remote get-url origin >/dev/null 2>&1; then
  CUR_URL="$(git remote get-url origin)"
  if [ "$CUR_URL" != "$REMOTE_URL" ]; then
    git remote set-url origin "$REMOTE_URL"
  fi
else
  git remote add origin "$REMOTE_URL"
fi

# Ensure branch
if git show-ref --verify --quiet refs/heads/$BRANCH; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git pull --rebase origin "$BRANCH" || true

git add scripts/ skills/

if git diff --cached --quiet; then
  echo "No changes in scripts/ or skills/."
  exit 0
fi

git commit -m "$MSG"
git push origin "$BRANCH"

echo "Pushed scripts/ and skills/ to origin/$BRANCH"
