// eslint-disable-next-line node/no-unpublished-import
import type { JestEnvironment } from '@jest/environment';
import globals from '../realms';

type Constructor<T> = new (...args: any[]) => T;

export default function CircusEnvironmentHOC<E extends Constructor<JestEnvironment>>(
  JestEnvironmentClass: E,
): E {
  return class MetadataCircusEnvironment extends JestEnvironmentClass {
    constructor(...args: any[]) {
      super(...args);
    }

    async setup() {
      await super.setup();
      // await globals.ipc.start();
      await globals.eventQueue.flush();
    }

    async teardown() {
      await super.teardown();
      // await globals.ipc.stop();
      await globals.eventQueue.flush();
    }
  };
}
