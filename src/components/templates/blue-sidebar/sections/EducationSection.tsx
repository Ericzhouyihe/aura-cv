import { AnimatePresence, motion } from "framer-motion";
import { Education, GlobalSettings } from "@/types/resume";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { useLocale } from "@/i18n/compat/client";
import {
  hasMeaningfulRichTextContent,
  normalizeRichTextContent,
} from "@/lib/richText";
import { formatDateRange } from "@/lib/utils";

interface EducationSectionProps {
  education?: Education[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const EducationSection = ({
  education,
  globalSettings,
  showTitle = true,
}: EducationSectionProps) => {
  const locale = useLocale();
  const visibleEducation = education?.filter((item) => item.visible);

  return (
    <SectionWrapper
      sectionId="education"
      className="rounded-none"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 24}px` }}
    >
      <SectionTitle
        type="education"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        {visibleEducation?.map((item) => (
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
                {item.school}
                {item.degree ? ` - ${item.degree}` : ""}
              </h4>
              <span
                className="shrink-0 whitespace-nowrap font-medium text-neutral-800"
                style={{ fontSize: `${Math.max((globalSettings?.baseFontSize || 14) - 1, 10)}px` }}
                suppressHydrationWarning
              >
                {formatDateRange(item.startDate, item.endDate, locale)}
              </span>
            </div>
            <div
              className="mt-1 font-semibold text-neutral-800"
              style={{ fontSize: `${Math.max((globalSettings?.subheaderSize || 15) - 1, 10)}px` }}
            >
              {[item.major, item.gpa ? `GPA ${item.gpa}` : ""]
                .filter(Boolean)
                .join(" · ")}
            </div>
            {hasMeaningfulRichTextContent(item.description) && (
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
        ))}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default EducationSection;
