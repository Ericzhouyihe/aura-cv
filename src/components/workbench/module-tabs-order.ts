import type { MenuSection } from "@/types/resume";

export function mergeEnabledSectionOrder(
  menuSections: MenuSection[],
  enabledOrder: MenuSection[]
): MenuSection[] {
  const reorderedEnabled = enabledOrder.filter(
    (section) => section.id !== "basic" && section.enabled
  );
  let enabledIndex = 0;

  return menuSections
    .filter((section) => section.id !== "basic")
    .map((section) => {
      if (!section.enabled) return section;

      const reorderedSection = reorderedEnabled[enabledIndex];
      enabledIndex += 1;
      return reorderedSection ?? section;
    });
}
