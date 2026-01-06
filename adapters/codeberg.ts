import { Git, type Version } from "./adapter.ts";

export default class Codeberg extends Git {
  prefix = "cb:";

  getVersionsURL(name: string): string {
    return `https://codeberg.org/api/v1/repos/${name}/tags?limit=100`;
  }

  getArchiveURL(version: Version): string {
    const { name, tag } = version;
    return `https://codeberg.org/${name}/archive/${tag}.tar.gz`;
  }
}
