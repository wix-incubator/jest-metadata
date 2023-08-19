const { metadata } = require('jest-metadata');

describe('suite', () => {
  beforeAll(() => {
    metadata.set('note', 'beforeAll');
  });

  describe('inner suite', () => {
    beforeAll(() => {
      metadata.set('note', 'beforeAll inner');
    });

    test.todo('should todo');

    afterAll(() => {
      metadata.set('note', 'afterAll inner');
    });
  });

  afterAll(() => {
    metadata.set('note', 'afterAll');
  });
});
