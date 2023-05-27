/* eslint-disable @typescript-eslint/no-explicit-any */
type EventEmitterLike = {
  on(event: string, listener: (...args: any[]) => void): EventEmitterLike;
  off(event: string, listener: (...args: any[]) => void): EventEmitterLike;
  emit(event: string, ...args: any[]): unknown;
};

export function sendAsyncMessage(
  connection: EventEmitterLike,
  eventName: string,
  payload: unknown,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    function onError(err: Error) {
      connection.off('error', onError);
      connection.off(`${eventName}Done`, onDone);
      reject(err);
    }

    function onDone(response: unknown) {
      connection.off(`${eventName}Done`, onDone);
      connection.off('error', onError);
      resolve(response);
    }

    connection.on('error', onError).on(`${eventName}Done`, onDone).emit(eventName, payload);
  });
}
