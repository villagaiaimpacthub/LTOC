#!/bin/bash

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not in a git repository"
    exit 1
fi

# Add all changes
git add .

# Check if there are changes to commit
if git diff-index --quiet HEAD --; then
    echo "No changes to commit"
else
    # Commit with a default message or use the provided message
    if [ $# -eq 0 ]; then
        git commit -m "Update: $(date '+%Y-%m-%d %H:%M:%S')"
    else
        git commit -m "$*"
    fi
fi

# Push to GitHub
git push

echo "Push to GitHub complete!"