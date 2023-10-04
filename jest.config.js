const CI = require('is-ci');

/** @type {import('@jest/types').Config} */
module.exports = {
  collectCoverage: CI,
  coverageDirectory: '../../artifacts/unit/coverage',
  preset: 'ts-jest',
  testMatch: [
    '<rootDir>/src/**/*.test.{js,ts}',
    '<rootDir>/src/__tests__/**/*.{js,ts}'
  ],
};
