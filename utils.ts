export {
  canParse,
  format,
  maxSatisfying,
  parse,
  parseRange,
} from "jsr:@std/semver@1.0.7";
import { UntarStream } from "jsr:@std/tar@0.1.9/untar-stream";
import { globToRegExp } from "jsr:@std/path@1.1.4/glob-to-regexp";

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

    if (!path || regexp.test(path) === false || path === "/") {
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
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let result = await reader.read();

  while (!result.done) {
    chunks.push(result.value as Uint8Array<ArrayBuffer>);
    result = await reader.read();
  }

  return new Blob(chunks);
}

function removeFirstDirectory(path: string): string {
  const [, ...parts] = path.split("/");
  return `/${parts.join("/")}`;
}
