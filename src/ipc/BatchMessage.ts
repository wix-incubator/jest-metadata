import type { MetadataEvent } from '../metadata';

export type BatchMessage = {
  /** The batch of messages. */
  batch: MetadataEvent[];
  /** Whether this is the first batch of messages. */
  first?: boolean;
  /** Whether this is the last batch of messages. */
  last?: boolean;
};
