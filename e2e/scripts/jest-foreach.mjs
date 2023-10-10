#!/usr/bin/env node

import cp from 'child_process';

// Parsing command line arguments
const argv = process.argv.slice(2);
const params = {};

argv.forEach((arg) => {
  const [key, values] = arg.split('=');
  params[key] = values.split(',');
});

// Creating permutations
const getPermutations = (arrs) => {
  if (arrs.length === 0) return [[]];
  const [first, ...rest] = arrs;
  const suffixes = getPermutations(rest);
  return first.flatMap((value) => suffixes.map((suffix) => [value, ...suffix]));
};

const keys = Object.keys(params);
const values = Object.values(params);
const permutations = getPermutations(values);

// Running Jest with permutations
permutations.forEach((perm) => {
  console.log(`${keys.map((k, i) => `${k}=${perm[i]}`).join(' ')} jest`);

  try {
    cp.execSync(`jest --testFailureExitCode=0`, {
      stdio: 'inherit',
      env: {
        ...process.env,  // Preserve existing env vars
        ...Object.fromEntries(keys.map((k, i) => [k, perm[i]])), // Add our custom vars
      },
    });
  } catch (error) {
    console.error('Error executing Jest:', error.message);
    // Handle error as needed, e.g., exit process, log error, etc.
  }
});
