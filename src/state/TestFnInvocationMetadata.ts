import { ContextAPI } from '../circus/types';

import { Metadata } from './Metadata';
import { TestFnDefinitionMetadata } from './TestFnDefinitionMetadata';

export class TestFnInvocationMetadata extends Metadata {
  constructor(
    public readonly api: ContextAPI,
    public readonly definition: TestFnDefinitionMetadata,
  ) {
    super(api);
  }
}
