# Unpackage

Simple library to download package files from NPM and GitHub (extensible to
other registries).

## Example

```ts
import unpackage from "unpackage/mod.ts";

for await (const file of unpackage("npm:ventojs")) {
  const path = join(root, file.name);

  // Ensure the folder exists
  try {
    await Deno.mkdir(dirname(path), { recursive: true });
  } catch {}

  // Write the file content
  Deno.writeFile(path, await file.bytes());
}
```

### Version ranges and patterns

You can use version ranges and patterns to download only some specific files:

```js
unpackage("npm:ventojs@1"); // The most recent 1.x version
unpackage("npm:ventojs@^1.1"); // The most recent 1.1 version
unpackage("npm:ventojs/esm/src/**"); // Return only the files inside the /esm/src folder
unpackage("npm:ventojs@^1.1/esm/src/**"); // Combine version + pattern
```
