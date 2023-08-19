import fs from 'fs';
import path from 'path';
import { fileURLToPath  } from 'url';
import module from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = module.createRequire(import.meta.url);

const fixtures = require('../packages/library/src/metadata/__tests__/__snapshots__/integration.test.ts.snap');

for (const [name, fixture] of Object.entries(fixtures)) {
  const fixturePath = path.join(__dirname, '../packages', name.split(':')[1].trim().replace(/\s+\d+$/, '') + '.uml');
  fs.writeFileSync(fixturePath, fixture.trim().replace(/^"/, '').split('\n').slice(0, -1).join('\n').trim() + '\n');
}

