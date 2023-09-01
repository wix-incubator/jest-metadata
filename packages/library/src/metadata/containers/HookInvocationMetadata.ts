import type { AggregatedIdentifier } from '../ids';

import type { InvocationMetadata } from '../types';
import { BaseMetadata } from './BaseMetadata';
import type { DescribeBlockMetadata } from './DescribeBlockMetadata';
import type { HookDefinitionMetadata } from './HookDefinitionMetadata';
import type { MetadataContext } from './MetadataContext';
import type { TestInvocationMetadata } from './TestInvocationMetadata';

type HookInvocationParentMetadata = DescribeBlockMetadata | TestInvocationMetadata;

export class HookInvocationMetadata<
    ParentMetadata extends HookInvocationParentMetadata = HookInvocationParentMetadata,
  >
  extends BaseMetadata
  implements InvocationMetadata
{
  constructor(
    context: MetadataContext,
    public readonly definition: HookDefinitionMetadata,
    public readonly parent: ParentMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }
}
