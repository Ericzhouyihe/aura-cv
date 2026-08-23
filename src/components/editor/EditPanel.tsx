import React from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useResumeStore } from "@/store/useResumeStore";
import { cn } from "@/lib/utils";
import BasicPanel from "./basic/BasicPanel";
import EducationPanel from "./education/EducationPanel";
import ProjectPanel from "./project/ProjectPanel";
import ExperiencePanel from "./experience/ExperiencePanel";
import CustomPanel from "./custom/CustomPanel";
import SkillPanel from "./skills/SkillPanel";
import SelfEvaluationPanel from "./self-evaluation/SelfEvaluationPanel";
import CertificatesPanel from "./certificates/CertificatesPanel";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function EditPanel() {
  const { activeResume, updateMenuSections, toggleSectionVisibility } = useResumeStore();
  if (!activeResume) return;
  const { activeSection = "", menuSections = [] } = activeResume || {};

  const renderFields = () => {
    switch (activeSection) {
      case "basic":
        return <BasicPanel />;

      case "projects":
        return <ProjectPanel />;
      case "education":
        return <EducationPanel />;
      case "experience":
        return <ExperiencePanel />;
      case "skills":
        return <SkillPanel />;
      case "selfEvaluation":
        return <SelfEvaluationPanel />;
      case "certificates":
        return <CertificatesPanel />;
      default:
        if (activeSection?.startsWith("custom")) {
          return <CustomPanel sectionId={activeSection} />;
        } else {
          return <BasicPanel />;
        }
    }
  };

  return (
    <motion.div
      className={cn(
        "h-full w-full overflow-y-auto",
        "bg-background border-border"
      )}
    >
      <div className="p-3 min-[1100px]:p-4">
        <motion.div
          className={cn(
            "mb-3 rounded-md border p-3 xl:mb-4 xl:p-4",
            "bg-card border-border"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {menuSections?.find((s) => s.id === activeSection)?.icon}
            </span>

            {activeSection === "basic" ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  className={cn(
                    "flex-1 text-lg font-medium text-primary border-black bg-transparent outline-none pb-1 text-primary"
                  )}
                  type="text"
                  value={
                    menuSections?.find((s) => s.id === activeSection)?.title
                  }
                  onChange={(e) => {
                    const newMenuSections = menuSections.map((s) => {
                      if (s.id === activeSection) {
                        return {
                          ...s,
                          title: e.target.value,
                        };
                      }
                      return s;
                    });
                    updateMenuSections(newMenuSections);
                  }}
                />
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Pencil size={16} className="text-primary shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>点击文字部分即可聚焦编辑</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <button
                  type="button"
                  aria-label={`${menuSections?.find((s) => s.id === activeSection)?.enabled ? "隐藏" : "显示"}基本信息`}
                  title={`${menuSections?.find((s) => s.id === activeSection)?.enabled ? "隐藏" : "显示"}基本信息`}
                  onClick={() => toggleSectionVisibility("basic")}
                  className={cn(
                    "p-1.5 rounded-md",
                    "hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  )}
                >
                  {menuSections?.find((s) => s.id === activeSection)?.enabled ? (
                    <Eye className="w-4 h-4 text-primary" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <>
                <input
                  className={cn(
                    "flex-1 text-lg  font-medium  text-primary border-black  bg-transparent outline-none   pb-1 text-primary"
                  )}
                  type="text"
                  value={
                    menuSections?.find((s) => s.id === activeSection)?.title
                  }
                  onChange={(e) => {
                    const newMenuSections = menuSections.map((s) => {
                      if (s.id === activeSection) {
                        return {
                          ...s,
                          title: e.target.value,
                        };
                      }
                      return s;
                    });
                    updateMenuSections(newMenuSections);
                  }}
                />
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Pencil size={16} className="text-primary" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>点击文字部分即可聚焦编辑</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          className={cn(
            "rounded-lg",
            "bg-card border-border"
          )}
        >
          {renderFields()}
        </motion.div>
      </div>
    </motion.div>
  );
}
