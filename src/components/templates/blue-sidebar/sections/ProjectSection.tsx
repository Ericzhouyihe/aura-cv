import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings, Project } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";
import { getProjectLinkMeta } from "@/lib/projectLink";

interface ProjectSectionProps {
  projects: Project[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({
  projects,
  globalSettings,
  showTitle = true,
}) => {
  const locale = useLocale();
  const visibleProjects = projects?.filter((item) => item.visible);
  const themeColor = globalSettings?.themeColor || "#397da7";

  return (
    <SectionWrapper
      sectionId="projects"
      className="rounded-none"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 24}px` }}
    >
      <SectionTitle
        type="projects"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        {visibleProjects.map((item) => {
          const projectLink = getProjectLinkMeta(item);

          return (
            <motion.div
              key={item.id}
              layout="position"
              className="[break-inside:avoid]"
              style={{ marginTop: `${globalSettings?.paragraphSpacing ?? 12}px` }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h4
                  className="min-w-0 flex-1 font-bold text-neutral-950"
                  style={{ fontSize: `${globalSettings?.subheaderSize || 15}px` }}
                >
                  {item.name}
                  {item.role ? ` - ${item.role}` : ""}
                </h4>
                <span
                  className="shrink-0 whitespace-nowrap font-medium text-neutral-800"
                  style={{ fontSize: `${Math.max((globalSettings?.baseFontSize || 14) - 1, 10)}px` }}
                  suppressHydrationWarning
                >
                  {formatDateString(item.date, locale)}
                </span>
              </div>
              {projectLink && (
                <a
                  href={projectLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 underline"
                  style={{
                    color: themeColor,
                    fontSize: `${Math.max((globalSettings?.baseFontSize || 13) - 1, 10)}px`,
                  }}
                  title={projectLink.title}
                >
                  <ExternalLink className="h-3 w-3" />
                  {projectLink.label}
                </a>
              )}
              {item.description && (
                <motion.div
                  layout="position"
                  className="mt-2 text-neutral-800 [&_ol]:my-1 [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-5 [&_li]:my-0.5 marker:text-neutral-900"
                  style={{
                    fontSize: `${globalSettings?.baseFontSize || 13}px`,
                    lineHeight: globalSettings?.lineHeight || 1.65,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: normalizeRichTextContent(item.description),
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default ProjectSection;
