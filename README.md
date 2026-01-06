# Unpackage

Simple Deno library to download files from NPM, GitHub, GitLab and Codeberg
(easily extensible to other registries).

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
unpackage("npm:ventojs/esm/src/**"); // Return only the files inside the /esm/src folder (the '/esm/src' prefix is removed from the filepaths)
unpackage("npm:ventojs@^1.1/esm/src/**"); // Combine version + pattern
```

### Supported prefixes:

- `npm:` To download files from NPM (like `npm:foo@1.0.0`)
- `gh:` To download files from GitHub (like `gh:org/repo@1.0.0`)
- `gl:` To download files from GitLab (like `gl:org/repo@1.0.0`)
- `cb:` To download files from Codeberg (like `cb:org/repo@1.0.0`)
