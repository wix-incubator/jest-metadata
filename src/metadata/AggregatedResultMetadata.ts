import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { RunMetadata } from './RunMetadata';
import { AggregatedIdentifier } from './utils/AggregatedIdentifier';
import * as symbols from './symbols';

export class AggregatedResultMetadata extends Metadata {
  public readonly testResults: RunMetadata[] = [];

  constructor(context: MetadataContext) {
    super(context, AggregatedIdentifier.global('aggregatedResult'));
  }

  public get lastTestResult(): RunMetadata | undefined {
    return this.testResults[this.testResults.length - 1];
  }

  public getRunMetadata(testFilePath: string): RunMetadata {
    const runId = new AggregatedIdentifier(testFilePath, '');
    const metadata = this[symbols.context].metadataRegistry.get(runId);
    if (metadata && !(metadata instanceof RunMetadata)) {
      throw new TypeError(`Wrong metadata type found for: ${runId.toString()}`);
    }

    return metadata as RunMetadata;
  }

  public registerTestFile(testFilePath: string): RunMetadata {
    const runId = new AggregatedIdentifier(testFilePath, '');
    const runMetadata = new RunMetadata(this[symbols.context], runId);

    this.testResults.push(runMetadata);

    return runMetadata;
  }
}
