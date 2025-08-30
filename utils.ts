export {
  canParse,
  format,
  maxSatisfying,
  parse,
  parseRange,
} from "jsr:@std/semver@1.0.5";
import type { SemVer } from "jsr:@std/semver@1.0.5";
import { UntarStream } from "jsr:@std/tar@0.1.7/untar-stream";
import { globToRegExp } from "jsr:@std/path@1.1.2/glob-to-regexp";

export interface Version {
  name: string;
  tag: string;
  semVer: SemVer;
}

export interface Adapter<V = Version> {
  parse(specifier: string): [string, string, string] | undefined;
  getVersions(name: string): Promise<V[]>;
  getFiles(version: V, pattern: string): AsyncGenerator<File>;
}

export async function* untar(
  blob: Blob,
  pattern: string,
): AsyncGenerator<File> {
  const untar = blob
    .stream()
    .pipeThrough(new DecompressionStream("gzip"))
    .pipeThrough(new UntarStream());

  const regexp = globToRegExp(pattern, { globstar: true, extended: true });
  const basePath = pattern.includes("*") ? pattern.split("/*")[0] : undefined;

  for await (const entry of untar) {
    const stream = entry.readable;
    if (!stream) {
      continue;
    }
    const content = await getContent(stream);
    let path = removeFirstDirectory(entry.path);
    if (!path || regexp.test(path) === false) {
      continue;
    }

    if (basePath) {
      path = path.slice(basePath.length);
    }

    yield new File([content], path, {
      type: "application/octet-stream",
    });
  }
}

async function getContent(stream: ReadableStream<Uint8Array>): Promise<Blob> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let result = await reader.read();

  while (!result.done) {
    chunks.push(result.value);
    result = await reader.read();
  }

  return new Blob(chunks);
}

function removeFirstDirectory(path: string): string {
  const [, ...parts] = path.split("/");
  return `/${parts.join("/")}`;
}
