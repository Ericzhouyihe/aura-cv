import assert from "node:assert/strict";
import test from "node:test";
import type { MenuSection } from "@/types/resume";
import { mergeEnabledSectionOrder } from "./module-tabs-order";

const section = (
  id: string,
  enabled = true,
  order = 0
): MenuSection => ({
  id,
  title: id,
  icon: "",
  enabled,
  order,
});

test("reorders visible modules without dropping hidden modules", () => {
  const menuSections = [
    section("basic", true, 0),
    section("education", true, 1),
    section("projects", false, 2),
    section("experience", true, 3),
  ];

  const reordered = mergeEnabledSectionOrder(menuSections, [
    menuSections[3],
    menuSections[1],
  ]);

  assert.deepEqual(
    reordered.map(({ id, enabled }) => ({ id, enabled })),
    [
      { id: "experience", enabled: true },
      { id: "projects", enabled: false },
      { id: "education", enabled: true },
    ]
  );
});

test("never includes basic information in the draggable order", () => {
  const menuSections = [
    section("basic", true, 0),
    section("education", true, 1),
    section("experience", true, 2),
  ];

  const reordered = mergeEnabledSectionOrder(menuSections, [
    menuSections[2],
    menuSections[0],
    menuSections[1],
  ]);

  assert.deepEqual(
    reordered.map((item) => item.id),
    ["experience", "education"]
  );
});
