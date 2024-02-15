#!/usr/bin/env bash

set -e

TEMP_DIR=$(mktemp -d)
cp package.tar.gz $TEMP_DIR
rm -rf $TEMP_DIR/package-e2e
cp -r package-e2e $TEMP_DIR/package-e2e

cd $TEMP_DIR/package-e2e
npm install
npm test
