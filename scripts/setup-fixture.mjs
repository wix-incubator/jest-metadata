#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const recorderRootDir = path.join(process.cwd(), 'packages/recorder')
const recorderManifestPath = path.join(recorderRootDir, 'package.json');
const recorderManifest = JSON.parse(fs.readFileSync(recorderManifestPath, 'utf8'));
const jestVersion = process.env.JEST_VERSION || 'latest';
recorderManifest.devDependencies.jest = jestVersion;
Object.assign({
  "jest": jestVersion,
  "jest-environment-jsdom": jestVersion,
});

console.log(`Setting jest@${jestVersion}\n`);
