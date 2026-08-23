import { useMemo } from "react";
import {
  Award,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  LayoutGrid,
  UserRound,
} from "lucide-react";
import { GlobalSettings } from "@/types/resume";
import { useTemplateContext } from "../../TemplateContext";

interface SectionTitleProps {
  globalSettings?: GlobalSettings;
  type: string;
  title?: string;
  showTitle?: boolean;
}

const iconBySection = {
  education: GraduationCap,
  experience: BriefcaseBusiness,
  projects: LayoutGrid,
  skills: BarChart3,
  certificates: Award,
  selfEvaluation: UserRound,
} as const;

const SectionTitle = ({
  type,
  title,
  globalSettings,
  showTitle = true,
}: SectionTitleProps) => {
  const templateContext = useTemplateContext();
  const menuSections = templateContext?.menuSections ?? [];

  const renderTitle = useMemo(() => {
    if (type === "custom") return title;
    return menuSections.find((section) => section.id === type)?.title;
  }, [menuSections, type, title]);

  if (!showTitle) return null;

  const Icon =
    iconBySection[type as keyof typeof iconBySection] || FileText;

  return (
    <div
      className="flex w-full items-center gap-2"
      style={{ marginBottom: `${globalSettings?.paragraphSpacing ?? 12}px` }}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-white">
        <Icon className="h-3 w-3" strokeWidth={2.4} />
      </span>
      <h3
        className="shrink-0 font-bold leading-none text-neutral-950"
        style={{ fontSize: `${globalSettings?.headerSize || 17}px` }}
      >
        {renderTitle}
      </h3>
      <span className="h-px min-w-4 flex-1 bg-neutral-200" />
    </div>
  );
};

export default SectionTitle;
