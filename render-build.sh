#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Inizio build su Render..."

# Installa le dipendenze Node.js
npm install

# Imposta la cache di Puppeteer
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Installa Chromium completo tramite Puppeteer
npx puppeteer browsers install chrome

echo "✅ Build completata"
