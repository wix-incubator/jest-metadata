import fixtures from '../../../e2e';

import { visualize } from '../../debug';

describe('metadata - integration test:', () => {
  test.each(Object.values(fixtures.metadata))(
    `e2e/__fixtures__/%s`,
    async (_name: string, fixture: any[]) => {
      await expect(visualize(fixture)).resolves.toMatchSnapshot();
    },
  );
});
