const fs = require('fs');
const path = require('path');
const CI = require('is-ci');

const artifactsDir = path.join(__dirname, '../../artifacts');

const PRESET = process.env.PRESET || 'env-1';
const JEST_ENVIRONMENT = process.env.JEST_ENVIRONMENT || 'node';

if (CI) {
  const logsDir = path.join(artifactsDir, PRESET, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  process.env.JEST_METADATA_DEBUG = logsDir;
}

const mixins = {
  env: (custom = false) => ({
    testEnvironment: `${custom ? 'jest-metadata/environment-' : ''}${JEST_ENVIRONMENT}`,
  }),
  workers: (n) => ({
    maxWorkers: n,
  }),
};

const presets = {
  'env-1': {
    ...mixins.env(true),
    ...mixins.workers(1),
  },
  'env-N': {
    ...mixins.env(true),
    ...mixins.workers(2),
  },
  'no-env-1': {
    ...mixins.env(false),
    ...mixins.workers(1),
  },
  'no-env-N': {
    ...mixins.env(false),
    ...mixins.workers(2),
  },
};

/** @type {import('@jest/types').Config.InitialOptions}*/
module.exports = {
  collectCoverage: CI,
  coverageDirectory: path.join(artifactsDir, PRESET, 'coverage'),

  reporters: [
    'default',
    '<rootDir>/mockReporter'
  ],

  testMatch: [
    '<rootDir>/__tests__/*.js',
    PRESET.startsWith('no-env')
      ? '<rootDir>/__tests__/no-env/*.js'
      : '<rootDir>/__tests__/env-only/*.js',
  ],

  ...presets[PRESET],
};
