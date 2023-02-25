#!/usr/bin/env bash

usage() { echo "Usage: $0 <string>" 1>&2; exit 1; }

if [[ -z "$1" ]]; then
  usage
fi

name=$(grep -o '"collection_name": *"[^"]*"' $1 | grep -o '"[^"]*"$')
if [[ -z "$name" ]]; then
  echo "'collection_name' not found in $1 file"
  exit 1
fi

curl -X 'POST' \
  'http://localhost:9091/api/v1/collection/load' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "{
    \"collection_name\": $name
  }"

# Milvus is bugged :( need to await for a bit here, otherwise it will
# think that the collection was not loaded into memory.
sleep 1

content=$( cat $1 )
curl -X 'POST' \
  'http://localhost:9091/api/v1/search' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "$content"

curl -X 'DELETE' \
  'http://localhost:9091/api/v1/collection/load' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "{
    \"collection_name\": $name
  }"