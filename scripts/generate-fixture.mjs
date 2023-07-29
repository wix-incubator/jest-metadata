#!/usr/bin/env node

import 'zx/globals';

const recorderRootDir = path.join(process.cwd(), 'packages/recorder')
const recorderManifestPath = path.join(recorderRootDir, 'package.json');
const recorderManifest = JSON.parse(fs.readFileSync(recorderManifestPath, 'utf8'));
recorderManifest.dependencies.jest = process.env.JEST_VERSION || 'latest';
fs.writeFileSync(recorderManifestPath, JSON.stringify(recorderManifest, null, 2) + '\n');

await $`lerna bootstrap`;
await $`lerna run build --scope @jest-metadata/recorder --stream`;
