#!/usr/bin/env bash

usage() { echo "Usage: $0 <string>" 1>&2; exit 1; }

if [[ -z "$1" ]]; then
  usage
fi

curl -X 'GET' \
  'http://localhost:9091/api/v1/collection' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "{
    \"collection_name\": \"$1\"
  }"