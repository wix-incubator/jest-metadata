export type HookFailureEvent = {
  type: 'hook_failure';
  testFilePath: string;
  hookId: string;
};
