import { assertEquals } from "jsr:@std/assert@1.0.14/equals";
import unpack from "./mod.ts";

Deno.test("NPM - Unscoped package", async () => {
  const files = await getFiles("npm:ventojs@1/esm/src/**/*.js");

  assertEquals(files.size, 7);
  assertEquals(files.get("/url_loader.js"), 532);
});

Deno.test("NPM - Scoped package", async () => {
  const files = await getFiles("npm:@lumeland/ssx@0.1.12/**/*.ts");

  assertEquals(files.size, 3);
  assertEquals(files.get("/jsx-runtime.d.ts"), 1526);
});

Deno.test("GitHub", async () => {
  const files = await getFiles("gh:oscarotero/ssx@0.1.12/**/*.ts");

  assertEquals(files.size, 3);
  assertEquals(files.get("/jsx-runtime.ts"), 5772);
});

async function getFiles(pkg: string): Promise<Map<string, number>> {
  const files = new Map<string, number>();
  for await (const file of unpack(pkg)) {
    const size = (await file.bytes()).byteLength;
    files.set(file.name, size);
  }
  return files;
}
