#!/usr/bin/env bash

# SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

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

if [[ -nz "$c" && -nz "$e" && -nz "$i" ]]; then
  usage
fi

if [[ -nz "$c" ]]; then
  content=$( cat $c )
  path="collection"
elif [[ -nz "$e" ]]; then
  content=$( cat $e )
  path="entities"
elif [[ -nz "$i" ]]; then
  content=$( cat $i )
  path="index"
else
  usage
fi

curl -X 'POST' \
  "http://localhost:9091/api/v1/$path" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d "$content"
