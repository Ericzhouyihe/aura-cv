import { motion } from "framer-motion";
import SectionTitle from "./SectionTitle";
import SectionWrapper from "../../shared/SectionWrapper";
import { GlobalSettings } from "@/types/resume";
import { normalizeRichTextContent } from "@/lib/richText";

interface SkillSectionProps {
  skill?: string;
  globalSettings?: GlobalSettings;
  showTitle?: boolean;
}

const SkillSection = ({
  skill,
  globalSettings,
  showTitle = true,
}: SkillSectionProps) => {
  return (
    <SectionWrapper
      sectionId="skills"
      className="rounded-none"
      style={{ marginTop: `${globalSettings?.sectionSpacing ?? 24}px` }}
    >
      <SectionTitle
        type="skills"
        globalSettings={globalSettings}
        showTitle={showTitle}
      />
      <motion.div
        layout="position"
        className="columns-2 gap-x-8 text-neutral-800 [&_ol]:my-0 [&_ol]:pl-5 [&_p]:mb-2 [&_p]:break-inside-avoid [&_ul]:my-0 [&_ul]:pl-5 [&_li]:mb-1 [&_li]:break-inside-avoid marker:text-neutral-900"
        style={{
          marginTop: `${globalSettings?.paragraphSpacing ?? 12}px`,
          fontSize: `${globalSettings?.baseFontSize || 13}px`,
          lineHeight: globalSettings?.lineHeight || 1.6,
        }}
        dangerouslySetInnerHTML={{ __html: normalizeRichTextContent(skill) }}
      />
    </SectionWrapper>
  );
};

export default SkillSection;
