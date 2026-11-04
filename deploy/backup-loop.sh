#!/bin/sh
set -eu

backup_dir=/backups
mkdir -p "$backup_dir"

while :; do
  find "$backup_dir" -type f -name 'heatingpump-*.sql.gz' -mmin +43199 -delete
  find "$backup_dir" -type f -name '.heatingpump-*.sql*' -mmin +1440 -delete
  sleep 60
done &

while :; do
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  tmp="$backup_dir/.heatingpump-$stamp.sql"
  compressed="$tmp.gz"
  final="$backup_dir/heatingpump-$stamp.sql.gz"
  if pg_dump --host=db --username="$DB_USER" --dbname="$DB_NAME" --no-owner --no-acl > "$tmp" && gzip -c "$tmp" > "$compressed"; then
    rm -f "$tmp"
    mv "$compressed" "$final"
  else
    rm -f "$tmp" "$compressed"
    echo "Database backup failed." >&2
  fi

  sleep 86400
done
