import type { Config } from '@jest/reporters';

export function isSingleWorker(config: Config.GlobalConfig) {
  return config.runInBand || config.maxWorkers === 1;
}

export function isInsideIDE(config: Config.GlobalConfig) {
  const isSingleReporter = config.reporters && config.reporters.length === 1;
  const singleReporter = isSingleReporter ? (config.reporters?.[0]?.[0] ?? '') : '';
  return /jest-intellij/i.test(singleReporter);
}
