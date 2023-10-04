export type FinishDescribeDefinitionEvent = {
  type: 'finish_describe_definition';
  testFilePath: string;
  describeId: string;
};
