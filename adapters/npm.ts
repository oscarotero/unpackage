import { Adapter, type Version } from "./adapter.ts";
import { format, parse, untar } from "../utils.ts";

const SPECIFIER = /^npm:(@[^/]+\/)?([^@/]+)(@([^/]+))?(\/.+)?$/;

export default class NPM extends Adapter {
  parse(specifier: string): [string, string, string] | undefined {
    const match = specifier.match(SPECIFIER);

    if (!match) {
      return;
    }

    const [, scope, name, , version, pattern] = match;
    return [
      (scope || "") + name,
      version || "*",
      pattern || "/**",
    ];
  }

  async getVersions(name: string) {
    const url = `https://registry.npmjs.org/${name}`;
    const response = await this.fetch(url);
    const info = await response.json();

    if (!info.versions) {
      throw new Error(`versions.json for ${name} has incorrect format`);
    }

    const result: Version[] = [];

    for (const version of Object.keys(info.versions)) {
      try {
        result.push({
          name,
          tag: version,
          semVer: parse(version),
        });
      } catch {
        continue;
      }
    }

    return result;
  }

  async *getFiles(version: Version, pattern: string): AsyncGenerator<File> {
    const { name, semVer } = version;
    const file = name.split("/").pop();
    const url = `https://registry.npmjs.org/${name}/-/${file}-${
      format(semVer)
    }.tgz`;
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tarball from ${url}: ${response.statusText}`,
      );
    }

    yield* untar(await response.blob(), pattern);
  }
}
