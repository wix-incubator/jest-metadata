const fs = require('fs');
const path = require('path');
const CI = require('is-ci');

const artifactsDir = path.join(__dirname, '../artifacts');

const PRESET = (process.env.PRESET = process.env.PRESET || 'env-1');
const JEST_ENVIRONMENT = process.env.JEST_ENVIRONMENT || 'node';

if (CI) {
  const logsDir = path.join(artifactsDir, PRESET, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  process.env.JEST_BUNYAMIN_DIR = logsDir;
}

const mixins = {
  env: (custom = false) => ({
    testEnvironment: `${custom ? 'jest-metadata/environment-' : ''}${JEST_ENVIRONMENT}`,
  }),
  workers: (n) => ({
    maxWorkers: n,
  }),
  bail: (n) => ({
    bail: n,
    testMatch: [
      '<rootDir>/__tests__/bail/*.js',
    ],
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
  'no-reporter-1': {
    ...mixins.env(true),
    ...mixins.workers(1),
    reporters: ['default'],
  },
  'no-reporter-N': {
    ...mixins.env(true),
    ...mixins.workers(2),
    reporters: ['default'],
  },
  'no-env-1': {
    ...mixins.env(false),
    ...mixins.workers(1),
  },
  'no-env-N': {
    ...mixins.env(false),
    ...mixins.workers(2),
  },
  'bail-env-1': {
    ...mixins.env(true),
    ...mixins.workers(1),
    ...mixins.bail(1),
    testMatch: ['<rootDir>/__tests__/bail/bail-short.js'],
  },
  'bail-env-N': {
    ...mixins.env(true),
    ...mixins.workers(2),
    ...mixins.bail(1),
  },
  'bail-no-env-1': {
    ...mixins.env(false),
    ...mixins.workers(1),
    ...mixins.bail(1),
    testMatch: ['<rootDir>/__tests__/bail/bail-short.js'],
  },
  'bail-no-env-N': {
    ...mixins.env(false),
    ...mixins.workers(2),
    ...mixins.bail(1),
  },
};

/** @type {import('@jest/types').Config.InitialOptions}*/
module.exports = {
  rootDir: '.',
  collectCoverage: CI,
  coverageDirectory: path.join(artifactsDir, PRESET, 'coverage'),

  reporters: [
    'default',
    'jest-metadata/reporter',
    '<rootDir>/reporters/recorder'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/setup/recorder.js',
  ],
  testMatch: [
    '<rootDir>/__tests__/default/*.js',
  ],

  ...presets[PRESET],
};
