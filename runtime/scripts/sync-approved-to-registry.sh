#!/bin/bash
# Simple sync skeleton for approved assets into DAM + registry + Vercel
# Run after human approval

echo "Syncing approved assets..."
# 1. Ingest to Immich/ResourceSpace or local DAM
# 2. Update asset-registry.json with new usedIn if publishing
# 3. Upload to Vercel Blob or copy to site public/assets
# 4. Commit manifest updates

echo "Example: node sync-to-vercel.js --brand frankx --job <jobId>"
echo "Always update usedIn for the exact site/profile/post."
