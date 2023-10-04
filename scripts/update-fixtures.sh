#!/usr/bin/env bash

set -e
set -x

go_root() {
  cd $(git rev-parse --show-toplevel)
}

build_fixtures() {
  scripts/setup-fixture.mjs
  cd e2e
  rm -rf node_modules
  npm install
  npm run build
  go_root
}

restore_fixtures() {
  cd e2e
  rm -rf node_modules
  git checkout -- package.json
  npm install
  go_root
}

if [ -z "$JEST_VERSION" ]; then
  npm run build:e2e

  # Iterate over Jest versions
  for version in 27.x.x 28.x.x 29.x.x; do
    export JEST_VERSION="$version"
    build_fixtures
  done

  restore_fixtures
  npx jest -u
else
  # If JEST_VERSION is set, run build_fixtures once
  build_fixtures
fi
