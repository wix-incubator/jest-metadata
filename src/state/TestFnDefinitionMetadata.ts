import { ContextAPI } from '../circus/types';

import { Metadata } from './Metadata';
import { TestEntryMetadata } from './TestEntryMetadata';

export class TestFnDefinitionMetadata extends Metadata {
  constructor(public readonly api: ContextAPI, public readonly owner: TestEntryMetadata) {
    super(api);
  }
}
