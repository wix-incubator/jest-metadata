import { Ref } from '../../state';
import { Event } from '../../events';

export interface ContextAPI {
  createRef(instance: object): Ref;
  emit<T extends Event>(event: T): void;
  flush(): Promise<void>;
}
