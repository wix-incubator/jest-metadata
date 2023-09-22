#!/usr/bin/env bash

set -e
set -x

go_root() {
  cd $(git rev-parse --show-toplevel)
}

prepare_fixtures() {
  go_root
  yarn workspace jest-metadata build
  yarn workspace jest-metadata instrument
  yarn workspace jest-metadata pack
  mv packages/library/package.tgz packages/recorder/jest-metadata.tgz
  git clean -xdf 'node_modules' '**/node_modules'
}

build_fixtures() {
  go_root
  scripts/setup-fixture.mjs
  cd packages/recorder
  rm -rf node_modules
  npm install --workspaces=false
  npm run build
  git checkout -- package.json
}

prepare_fixtures

if [ -z "$JEST_VERSION" ]; then
  # Iterate over Jest versions
  for version in 27.x.x 28.x.x 29.x.x; do
    export JEST_VERSION="$version"
    build_fixtures
  done
else
  # If JEST_VERSION is set, run build_fixtures once
  build_fixtures
fi
