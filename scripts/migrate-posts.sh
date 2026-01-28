#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/home/joshsymonds/Personal/veraticus.github.com"
OUTPUT_DIR="$REPO_DIR/src/content/blog"

cd "$REPO_DIR"

mkdir -p "$OUTPUT_DIR"

# Get list of all post files from the source branch
files=$(git ls-tree --name-only origin/source:source/_posts/)

for filename in $files; do
  # Extract slug from filename: YYYY-MM-DD-slug.markdown -> slug
  slug=$(echo "$filename" | sed 's/^[0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}-//' | sed 's/\.markdown$//')

  echo "Migrating: $filename -> $slug.md"

  # Get the raw content
  raw=$(git show "origin/source:source/_posts/$filename")

  # Process the content with awk:
  # - In frontmatter: keep title and date, rename categories->tags, skip layout/comments
  # - In body: strip <!-- more --> lines
  echo "$raw" | awk '
    BEGIN {
      in_frontmatter = 0
      frontmatter_count = 0
    }
    /^---$/ {
      frontmatter_count++
      if (frontmatter_count == 1) {
        in_frontmatter = 1
        print "---"
        next
      }
      if (frontmatter_count == 2) {
        in_frontmatter = 0
        print "---"
        next
      }
    }
    in_frontmatter == 1 {
      # Skip layout and comments
      if ($0 ~ /^layout:/) next
      if ($0 ~ /^comments:/) next
      # Rename categories to tags
      if ($0 ~ /^categories:/) {
        sub(/^categories:/, "tags:", $0)
        print
        next
      }
      # Keep everything else (title, date, etc.)
      print
      next
    }
    # Body: skip <!-- more --> lines
    /^<!-- more -->$/ { next }
    { print }
  ' > "$OUTPUT_DIR/$slug.md"
done

echo ""
echo "Migration complete. $(echo "$files" | wc -l) posts migrated to $OUTPUT_DIR"
