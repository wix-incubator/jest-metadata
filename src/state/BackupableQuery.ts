/* eslint-disable @typescript-eslint/member-ordering */

import { Query } from './Query';
import { AggregatedResultMetadata } from './AggregatedResultMetadata';
import { RunMetadata } from './RunMetadata';
import { DescribeBlockMetadata } from './DescribeBlockMetadata';
import { Metadata } from './Metadata';
import { TestEntryMetadata } from './TestEntryMetadata';
import { TestInvocationMetadata } from './TestInvocationMetadata';

export class BackupableQuery implements Query {
  private readonly _current = new Query();
  constructor(private readonly _backup: Query) {}

  get aggregatedResult(): AggregatedResultMetadata | undefined {
    return this._current.aggregatedResult;
  }

  set aggregatedResult(value: AggregatedResultMetadata | undefined) {
    this._backup.aggregatedResult = this._current.aggregatedResult;
    this._current.aggregatedResult = value;
  }

  get run(): RunMetadata | undefined {
    return this._current.run;
  }

  set run(value: RunMetadata | undefined) {
    this._backup.run = this._current.run;
    this._current.run = value;
  }

  get describeBlock(): DescribeBlockMetadata | undefined {
    return this._current.describeBlock;
  }

  set describeBlock(value: DescribeBlockMetadata | undefined) {
    this._backup.describeBlock = this._current.describeBlock;
    this._current.describeBlock = value;
  }

  get execution(): Metadata | undefined {
    return this._current.execution;
  }

  set execution(value: Metadata | undefined) {
    this._backup.execution = this._current.execution;
    this._current.execution = value;
  }

  get hook(): Metadata | undefined {
    return this._current.hook;
  }

  set hook(value: Metadata | undefined) {
    this._backup.hook = this._current.hook;
    this._current.hook = value;
  }

  get metadata(): Metadata | undefined {
    return this._current.metadata;
  }

  set metadata(value: Metadata | undefined) {
    this._backup.metadata = this._current.metadata;
    this._current.metadata = value;
  }

  get testEntry(): TestEntryMetadata | undefined {
    return this._current.testEntry;
  }

  set testEntry(value: TestEntryMetadata | undefined) {
    this._backup.testEntry = this._current.testEntry;
    this._current.testEntry = value;
  }

  get testFn(): Metadata | undefined {
    return this._current.testFn;
  }

  set testFn(value: Metadata | undefined) {
    this._backup.testFn = this._current.testFn;
    this._current.testFn = value;
  }

  get testInvocation(): TestInvocationMetadata | undefined {
    return this._current.testInvocation;
  }

  set testInvocation(value: TestInvocationMetadata | undefined) {
    this._backup.testInvocation = this._current.testInvocation;
    this._current.testInvocation = value;
  }
}
