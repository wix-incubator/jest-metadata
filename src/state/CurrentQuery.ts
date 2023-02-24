import { AggregatedResultMetadata } from './AggregatedResultMetadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { Metadata } from './Metadata';
import { RunMetadata } from './RunMetadata';
import { TestEntryMetadata } from './TestEntryMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class CurrentQuery {
  constructor(private readonly _aggregatedResultMetadata: AggregatedResultMetadata) {}

  get aggregatedResult(): AggregatedResultMetadata {
    return this._aggregatedResultMetadata;
  }

  get describeBlock(): DescribeBlockMetadata | undefined {
    return undefined;
  }

  get execution(): Metadata | undefined {
    return undefined;
  }

  get hook(): Metadata | undefined {
    return undefined;
  }

  get metadata(): Metadata | undefined {
    return undefined;
  }

  get run(): RunMetadata | undefined {
    return undefined;
  }

  get testEntry(): TestEntryMetadata | undefined {
    return undefined;
  }

  get testFn(): Metadata | undefined {
    return undefined;
  }

  get testInvocation(): TestInvocationMetadata | undefined {
    return undefined;
  }
}
