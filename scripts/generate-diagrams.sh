#!/usr/bin/env bash

for file in $(find e2e/__fixtures__/29.x.x -name "*.uml" -type f)
do
  echo "$file"
  plantuml -tsvg "$file"
done
