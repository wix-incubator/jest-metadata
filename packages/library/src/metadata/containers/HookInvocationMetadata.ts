import type { AggregatedIdentifier, MetadataContext } from '../misc';

import { Metadata } from './Metadata';
import type { HookDefinitionMetadata } from './HookDefinitionMetadata';
import type { DescribeBlockMetadata } from './DescribeBlockMetadata';
import type { TestInvocationMetadata } from './TestInvocationMetadata';

type HookInvocationParentMetadata = DescribeBlockMetadata | TestInvocationMetadata;

export class HookInvocationMetadata<
  ParentMetadata extends HookInvocationParentMetadata = HookInvocationParentMetadata,
> extends Metadata {
  constructor(
    context: MetadataContext,
    public readonly definition: HookDefinitionMetadata,
    public readonly parent: ParentMetadata,
    id: AggregatedIdentifier,
  ) {
    super(context, id);
  }
}
