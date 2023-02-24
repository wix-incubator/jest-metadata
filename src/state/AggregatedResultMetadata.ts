import { Metadata } from './Metadata';
import { RunMetadata } from './RunMetadata';

export class AggregatedResultMetadata extends Metadata {
  public readonly testResults: Record<string, RunMetadata> = {};
}
