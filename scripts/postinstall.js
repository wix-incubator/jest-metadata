#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const process = require('node:process');

const instances = [];

for (let cwd = process.cwd(); cwd !== path.dirname(cwd); cwd = path.dirname(cwd)) {
  const anotherInstance = path.join(cwd, 'node_modules', 'jest-metadata');
  if (fs.existsSync(anotherInstance)) {
    instances.push(anotherInstance);
  }
}

if (instances.length > 1) {
  process.exitCode = 1;

  console.error('\x1b[31m%s\x1b[0m', [
    '[jest-metadata] postinstall script failed!',
    'More than one instance of jest-metadata has been installed:',
    ...instances.map((dir) => `- ${dir}`),
    'Please flatten your package-lock.json or yarn.lock file to resolve this issue.',
  ].join('\n'));
}
