#!/bin/sh
set -eu

if [ ! -f dist/sitemap.xml ]; then
  echo "dist/sitemap.xml is missing; build the SEO preview first." >&2
  exit 1
fi

CADDY_TEST_PORT="${CADDY_TEST_PORT:-18181}"
TEST_CADDY_DIR="$(mktemp -d)"
CONTAINER_NAME="heatingpump-seo-caddy-$$"

cleanup() {
  docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
  rm -rf "$TEST_CADDY_DIR"
}
trap cleanup EXIT HUP INT TERM

cat > "$TEST_CADDY_DIR/Caddyfile" <<'EOF'
:8080 {
	root * /srv/site
	try_files {path} {path}/
	file_server
}
EOF

docker run --rm --detach \
  --name "$CONTAINER_NAME" \
  --publish "127.0.0.1:${CADDY_TEST_PORT}:8080" \
  --volume "$PWD/dist:/srv/site:ro" \
  --volume "$TEST_CADDY_DIR/Caddyfile:/etc/caddy/Caddyfile:ro" \
  caddy:2-alpine >/dev/null

known_status=""
for attempt in $(seq 1 30); do
  known_status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
    "http://127.0.0.1:${CADDY_TEST_PORT}/knowledge/cop-i-scop/" || true)"
  [ "$known_status" = "200" ] && break
  sleep 1
done

unknown_status="$(curl --silent --output /dev/null --write-out '%{http_code}' \
  "http://127.0.0.1:${CADDY_TEST_PORT}/not-a-real-page/" || true)"

printf 'Known prerendered article: HTTP %s (expected 200)\n' "$known_status"
printf 'Unknown route: HTTP %s (expected 404)\n' "$unknown_status"

[ "$known_status" = "200" ] && [ "$unknown_status" = "404" ]
