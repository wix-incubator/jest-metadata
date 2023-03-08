import { EventQueue, InstanceCache } from '../services';

export class CircusTestEventHandlerConfig {
  private describeInstances = new InstanceCache();
  private hookInstances = new InstanceCache();
  private testInstances = new InstanceCache();

  constructor(public readonly eventQueue: EventQueue) {}

  reset() {
    this.describeInstances = new InstanceCache();
    this.hookInstances = new InstanceCache();
    this.testInstances = new InstanceCache();
  }

  getDescribeId(block: object) {
    return `describe.${this.describeInstances.getInstanceId(block)}`;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  getHookId(fn: Function): string {
    return `hook.${this.hookInstances.getInstanceId(fn)}`;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  getTestId(fn: Function): string {
    return `test.${this.testInstances.getInstanceId(fn)}`;
  }
}
