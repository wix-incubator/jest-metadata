import { ContextAPI } from '../circus/types';
import { Metadata } from './Metadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';

export class HookDefinitionMetadata extends Metadata {
  constructor(public readonly api: ContextAPI, public readonly owner: DescribeBlockMetadata) {
    super(api);
  }
}
