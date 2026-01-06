import type { SemVer } from "jsr:@std/semver@1.0.7";
import { parse, untar } from "../utils.ts";

export interface Options {
  fetch?: typeof fetch;
}

export interface Version {
  name: string;
  tag: string;
  semVer: SemVer;
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

const SPECIFIER = /^([^/]+\/[^/@]+)(@([^/]+))?(\/.+)?$/;

export abstract class Git extends Adapter {
  abstract prefix: string;
  abstract getVersionsURL(name: string): string;
  abstract getArchiveURL(version: Version): string;

  parse(specifier: string): [string, string, string] | undefined {
    if (!specifier.startsWith(this.prefix)) {
      return;
    }

    const match = specifier.slice(this.prefix.length).match(SPECIFIER);

    if (!match) {
      return;
    }

    const [, name, , version, pattern] = match;
    return [
      name,
      version || "*",
      pattern || "/**",
    ];
  }

  async getVersions(name: string) {
    const url = this.getVersionsURL(name);
    const response = await this.fetch(url);
    const tags = await response.json();

    const result: Version[] = [];

    for (const tag of tags) {
      try {
        result.push({
          name,
          semVer: parse(tag.name),
          tag: tag.name,
        });
      } catch {
        continue;
      }
    }

    return result;
  }

  async *getFiles(version: Version, pattern: string): AsyncGenerator<File> {
    const url = this.getArchiveURL(version);
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch tarball: ${response.statusText}`);
    }

    yield* untar(await response.blob(), pattern);
  }
}
