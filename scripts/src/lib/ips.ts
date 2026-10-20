/**
 * IP target checks for point mode.
 * Private, loopback and link-local ranges are rejected because a public
 * subdomain must never point at infrastructure that is not on the internet.
 */

const PRIVATE_V4 = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT 100.64.0.0/10
  /^192\.0\.0\./,
  /^192\.0\.2\./, /^198\.51\.100\./, /^203\.0\.113\./, // documentation ranges
  /^224\./,
];

export function isPrivateIpv4(ip: string): boolean {
  return PRIVATE_V4.some((re) => re.test(ip));
}

export function isValidIpv4(ip: string): boolean {
  const parts = ip.split(".");
  return parts.length === 4 && parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255);
}

/** Compressed or full IPv6, validated loosely; private ULA/link-local/loopback rejected. */
export function isPrivateIpv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  return (
    lower === "::1" ||
    lower === "::" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80")
  );
}

export function isValidIpv6(ip: string): boolean {
  return /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":");
}
