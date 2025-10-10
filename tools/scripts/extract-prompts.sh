#!/bin/bash

# Extract Midjourney prompts from markdown files
# Usage: ./extract-prompts.sh [filename]

if [ $# -eq 0 ]; then
    echo "Usage: $0 <markdown-file>"
    echo "Example: $0 03-deep-time-long-format/05-first-rain/midjourney-prompts-first-rain.md"
    exit 1
fi

input_file="$1"
base_name=$(basename "$input_file" .md)
output_file="${base_name}-extracted.txt"

if [ ! -f "$input_file" ]; then
    echo "Error: File '$input_file' not found!"
    exit 1
fi

echo "Extracting prompts from: $input_file"

# Extract content between backticks (for formatted prompts)
# This handles prompts that are wrapped in backticks like `prompt text`
if grep -q '`[^`]*`' "$input_file"; then
    echo "Detected prompts wrapped in backticks..."
    grep -o '`[^`]*`' "$input_file" | sed 's/`//g' > "$output_file"
else
    # Fallback to original method for lines starting with Hyperrealistic or Photorealistic
    echo "Using standard extraction method..."
    grep -E '^(Hyperrealistic|Photorealistic)' "$input_file" > "$output_file"
fi

# Count the prompts
count=$(wc -l < "$output_file")

echo "✅ Extracted $count prompts to: $output_file"
echo ""
echo "Next steps:"
echo "1. Open $output_file"
echo "2. Copy all content (Cmd+A, Cmd+C)"
echo "3. Paste into the Chrome extension"
echo ""
echo "Preview of first 3 prompts:"
head -n 3 "$output_file"