import { AggregatedIdentifier, MetadataContext } from '../misc';

import { HookDefinitionMetadata } from './HookDefinitionMetadata';
import { Metadata } from './Metadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

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
