#!/bin/bash
set -e

FILE="./apps/web/src/config/version.json"

# Make sure jq is installed
if ! command -v jq &> /dev/null; then
  echo "jq is required but not installed. Install it first."
  exit 1
fi

# Increment minor version by 1
jq '.minor += 1' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

echo "Minor version incremented:"
cat "$FILE"
