import { HookType } from '../types';

import * as symbols from './symbols';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { HookInvocationMetadata } from './HookInvocationMetadata';
import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { ScopedIdentifier } from './ScopedIdentifier';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class HookDefinitionMetadata extends Metadata {
  invocations: HookInvocationMetadata[] = [];

  constructor(
    context: MetadataContext,
    public readonly owner: DescribeBlockMetadata,
    id: ScopedIdentifier,
    public readonly hookType: HookType,
  ) {
    super(context, id);

    if (
      hookType !== 'beforeEach' &&
      hookType !== 'afterEach' &&
      hookType !== 'beforeAll' &&
      hookType !== 'afterAll'
    ) {
      throw new TypeError(`Unknown hook type: ${hookType}`);
    }
  }

  [symbols.start](): HookInvocationMetadata {
    const run = this.owner.run;
    const parent = run.current.invocationParent;
    if (!parent) {
      throw new Error('Cannot start hook invocation outside of test or describe block');
    }

    const invocation = new HookInvocationMetadata(
      this.context,
      this,
      parent,
      this.id.nest(`${this.invocations.length}`),
    );

    this.invocations.push(invocation);
    run[symbols.currentMetadata] = invocation;

    switch (this.hookType) {
      case 'beforeEach': {
        parent
          .as(TestInvocationMetadata)
          .before.push(invocation as HookInvocationMetadata<TestInvocationMetadata>);
        break;
      }
      case 'afterEach': {
        parent
          .as(TestInvocationMetadata)
          .after.push(invocation as HookInvocationMetadata<TestInvocationMetadata>);
        break;
      }
      case 'beforeAll':
      case 'afterAll': {
        parent
          .as(DescribeBlockMetadata)
          .invocations.push(invocation as HookInvocationMetadata<DescribeBlockMetadata>);
        break;
      }
    }

    return invocation;
  }

  [symbols.finish](): void {
    const run = this.owner.run;
    const lastInvocation = this.invocations[this.invocations.length - 1];
    if (!lastInvocation) {
      throw new Error('Cannot finish hook invocation without starting it');
    }

    run[symbols.currentMetadata] = lastInvocation.parent;
  }
}
