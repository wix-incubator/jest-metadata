const fs = require('fs');
const path = require('path');
const CI = require('is-ci');

const artifactsDir = path.join(__dirname, '../../artifacts');

const PRESET = process.env.PRESET || 'env-1';

if (CI) {
  const logsDir = path.join(artifactsDir, PRESET, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  process.env.JEST_METADATA_DEBUG = logsDir;
}

const mixins = {
  env: () => ({
    testEnvironment: 'jest-metadata/environment-node',
  }),
  workers: (n) => ({
    maxWorkers: n,
  }),
};

const presets = {
  'env-1': {
    ...mixins.env(),
    ...mixins.workers(1),
  },
  'env-N': {
    ...mixins.env(),
    ...mixins.workers(2),
  },
  'no-env-1': {
    ...mixins.workers(1),
  },
  'no-env-N': {
    ...mixins.workers(2),
  },
};

module.exports = {
  collectCoverage: CI,
  coverageDirectory: path.join(artifactsDir, PRESET, 'coverage'),

  reporters: [
    'default',
    '<rootDir>/mockReporter'
  ],

  ...presets[PRESET],
};
