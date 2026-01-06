import { Adapter } from "./adapter.ts";
import { parse, untar, type Version } from "../utils.ts";

const SPECIFIER = /^cb:([^/]+\/[^/@]+)(@([^/]+))?(\/.+)?$/;

export default class Codeberg extends Adapter {
  parse(specifier: string): [string, string, string] | undefined {
    const match = specifier.match(SPECIFIER);

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
    const url = `https://codeberg.org/api/v1/repos/${name}/tags?limit=100`;
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
    const { name, tag } = version;
    const url = `https://codeberg.org/${name}/archive/${tag}.tar.gz`;
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch tarball: ${response.statusText}`);
    }

    yield* untar(await response.blob(), pattern);
  }
}
