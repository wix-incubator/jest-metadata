#!/usr/bin/env bash

for file in $(find packages/fixtures -name "*.uml" -type f)
do
  echo "$file"
  plantuml "$file"
done
