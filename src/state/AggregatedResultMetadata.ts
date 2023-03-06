import { Metadata } from './Metadata';
import { MetadataContext } from './MetadataContext';
import { RunMetadata } from './RunMetadata';
import { ScopedIdentifier } from './ScopedIdentifier';

export class AggregatedResultMetadata extends Metadata {
  public readonly testResults: RunMetadata[] = [];
  private _lastTestResult: RunMetadata | undefined;

  constructor(context: MetadataContext) {
    super(context, ScopedIdentifier.global('aggregatedResult'));
  }

  public get lastTestResult(): RunMetadata | undefined {
    return this._lastTestResult;
  }

  public getRunMetadata(testFilePath: string): RunMetadata {
    const runId = new ScopedIdentifier(testFilePath, '');
    const metadata = this.context.metadataRegistry.get(runId);
    if (metadata && !(metadata instanceof RunMetadata)) {
      throw new TypeError(`Wrong metadata type found for: ${runId.toString()}`);
    }

    return metadata as RunMetadata;
  }

  public registerTestFile(testFilePath: string): RunMetadata {
    const runId = new ScopedIdentifier(testFilePath, '');
    const runMetadata = new RunMetadata(this.context, runId);

    this._lastTestResult = runMetadata;
    this.testResults.push(runMetadata);

    return runMetadata;
  }
}
