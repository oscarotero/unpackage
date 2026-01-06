import type { Version } from "../utils.ts";

export interface Options {
  fetch?: typeof fetch;
}

export abstract class Adapter<V = Version> {
  fetch: typeof fetch;

  constructor(options: Options = {}) {
    this.fetch = options.fetch || fetch;
  }

  abstract parse(specifier: string): [string, string, string] | undefined;
  abstract getVersions(name: string): Promise<V[]>;
  abstract getFiles(version: V, pattern: string): AsyncGenerator<File>;
}
