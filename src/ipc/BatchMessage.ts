export type BatchMessage = {
  /** The batch of stringified messages. */
  batch: string[];
  /** Whether this is the first batch of messages. */
  first?: boolean;
  /** Whether this is the last batch of messages. */
  last?: boolean;
};
