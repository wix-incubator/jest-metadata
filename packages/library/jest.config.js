/** @type {import('@jest/types').Config} */
module.exports = {
  preset: 'ts-jest',
  // testEnvironment: '<rootDir>/__utils__/testEnvironment.js',
  // reporters: [
  //   'default',
  //   '<rootDir>/__utils__/testReporter.js',
  // ],
  testMatch: [
    '<rootDir>/src/**/*.test.{js,ts}',
    '<rootDir>/src/__tests__/**/*.{js,ts}'
  ],
};
