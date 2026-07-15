#!/usr/bin/env bash
#
# Compress the intro video for the web. Run locally (needs ffmpeg installed).
#   macOS:  brew install ffmpeg
#   Ubuntu: sudo apt-get install ffmpeg
#
# Usage:  ./scripts/compress-intro.sh [input.mp4]
# Default input: public/assets/intro.mp4  (overwritten in place after a backup)
#
# Produces an H.264 MP4 (broad support, faststart for instant start) and a
# smaller VP9 WebM. Scaled so the shorter side is at most 1280px — plenty for
# the ≤440px phone column, even at 2x retina.

set -euo pipefail

IN="${1:-public/assets/intro.mp4}"
DIR="$(dirname "$IN")"
BASE="$(basename "${IN%.*}")"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install it first (brew install ffmpeg / apt-get install ffmpeg)." >&2
  exit 1
fi

echo "Input:  $IN ($(du -h "$IN" | cut -f1))"
cp "$IN" "$DIR/$BASE.original.mp4"
echo "Backup: $DIR/$BASE.original.mp4"

# H.264 MP4 — CRF 28 is a good size/quality tradeoff for soft footage.
ffmpeg -y -i "$IN" \
  -vf "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease" \
  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p \
  -movflags +faststart -an \
  "$DIR/$BASE.opt.mp4"

# VP9 WebM — typically ~30% smaller again; used as a <source> before the mp4.
ffmpeg -y -i "$IN" \
  -vf "scale='min(1280,iw)':'min(1280,ih)':force_original_aspect_ratio=decrease" \
  -c:v libvpx-vp9 -crf 34 -b:v 0 -an \
  "$DIR/$BASE.webm"

mv "$DIR/$BASE.opt.mp4" "$IN"

echo ""
echo "Done:"
echo "  MP4:  $IN ($(du -h "$IN" | cut -f1))"
echo "  WebM: $DIR/$BASE.webm ($(du -h "$DIR/$BASE.webm" | cut -f1))"
echo ""
echo "To also serve the WebM (smaller), add it as a <source> before the mp4 in"
echo "src/components/IntroVideo.tsx:"
echo '  <source src="/assets/intro.webm" type="video/webm" />'
echo '  <source src="/assets/intro.mp4" type="video/mp4" />'
