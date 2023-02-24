export type AddHookEvent = {
  type: 'add_hook';
  testFilePath: string;
  hookType: 'beforeAll' | 'beforeEach' | 'afterEach' | 'afterAll';
  hookId: string;
};
