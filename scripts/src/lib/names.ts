/**
 * Subdomain name rules.
 * A name is the JSON filename without ".json" and becomes <name>.got-a.page.
 * Rules mirror what DNS and TLS allow, so a name that passes here works everywhere.
 */

export const NAME_MIN = 2;
export const NAME_MAX = 40;

const NAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/** Returns a list of human-friendly problems; empty list means the name is valid. */
export function nameProblems(raw: string): string[] {
  const problems: string[] = [];
  if (raw.length < NAME_MIN || raw.length > NAME_MAX) {
    problems.push(`must be ${NAME_MIN}-${NAME_MAX} characters (got ${raw.length})`);
  }
  if (!/^[a-z0-9-]+$/.test(raw)) {
    problems.push("only lowercase a-z, 0-9 and hyphens are allowed");
  }
  if (raw.startsWith("-") || raw.endsWith("-")) {
    problems.push("cannot start or end with a hyphen");
  }
  if (raw.length >= NAME_MIN && !NAME_PATTERN.test(raw) && problems.length === 0) {
    problems.push("is not a valid DNS name");
  }
  return problems;
}
