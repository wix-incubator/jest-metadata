#!/usr/bin/env bash

update() {
  export JEST_VERSION="$1"
  scripts/setup-fixture.mjs
  npm install
  npm run build
}

update 27.x.x
update 28.x.x
update 29.x.x

JEST_VERSION=latest scripts/setup-fixture.mjs
