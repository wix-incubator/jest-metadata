// TODO: think how to use it

export function isServer(): boolean {
  return !getServerId();
}

export function isClient(): boolean | undefined {
  return !isServer();
}

export function registerServerId(id: string): void {
  process.env.JEST_METADATA_SERVER = id;
}

export function getServerId(): string | undefined {
  return process.env.JEST_METADATA_SERVER;
}

export function getClientId(): string {
  return process.env.JEST_METADATA_SERVER + '.' + (process.env.JEST_WORKER_ID || '0');
}
