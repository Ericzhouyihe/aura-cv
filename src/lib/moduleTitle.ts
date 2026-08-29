import type { MenuSection } from "@/types/resume";

// 原生模块 id → standardSections i18n key（workbench.sidePanel.layout.standardSections）
const NATIVE_SECTION_KEYS: Record<string, string> = {
  basic: "basic",
  skills: "skills",
  experience: "experience",
  projects: "projects",
  education: "education",
  selfEvaluation: "selfEvaluation",
  certificates: "certificates"
};

type StandardSectionsTranslator = (key: string) => string;

/**
 * 编辑器界面的模块显示名：
 * - 原生模块且用户未在编辑面板改过名（titleCustomized !== true）时，
 *   按当前界面语言显示，切换语言自动跟随；
 * - 自定义模块（custom-*）与用户改过名的模块始终显示数据里存储的标题。
 * 简历预览不经过此函数——预览是用户简历文档本身，语言由内容决定。
 */
export function getModuleDisplayTitle(
  section: Pick<MenuSection, "id" | "title" | "titleCustomized">,
  t: StandardSectionsTranslator
): string {
  const key = NATIVE_SECTION_KEYS[section.id];
  if (key && !section.titleCustomized) {
    return t(key);
  }
  return section.title;
}
