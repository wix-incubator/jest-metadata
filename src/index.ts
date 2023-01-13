import { Server, ServerOptions } from './Server';

export async function createServer(options: ServerOptions) {
  const server = new Server(options);
  await server.start();
  return server;
}

export async function createClient() {
  return 42;
}
