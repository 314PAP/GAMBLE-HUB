#!/bin/bash
# Deploy script for GambleHub
# Stages all changes, commits with a generic message, and pushes to main.
# The push triggers the GitHub Actions workflow that builds and deploys to GitHub Pages.

set -e

echo "=== Adding all changes ==="
git add -A

# If there is nothing to commit, exit gracefully
if git diff --cached --quiet; then
  echo "No changes to commit. Exiting."
  exit 0
fi

# Create a commit (you can edit the message if you want a custom one)
commit_msg="chore: deploy - $(date +'%Y-%m-%d %H:%M:%S')"

echo "=== Creating commit: $commit_msg ==="
git commit -m "$commit_msg"

# Push to remote main branch
echo "=== Pushing to origin/main ==="
git push origin main

echo "=== Deploy triggered. Check GitHub Actions for build status. ==="
