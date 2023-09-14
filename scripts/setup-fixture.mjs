#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const jestVersion = process.env.JEST_VERSION || 'latest';
console.log(`Setting jest@${jestVersion}\n`);

const recorderRootDir = path.join(process.cwd(), 'packages/recorder')
const recorderManifestPath = path.join(recorderRootDir, 'package.json');
const recorderManifest = JSON.parse(fs.readFileSync(recorderManifestPath, 'utf8'));
recorderManifest.devDependencies.jest = jestVersion;
fs.writeFileSync(recorderManifestPath, JSON.stringify(recorderManifest, null, 2) + '\n');

const libraryRootDir = path.join(process.cwd(), 'packages/library')
const libraryManifestPath = path.join(libraryRootDir, 'package.json');
const libraryManifest = JSON.parse(fs.readFileSync(libraryManifestPath, 'utf8'));
Object.assign({
  "@jest/environment": jestVersion,
  "@jest/reporters": jestVersion,
  "@jest/types": jestVersion,
  "@types/jest": jestVersion,
  "jest": jestVersion,
  "jest-environment-jsdom": jestVersion,
  "jest-environment-node": jestVersion,
  "ts-jest": jestVersion,
});

fs.writeFileSync(libraryManifestPath, JSON.stringify(libraryManifest, null, 2) + '\n');
