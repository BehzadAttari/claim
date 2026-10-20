/** JSON Schema validation (structural), separated from the rule checks in claims.ts. */

import { Ajv, type ErrorObject, type ValidateFunction } from "ajv";
import type { PageClaim } from "./types.js";

let validator: ValidateFunction | null = null;

export function schemaErrors(schema: object, data: unknown): string[] {
  if (!validator) {
    const ajv = new Ajv({ allErrors: true, strict: false });
    validator = ajv.compile(schema);
  }
  if (validator(data)) return [];
  return ((validator.errors ?? []) as ErrorObject[]).map((e) => {
    const where = e.instancePath ? e.instancePath.replace(/^\//, "").replace(/\//g, ".") : "the file";
    return `${where}: ${e.message ?? "is invalid"}`;
  });
}

/** Narrow after schema validation; rule checks treat it as PageClaim. */
export function asClaim(data: unknown): PageClaim {
  return data as PageClaim;
}
