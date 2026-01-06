import { Git, type Version } from "./adapter.ts";

export default class GitLab extends Git {
  prefix = "gl:";

  getVersionsURL(name: string): string {
    return `https://gitlab.com/api/v4/projects/${
      encodeURIComponent(name)
    }/repository/tags?per_page=100`;
  }

  getArchiveURL(version: Version): string {
    const { name, tag } = version;
    return `https://gitlab.com/api/v4/projects/${
      encodeURIComponent(name)
    }/repository/archive.tar.gz?sha=${tag}`;
  }
}
