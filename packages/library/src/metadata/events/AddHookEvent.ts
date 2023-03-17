import type { HookType } from '../types';

export type AddHookEvent = {
  type: 'add_hook';
  testFilePath: string;
  hookType: HookType;
  hookId: string;
};
