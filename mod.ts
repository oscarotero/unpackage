import { maxSatisfying, parseRange } from "./utils.ts";
import type { Options } from "./adapters/adapter.ts";
import Github from "./adapters/github.ts";
import GitLab from "./adapters/gitlab.ts";
import Codeberg from "./adapters/codeberg.ts";
import NPM from "./adapters/npm.ts";

export default async function* (
  specifier: string,
  options?: Options,
): AsyncGenerator<File> {
  const adapters = [
    new Github(options),
    new GitLab(options),
    new NPM(options),
    new Codeberg(options),
  ];

  for (const adapter of adapters) {
    const parsed = adapter.parse(specifier);
    if (!parsed) {
      continue;
    }

    const [name, version, pattern] = parsed;
    const versions = await adapter.getVersions(name);

    if (versions.length === 0) {
      throw new Error(`No versions found for package: ${name}`);
    }

    const semVers = versions.map((version) => version.semVer);
    const range = parseRange(version);
    const found = maxSatisfying(semVers, range);

    if (!found) {
      throw new Error(`No matching version found for: ${name}@${version}`);
    }

    const finalVersion = versions.find((v) => v.semVer === found)!;
    yield* adapter.getFiles(finalVersion, pattern);
    return;
  }

  throw new Error(`No valid specifier: ${specifier}`);
}
