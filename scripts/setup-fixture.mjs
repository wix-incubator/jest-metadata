#!/usr/bin/env node

import 'zx/globals';

const recorderRootDir = path.join(process.cwd(), 'packages/recorder')
const recorderManifestPath = path.join(recorderRootDir, 'package.json');
const recorderManifest = JSON.parse(fs.readFileSync(recorderManifestPath, 'utf8'));
const jestVersion = process.env.JEST_VERSION || 'latest';
recorderManifest.devDependencies.jest = jestVersion;
fs.writeFileSync(recorderManifestPath, JSON.stringify(recorderManifest, null, 2) + '\n');

console.log(`Setting jest@${chalk.red(jestVersion)}\n`);
