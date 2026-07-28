#!/bin/bash
# Deploy script for GambleHub
# Deploys to both GitHub Pages (via Actions) and Vercel in one command.
# Usage: ./deploy.sh
#        npm run deploy

set -e

echo "=== GambleHub Deploy to GitHub Pages + Vercel ==="
echo ""

# --- Git commit ---
echo "1/4 Committing changes..."
git add -A

if git diff --cached --quiet; then
  echo "   No staged changes, nothing to commit."
else
  commit_msg="chore: deploy - $(date +'%Y-%m-%d %H:%M:%S')"
  echo "   Commit: $commit_msg"
  git commit -m "$commit_msg"
fi

# --- Push to GitHub Pages (triggers GitHub Actions) ---
echo ""
echo "2/4 Pushing to origin/main (triggers GitHub Pages + Vercel auto-deploy)..."
git push origin main

# --- Vercel deploy (optional, if CLI is installed and project is linked) ---
if command -v vercel &>/dev/null; then
  echo ""
  echo "3/4 Deploying to Vercel (production)..."
  vercel --prod || echo "   Vercel production deploy skipped (not linked or auth issue)."
else
  echo ""
  echo "3/4 Vercel CLI not installed. Skipping explicit Vercel deploy."
  echo "   If Vercel auto-deploy is connected to this repo, Vercel will"
  echo "   also deploy from the GitHub push above."
fi

# --- Done ---
echo ""
echo "=== Deploy Triggered ==="
echo "   GitHub Pages: https://314pap.github.io/GAMBLE-HUB/"
echo "   GH Actions:   https://github.com/314pap/GAMBLE-HUB/actions"
echo "   Vercel:       (check https://vercel.com/314pap/GAMBLE-HUB for status)"
echo ""
echo "   If you want to install Vercel CLI for direct deploys:"
echo "     npm install -g vercel"
echo "     vercel link"
