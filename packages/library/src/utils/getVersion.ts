import fs from 'node:fs';
import path from 'node:path';

import memoize from 'lodash.memoize';

export const getVersion = memoize(() => {
  const packageJsonPath = path.join(__dirname, '../../package.json');
  const packageJsonRaw = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonRaw);
  return packageJson.version;
});
