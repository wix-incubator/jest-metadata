import type { AddHookEvent } from './AddHookEvent';
import type { AddTestEvent } from './AddTestEvent';
import type { AddTestFileEvent } from './AddTestFileEvent';
import type { FinishDescribeDefinitionEvent } from './FinishDescribeDefinitionEvent';
import type { HookFailureEvent } from './HookFailureEvent';
import type { HookStartEvent } from './HookStartEvent';
import type { HookSuccessEvent } from './HookSuccessEvent';
import type { RunDescribeFinishEvent } from './RunDescribeFinishEvent';
import type { RunDescribeStartEvent } from './RunDescribeStartEvent';
import type { RunFinishEvent } from './RunFinishEvent';
import type { RunStartEvent } from './RunStartEvent';
import type { SetupEvent } from './SetupEvent';
import type { StartDescribeDefinitionEvent } from './StartDescribeDefinitionEvent';
import type { TestDoneEvent } from './TestDoneEvent';
import type { TestFnFailureEvent } from './TestFnFailureEvent';
import type { TestFnStartEvent } from './TestFnStartEvent';
import type { TestFnSuccessEvent } from './TestFnSuccessEvent';
import type { TestRetryEvent } from './TestRetryEvent';
import type { TestSkipEvent } from './TestSkipEvent';
import type { TestStartedEvent } from './TestStartedEvent';
import type { TestStartEvent } from './TestStartEvent';
import type { TestTodoEvent } from './TestTodoEvent';
import type { WriteMetadataEvent } from './WriteMetadataEvent';

export type MetadataEvent =
  | SetupEvent
  | AddHookEvent
  | AddTestEvent
  | FinishDescribeDefinitionEvent
  | HookFailureEvent
  | HookStartEvent
  | HookSuccessEvent
  | RunDescribeFinishEvent
  | RunDescribeStartEvent
  | RunFinishEvent
  | RunStartEvent
  | WriteMetadataEvent
  | StartDescribeDefinitionEvent
  | TestDoneEvent
  | AddTestFileEvent
  | TestFnFailureEvent
  | TestFnStartEvent
  | TestFnSuccessEvent
  | TestRetryEvent
  | TestSkipEvent
  | TestStartEvent
  | TestStartedEvent
  | TestTodoEvent;

export type MetadataEventType = MetadataEvent['type'];
