/** Schema validation: the shapes we accept and reject outright. */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { schemaErrors } from "../src/lib/schema.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const schema = JSON.parse(readFileSync(join(root, "schema", "page.schema.json"), "utf8"));

test("valid point claim passes", () => {
  const errors = schemaErrors(schema, {
    mode: "point",
    owner: { github: "DhanushNehru" },
    purpose: "Portfolio",
    records: { CNAME: "dhanushnehru.github.io" },
  });
  assert.deepEqual(errors, []);
});

test("valid instant claim passes", () => {
  const errors = schemaErrors(schema, {
    mode: "instant",
    owner: { github: "DhanushNehru" },
    page: {
      type: "person",
      title: "Dhanush Nehru",
      theme: "sunrise",
      links: [{ label: "GitHub", url: "https://github.com/DhanushNehru" }],
    },
  });
  assert.deepEqual(errors, []);
});

test("point without records fails; instant without page fails", () => {
  assert.ok(schemaErrors(schema, { mode: "point", owner: { github: "x" } }).length > 0);
  assert.ok(schemaErrors(schema, { mode: "instant", owner: { github: "x" } }).length > 0);
});

test("point claim smuggling a page block fails", () => {
  const errors = schemaErrors(schema, {
    mode: "point",
    owner: { github: "x" },
    records: { CNAME: "x.github.io" },
    page: { type: "person", title: "X" },
  });
  assert.ok(errors.length > 0);
});

test("unknown fields and bad themes fail", () => {
  assert.ok(
    schemaErrors(schema, { mode: "instant", owner: { github: "x" }, surprise: 1, page: { type: "person", title: "X" } }).length > 0
  );
  assert.ok(
    schemaErrors(schema, { mode: "instant", owner: { github: "x" }, page: { type: "person", title: "X", theme: "neon-goth" } }).length > 0
  );
});

test("seed page dhanushnehru.json is valid", () => {
  const seed = JSON.parse(readFileSync(join(root, "pages", "dhanushnehru.json"), "utf8"));
  assert.deepEqual(schemaErrors(schema, seed), []);
});
