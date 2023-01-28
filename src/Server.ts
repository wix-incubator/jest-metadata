import { MemoryStorage, CircusContext } from './CircusContext';

export type ServerOptions = {
  foo: string;
};

export class Server {
  private readonly _storage: CircusContext = new MemoryStorage();

  constructor(private readonly _options: ServerOptions) {}

  async start() {
    // TODO: implement
    console.log(this._options.foo);
    this._storage.assign({ foo: 'bar' });
  }

  async destroy() {
    // TODO
  }
}
