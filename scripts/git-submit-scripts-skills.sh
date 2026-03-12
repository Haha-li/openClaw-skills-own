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

# If scripts/ or skills/ changed, ensure README is updated in the same commit.
if ! git diff --quiet -- scripts/ skills/ || ! git diff --cached --quiet -- scripts/ skills/; then
  if git diff --quiet -- README.md && git diff --cached --quiet -- README.md; then
    TS="$(date -u +"%Y-%m-%d %H:%M UTC")"
    if ! grep -q "^## 提交记录（自动）" README.md 2>/dev/null; then
      {
        echo
        echo "## 提交记录（自动）"
      } >> README.md
    fi
    echo "- ${TS} - ${MSG}" >> README.md
    echo "README.md auto-updated for this submit."
  fi
fi

git add scripts/ skills/ README.md

if git diff --cached --quiet; then
  echo "No changes in scripts/, skills/, or README.md."
  exit 0
fi

git commit -m "$MSG"
git push origin "$BRANCH"

echo "Pushed scripts/ skills/ README.md to origin/$BRANCH"
