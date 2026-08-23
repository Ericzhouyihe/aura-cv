import assert from "node:assert/strict";
import test from "node:test";
import ClassicTemplate from "./classic";
import { DEFAULT_TEMPLATES, getTemplateComponent } from "./registry";

test("registers the blue sidebar template", () => {
  const template = DEFAULT_TEMPLATES.find((item) => item.id === "blue-sidebar");

  assert.ok(template);
  assert.equal(template.layout, "blue-sidebar");
});

test("resolves the blue sidebar component without using the classic fallback", () => {
  assert.notEqual(getTemplateComponent("blue-sidebar"), ClassicTemplate);
});
