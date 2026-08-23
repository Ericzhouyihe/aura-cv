import { AnimatePresence, motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { CustomItem, GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";
import { formatDateString } from "@/lib/utils";
import { useLocale } from "@/i18n/compat/client";

interface CustomSectionProps {
  sectionId: string;
  title: string;
  items: CustomItem[];
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const CustomSection = ({
  sectionId,
  title,
  items,
  globalSettings,
  showTitle = true,
}: CustomSectionProps) => {
  const locale = useLocale();
  const visibleItems = items?.filter(
    (item) => item.visible && (item.title || item.description)
  );

  return (
    <SectionWrapper
      sectionId={sectionId}
      className="rounded-none"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 24}px` }}
    >
      <SectionTitle
        title={title}
        type="custom"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item) => (
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
                {item.title}
              </h4>
              {item.dateRange && (
                <span
                  className="shrink-0 whitespace-nowrap font-medium text-neutral-800"
                  style={{ fontSize: `${Math.max((globalSettings?.baseFontSize || 14) - 1, 10)}px` }}
                  suppressHydrationWarning
                >
                  {formatDateString(item.dateRange, locale)}
                </span>
              )}
            </div>
            {item.subtitle && (
              <div
                className="mt-1 font-semibold text-neutral-700"
                style={{ fontSize: `${Math.max((globalSettings?.subheaderSize || 15) - 1, 10)}px` }}
              >
                {item.subtitle}
              </div>
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
        ))}
      </AnimatePresence>
    </SectionWrapper>
  );
};

export default CustomSection;
