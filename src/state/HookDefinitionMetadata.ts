import { HookType } from '../types';

import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { ScopedIdentifier } from './ScopedIdentifier';

export class HookDefinitionMetadata extends Metadata {
  constructor(
    context: MetadataContext,
    public readonly parent: DescribeBlockMetadata,
    id: ScopedIdentifier,
    public readonly hookType: HookType,
  ) {
    super(context, id);
  }
}
