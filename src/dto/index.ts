export type Data = Record<string, unknown>;

export type DataArray = Data[];

export type AggregatedResultDTO = {
  type: 'aggregatedResult';
  testResults: Record<string, RunDTO>;
};

export type RunDTO = {
  type: 'run';
  rootDescribeBlock: DescribeBlockDTO;
};

export type DescribeBlockDTO = {
  type: 'describe';
  before: DataArray;
  after: DataArray;
  children: (DescribeBlockDTO | TestEntryDTO)[];
};

export type TestEntryDTO = {
  type: 'test';
  invocations: TestInvocationDTO[];
};

export type TestInvocationDTO = {
  type: 'testInvocation';
  before: DataArray;
  testFn: Data;
  after: DataArray;
};

