import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Experience, GlobalSettings } from "@/types/resume";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";

interface ExperienceSectionProps {
  experiences?: Experience[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experiences,
  globalSettings,
  showTitle = true,
}) => {
  const locale = useLocale();
  const visibleExperiences = experiences?.filter((item) => item.visible);

  return (
    <SectionWrapper
      sectionId="experience"
      className="rounded-none"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 24}px` }}
    >
      <SectionTitle
        type="experience"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        {visibleExperiences?.map((item) => (
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
                {item.company}
              </h4>
              <span
                className="shrink-0 whitespace-nowrap font-medium text-neutral-800"
                style={{ fontSize: `${Math.max((globalSettings?.baseFontSize || 14) - 1, 10)}px` }}
                suppressHydrationWarning
              >
                {formatDateString(item.date, locale)}
              </span>
            </div>
            {item.position && (
              <div
                className="mt-1 font-semibold text-neutral-800"
                style={{ fontSize: `${Math.max((globalSettings?.subheaderSize || 15) - 1, 10)}px` }}
              >
                {item.position}
              </div>
            )}
            {item.details && (
              <motion.div
                layout="position"
                className="mt-2 text-neutral-800 [&_ol]:my-1 [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-5 [&_li]:my-0.5 marker:text-neutral-900"
                style={{
                  fontSize: `${globalSettings?.baseFontSize || 13}px`,
                  lineHeight: globalSettings?.lineHeight || 1.65,
                }}
                dangerouslySetInnerHTML={{
                  __html: normalizeRichTextContent(item.details),
                }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default ExperienceSection;
