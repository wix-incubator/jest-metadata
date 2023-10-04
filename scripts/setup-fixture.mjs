#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const jestVersion = process.env.JEST_VERSION || 'latest';
console.log(`Setting jest@${jestVersion}\n`);

const e2eRootDir = path.join(process.cwd(), 'e2e')
const e2eManifestPath = path.join(e2eRootDir, 'package.json');
const e2eManifest = JSON.parse(fs.readFileSync(e2eManifestPath, 'utf8'));
Object.assign(e2eManifest.devDependencies, {
  "jest": jestVersion,
  "jest-environment-jsdom": jestVersion,
  "jest-metadata": "file:../package.tar.gz",
});

fs.writeFileSync(e2eManifestPath, JSON.stringify(e2eManifest, null, 2) + '\n');
