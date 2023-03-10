import { MessageQueue } from './MessageQueue';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('MessageQueue', () => {
  it('should work', async () => {
    const receive = jest.fn();
    const send = jest
      .fn()
      .mockImplementationOnce(async (msg) => sleep(10).then(() => receive(msg)))
      .mockImplementationOnce(async (msg) => receive(msg));

    const queue = new MessageQueue(send);
    queue.enqueue('abc');
    queue.enqueue('def');
    await queue.flush();

    expect(receive.mock.calls[0][0]).toEqual('abc');
    expect(receive.mock.calls[1][0]).toEqual('def');
  });

  it('should emit events', async () => {
    const send = jest
      .fn()
      .mockImplementationOnce(async () => {
        throw new Error('TEST_ERROR');
      })
      .mockImplementationOnce(async () => {
        /* no-op */
      });

    const onError = jest.fn();
    const onDrain = jest.fn();
    const onNext = jest.fn();

    const queue = new MessageQueue(send)
      .on('error', onError)
      .on('drain', onDrain)
      .on('next', onNext)
      .enqueue('abc')
      .enqueue('def');

    await queue.flush();
    expect(onDrain).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith({ type: 'error', error: new Error('TEST_ERROR') });
    expect(onNext).toHaveBeenCalledWith({ type: 'next', message: 'abc' });
    expect(onNext).toHaveBeenCalledWith({ type: 'next', message: 'def' });
  });
});
