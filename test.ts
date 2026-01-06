import { assertEquals } from "jsr:@std/assert@1.0.16/equals";
import unpack from "./mod.ts";
import { Options } from "./adapters/adapter.ts";

Deno.test("NPM - Unscoped package", async () => {
  const files = await getFiles("npm:ventojs@1/esm/src/**/*.js");

  assertEquals(files.size, 7);
  assertEquals(files.get("/url_loader.js"), 532);
});

Deno.test("NPM - Scoped package", async () => {
  const files = await getFiles("npm:@lumeland/ssx@0.1.14/**/*.ts");

  assertEquals(files.size, 3);
  assertEquals(files.get("/jsx-runtime.d.ts"), 1526);
});

Deno.test("GitHub", async () => {
  const files = await getFiles("gh:oscarotero/ssx@0.1.12/**/*.ts");

  assertEquals(files.size, 3);
  assertEquals(files.get("/jsx-runtime.ts"), 5772);
});

Deno.test("GitHub (cache)", async () => {
  const files = await getFiles("gh:oscarotero/ssx@0.1.12/**/*.ts", true);

  assertEquals(files.size, 3);
  assertEquals(files.get("/jsx-runtime.ts"), 5772);
});

async function getFiles(
  pkg: string,
  cache = false,
): Promise<Map<string, number>> {
  const options: Options = {};

  if (cache) {
    const cache = await caches.open("unpackage");
    options.fetch = async (url): Promise<Response> => {
      const cached = await cache.match(url);
      if (cached) {
        return cached;
      }
      const response = await fetch(url);
      await cache.put(url, response.clone());
      return response;
    };
  }

  const files = new Map<string, number>();

  for await (const file of unpack(pkg, options)) {
    const size = (await file.bytes()).byteLength;
    files.set(file.name, size);
  }

  return files;
}
