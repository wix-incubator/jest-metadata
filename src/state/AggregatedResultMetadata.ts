import { Metadata } from './Metadata';
import { RunMetadata } from './index';

export class AggregatedResultMetadata extends Metadata {
  testResults: Record<string, RunMetadata> = {};
}
