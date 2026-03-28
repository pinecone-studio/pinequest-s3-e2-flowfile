#!/bin/bash
set -e

FOLDER=$1

if [ -z "$FOLDER" ]; then
  echo "Usage: ./scripts/deploy.sh [api|web]"
  exit 1
fi

if [ "$FOLDER" != "api" ] && [ "$FOLDER" != "web" ]; then
  echo "Error: folder must be 'api' or 'web'"
  exit 1
fi

echo "Building $FOLDER..."
cd "$FOLDER"
yarn install --frozen-lockfile
yarn build
echo "$FOLDER build complete."