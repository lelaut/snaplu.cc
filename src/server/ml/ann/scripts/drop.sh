#!/usr/bin/env bash

usage() { echo "Usage: $0 [-c <string>] [-e <string>] [-i <string>]" 1>&2; exit 1; }

while getopts ":c:e:i:" o; do
    case "${o}" in
        c)
            c=${OPTARG}
            ;;
        e)
            e=${OPTARG}
            ;;
        i)
            i=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done

if [[ -nz "$c" && -z "$e" ]]; then
  path="collection"
  content="{\"collection_name\": \"$c\"}"
elif [[ -nz "$e" && -nz "$c"  ]]; then
  path="entities"
  content="{\"collection_name\": \"$c\",\"expr\": \"$e\"}"
elif [[ -nz "$i" && -nz "$c" ]]; then
  path="index"
  content="{\"collection_name\": \"$c\",\"field_name\": \"$i\"}"
else
  usage
fi

curl -X 'DELETE' \
  "http://localhost:9091/api/v1/$path" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "$content"