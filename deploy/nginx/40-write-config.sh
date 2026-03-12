#!/bin/sh
set -eu

cat <<EOF >/usr/share/nginx/html/config.js
window.__APP_CONFIG__ = {
  VITE_API_BASE_URL: "${VITE_API_BASE_URL:-/api}",
  VITE_WS_URL: "${VITE_WS_URL:-}",
  VITE_WS_PATH: "${VITE_WS_PATH:-/socket.io}",
  VITE_DEFAULT_GAME_DATE: "${VITE_DEFAULT_GAME_DATE:-}",
  VITE_DEMO_GAME_DATE: "${VITE_DEMO_GAME_DATE:-}",
  VITE_DEMO_CHAT_GAME_ID: "${VITE_DEMO_CHAT_GAME_ID:-}"
};
EOF
