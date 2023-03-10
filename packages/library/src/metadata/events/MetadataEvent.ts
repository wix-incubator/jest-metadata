import { AddHookEvent } from './AddHookEvent';
import { AddTestEvent } from './AddTestEvent';
import { FinishDescribeDefinitionEvent } from './FinishDescribeDefinitionEvent';
import { HookFailureEvent } from './HookFailureEvent';
import { HookStartEvent } from './HookStartEvent';
import { HookSuccessEvent } from './HookSuccessEvent';
import { RunDescribeFinishEvent } from './RunDescribeFinishEvent';
import { RunDescribeStartEvent } from './RunDescribeStartEvent';
import { RunFinishEvent } from './RunFinishEvent';
import { RunStartEvent } from './RunStartEvent';
import { SetMetadataEvent } from './SetMetadataEvent';
import { StartDescribeDefinitionEvent } from './StartDescribeDefinitionEvent';
import { TestDoneEvent } from './TestDoneEvent';
import { TestEnvironmentCreatedEvent } from './TestEnvironmentCreatedEvent';
import { TestFnFailureEvent } from './TestFnFailureEvent';
import { TestFnStartEvent } from './TestFnStartEvent';
import { TestFnSuccessEvent } from './TestFnSuccessEvent';
import { TestRetryEvent } from './TestRetryEvent';
import { TestSkipEvent } from './TestSkipEvent';
import { TestStartEvent } from './TestStartEvent';
import { TestTodoEvent } from './TestTodoEvent';

export type MetadataEvent =
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
  | SetMetadataEvent
  | StartDescribeDefinitionEvent
  | TestDoneEvent
  | TestEnvironmentCreatedEvent
  | TestFnFailureEvent
  | TestFnStartEvent
  | TestFnSuccessEvent
  | TestRetryEvent
  | TestSkipEvent
  | TestStartEvent
  | TestTodoEvent;

export type MetadataEventType = MetadataEvent['type'];
