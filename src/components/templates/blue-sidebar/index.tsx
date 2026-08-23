import React from "react";
import { ResumeData } from "@/types/resume";
import { ResumeTemplate } from "@/types/template";
import BaseInfo from "./sections/BaseInfo";
import EducationSection from "./sections/EducationSection";
import ExperienceSection from "./sections/ExperienceSection";
import ProjectSection from "./sections/ProjectSection";
import SkillSection from "./sections/SkillSection";
import SelfEvaluationSection from "./sections/SelfEvaluationSection";
import CustomSection from "./sections/CustomSection";
import SectionTitle from "./sections/SectionTitle";
import SectionWrapper from "../shared/SectionWrapper";
import CertificatesSection from "../shared/CertificatesSection";

interface BlueSidebarTemplateProps {
  data: ResumeData;
  template: ResumeTemplate;
}

const BlueSidebarTemplate: React.FC<BlueSidebarTemplateProps> = ({
  data,
  template,
}) => {
  const enabledSections = data.menuSections
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);
  const pagePadding = data.globalSettings?.pagePadding ?? 24;
  const themeColor = data.globalSettings?.themeColor || template.colorScheme.primary;

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "basic":
        return (
          <BaseInfo
            basic={data.basic}
            globalSettings={data.globalSettings}
            template={template}
          />
        );
      case "education":
        return (
          <EducationSection
            education={data.education}
            globalSettings={data.globalSettings}
          />
        );
      case "experience":
        return (
          <ExperienceSection
            experiences={data.experience}
            globalSettings={data.globalSettings}
          />
        );
      case "projects":
        return (
          <ProjectSection
            projects={data.projects}
            globalSettings={data.globalSettings}
          />
        );
      case "skills":
        return (
          <SkillSection
            skill={data.skillContent}
            globalSettings={data.globalSettings}
          />
        );
      case "selfEvaluation":
        return (
          <SelfEvaluationSection
            content={data.selfEvaluationContent}
            globalSettings={data.globalSettings}
          />
        );
      case "certificates":
        return (
          <SectionWrapper
            sectionId="certificates"
            style={{
              marginTop: `${data.globalSettings?.sectionSpacing ?? 24}px`,
            }}
          >
            <SectionTitle
              type="certificates"
              globalSettings={data.globalSettings}
            />
            <CertificatesSection certificates={data.certificates} />
          </SectionWrapper>
        );
      default:
        if (sectionId in data.customData) {
          const title =
            data.menuSections.find((section) => section.id === sectionId)
              ?.title || sectionId;
          return (
            <CustomSection
              title={title}
              sectionId={sectionId}
              items={data.customData[sectionId]}
              globalSettings={data.globalSettings}
            />
          );
        }
        return null;
    }
  };

  const sidebarSections = enabledSections.filter(
    (section) => section.id === "basic" || section.id === "selfEvaluation"
  );
  const contentSections = enabledSections.filter(
    (section) => section.id !== "basic" && section.id !== "selfEvaluation"
  );

  return (
    <table
      className="w-full border-collapse"
      style={{
        minHeight: `calc(297mm - ${pagePadding * 2}px)`,
        tableLayout: "fixed",
        backgroundColor: template.colorScheme.background,
        color: template.colorScheme.text,
      }}
    >
      <tbody>
        <tr>
          <td
            className="relative align-top overflow-hidden"
            style={{ width: "34%", backgroundColor: "#eef6fb" }}
          >
            <div
              aria-hidden="true"
              className="absolute left-0 right-[29%] top-0 h-[7px]"
              style={{ backgroundColor: themeColor }}
            />
            <div
              aria-hidden="true"
              className="absolute -left-16 top-36 h-56 w-56 rounded-[44%] border-[34px] border-white/60"
            />
            <div
              className="relative z-[1] flex min-h-full flex-col px-7 pb-8 pt-12"
              style={{ minHeight: `calc(297mm - ${pagePadding * 2}px)` }}
            >
              {sidebarSections.map((section) => (
                <div
                  key={section.id}
                  className={section.id === "selfEvaluation" ? "mt-24" : ""}
                >
                  {renderSection(section.id)}
                </div>
              ))}
            </div>
          </td>
          <td className="relative align-top" style={{ width: "66%" }}>
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-0 top-0 h-[7px]"
              style={{ backgroundColor: themeColor }}
            />
            <div className="px-8 pb-8 pt-12">
              {contentSections.map((section) => (
                <div key={section.id}>{renderSection(section.id)}</div>
              ))}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default BlueSidebarTemplate;
