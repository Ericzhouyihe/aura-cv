import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";

interface SelfEvaluationSectionProps {
  content?: string;
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const SelfEvaluationSection = ({
  content,
  globalSettings,
  showTitle = true,
}: SelfEvaluationSectionProps) => {
  return (
    <SectionWrapper
      sectionId="selfEvaluation"
      className="rounded-none"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 24}px` }}
    >
      <SectionTitle
        type="selfEvaluation"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <motion.div
        layout="position"
        className="text-neutral-900 [&_ol]:my-1 [&_ol]:pl-5 [&_p]:my-1 [&_ul]:my-1 [&_ul]:pl-5 [&_li]:my-0.5"
        style={{
          marginTop: `${globalSettings?.paragraphSpacing ?? 12}px`,
          fontSize: `${Math.max((globalSettings?.baseFontSize || 13) - 1, 10)}px`,
          lineHeight: globalSettings?.lineHeight || 1.75,
        }}
        dangerouslySetInnerHTML={{ __html: normalizeRichTextContent(content) }}
      />
    </SectionWrapper>
  );
};

export default SelfEvaluationSection;
