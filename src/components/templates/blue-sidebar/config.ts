import { ResumeTemplate } from "@/types/template";

export const blueSidebarConfig: ResumeTemplate = {
  id: "blue-sidebar",
  name: "清蓝双栏",
  description: "浅蓝侧栏与图标分区，适合信息丰富的专业简历",
  thumbnail: "blue-sidebar",
  layout: "blue-sidebar",
  colorScheme: {
    primary: "#397da7",
    secondary: "#64748b",
    background: "#ffffff",
    text: "#171717",
  },
  spacing: {
    sectionGap: 24,
    itemGap: 12,
    contentPadding: 24,
  },
  basic: {
    layout: "left",
  },
  availableSections: [
    "skills",
    "experience",
    "projects",
    "education",
    "selfEvaluation",
    "certificates",
  ],
};
