import { createClient, createServer } from './index';

describe('jest-extend-report', () => {
  it('should be importable', () => {
    const server = createServer({ foo: 'hello' });
    expect(server).toBeDefined();
    const client = createClient();
    expect(client).toBeDefined();
  });
});
