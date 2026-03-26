#!/usr/bin/env bash
# exit on error
set -o errexit

# Installa tutte le dipendenze
npm install

# Assicurati che la cache di Puppeteer esista
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Installa Chromium tramite Puppeteer
npx puppeteer browsers install chrome

# Copia il browser nella cache per futuri deploy
cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR || true
