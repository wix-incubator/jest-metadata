import { ContextAPI } from '../circus/types';

import { HookDefinitionMetadata } from './HookDefinitionMetadata';
import { Metadata } from './Metadata';

export class HookInvocationMetadata extends Metadata {
  constructor(public readonly api: ContextAPI, public readonly definition: HookDefinitionMetadata) {
    super(api);
  }
}
