/** Reserved-name lookup against every list in reserved.json. */

export interface ReservedLists {
  infrastructure: string[];
  brands: string[];
  blocked: string[];
}

export function reservedReason(name: string, lists: ReservedLists): string | null {
  const lower = name.toLowerCase();
  if (lists.infrastructure.includes(lower)) {
    return `"${name}" is reserved for the service itself.`;
  }
  if (lists.brands.includes(lower)) {
    return `"${name}" matches a brand name, so it is reserved to prevent impersonation.`;
  }
  if (lists.blocked.includes(lower)) {
    return `"${name}" is not available.`;
  }
  return null;
}
