let _server: boolean | undefined;

export function isServer(): boolean | undefined {
  return _server === undefined ? undefined : _server;
}

export function isClient(): boolean | undefined {
  return _server === undefined ? undefined : !_server;
}

export function setIsServer(value: boolean): void {
  _server = value;
}
