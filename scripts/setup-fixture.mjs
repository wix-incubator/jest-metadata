#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const jestVersion = process.env.JEST_VERSION || 'latest';
console.log(`Setting jest@${jestVersion}\n`);

const recorderRootDir = path.join(process.cwd(), 'packages/recorder')
const recorderManifestPath = path.join(recorderRootDir, 'package.json');
const recorderManifest = JSON.parse(fs.readFileSync(recorderManifestPath, 'utf8'));
Object.assign(recorderManifest.devDependencies, {
  "jest": jestVersion,
  "jest-environment-jsdom": jestVersion,
  "jest-metadata": "file:jest-metadata.tgz",
});
fs.writeFileSync(recorderManifestPath, JSON.stringify(recorderManifest, null, 2) + '\n');
