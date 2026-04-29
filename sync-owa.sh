#!/bin/bash
# Sync OWA source -> OpenMRS deployed folder
# Usage:
#   ./sync-owa.sh           # copy HTML/CSS/img/manifest + existing build/ bundle
#   ./sync-owa.sh --build   # run webpack first (rebuild app.js), then copy everything
#   ./sync-owa.sh --help

set -e

SRC="C:/Work/Virtual_Hospital/openmrs-module-bedmanagement/owa"
DEST="C:/openmrs/data/owa/bedmanagement"

show_help() {
    cat <<EOF
sync-owa.sh — copy bedmanagement OWA changes to the running OpenMRS server

Source : $SRC
Target : $DEST

Usage:
  ./sync-owa.sh           Fast sync (HTML/CSS/img/manifest + existing build/)
  ./sync-owa.sh --build   Run webpack first, then sync everything
  ./sync-owa.sh --help    Show this help

After running, hard-refresh the browser (Ctrl+F5).
Note: changes are wiped if Tomcat restarts (the .omod re-extracts on startup).
EOF
}

case "$1" in
    -h|--help) show_help; exit 0 ;;
esac

if [ ! -d "$SRC" ]; then
    echo "ERROR: source folder not found: $SRC" >&2
    exit 1
fi
if [ ! -d "$DEST" ]; then
    echo "ERROR: deployed folder not found: $DEST" >&2
    echo "Has the bedmanagement OWA been installed in OpenMRS?" >&2
    exit 1
fi

if [ "$1" = "--build" ] || [ "$1" = "-b" ]; then
    echo "==> webpack build (one-shot)..."
    (cd "$SRC" && ./node_modules/.bin/webpack -d)
    echo
fi

echo "==> Syncing static assets..."
cp "$SRC/app/"*.html         "$DEST/"
cp "$SRC/app/manifest.webapp" "$DEST/"
mkdir -p "$DEST/css" "$DEST/img"
cp -r "$SRC/app/css/."  "$DEST/css/"
cp -r "$SRC/app/img/."  "$DEST/img/"

if [ -d "$SRC/build" ] && ls "$SRC/build/"*.js >/dev/null 2>&1; then
    echo "==> Syncing build/ bundle..."
    mkdir -p "$DEST/build"
    cp "$SRC/build/"*.js "$DEST/build/"
else
    echo "==> Skipping build/ (no bundle found — run with --build first time)"
fi

echo
echo "Done. Hard-refresh the browser (Ctrl+F5)."
