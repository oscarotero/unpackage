import { Git, type Version } from "./adapter.ts";

export default class GitHub extends Git {
  prefix = "gh:";

  getVersionsURL(name: string): string {
    return `https://api.github.com/repos/${name}/tags?per_page=100`;
  }

  getArchiveURL(version: Version): string {
    const { name, tag } = version;
    return `https://api.github.com/repos/${name}/tarball/refs/tags/${tag}`;
  }
}
