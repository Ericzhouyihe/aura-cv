import { useMemo } from "react";
import { motion } from "framer-motion";
import { Layout, Plus } from "lucide-react";
import { DEFAULT_TEMPLATES } from "@/components/templates/registry";
import { STANDARD_MODULES } from "@/config/modules";
import LayoutSetting from "@/components/editor/layout/LayoutSetting";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "@/i18n/compat/client";
import { useResumeStore } from "@/store/useResumeStore";
import type { MenuSection } from "@/types/resume";

interface ModuleNavigatorProps {
  onSectionCreated?: () => void;
}

export function ModuleNavigator({
  onSectionCreated,
}: ModuleNavigatorProps = {}) {
  const {
    activeResume,
    setActiveSection,
    toggleSectionVisibility,
    updateMenuSections,
    reorderSections,
    createCustomSection,
    deleteSection,
  } = useResumeStore();
  const {
    menuSections = [],
    activeSection,
    customData = {},
  } = activeResume || {};
  const t = useTranslations("workbench.sidePanel");

  const currentTemplate =
    DEFAULT_TEMPLATES.find(
      (template) => template.id === activeResume?.templateId
    ) ?? DEFAULT_TEMPLATES[0];

  const availableModules = useMemo(() => {
    return (
      currentTemplate?.availableSections
        ?.map((id) => STANDARD_MODULES[id])
        .filter(Boolean) || []
    );
  }, [currentTemplate]);

  const filteredModules = useMemo(() => {
    const existingIds = new Set(menuSections.map((section) => section.id));
    return availableModules.filter((module) => !existingIds.has(module.id));
  }, [availableModules, menuSections]);

  const handleCreateSection = () => {
    const usedIds = new Set([
      ...menuSections.map((section: MenuSection) => section.id),
      ...Object.keys(customData),
    ]);

    let nextNum = 1;
    while (usedIds.has(`custom-${nextNum}`)) {
      nextNum += 1;
    }

    const sectionId = `custom-${nextNum}`;
    createCustomSection({
      id: sectionId,
      title: sectionId,
      icon: "➕",
      enabled: true,
      order: menuSections.length,
    });
    onSectionCreated?.();
  };

  return (
    <section className="border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 px-4 pt-4 text-base font-medium text-foreground">
        <Layout className="h-4 w-4 text-muted-foreground" />
        <h2>{t("layout.title")}</h2>
      </div>

      <div className="p-4">
        <LayoutSetting
          menuSections={menuSections}
          activeSection={activeSection || ""}
          setActiveSection={setActiveSection}
          toggleSectionVisibility={toggleSectionVisibility}
          deleteSection={deleteSection}
          reorderSections={reorderSections}
        />

        <div className="space-y-2 pt-4">
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.9 }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <Plus className="h-4 w-4" />
                {t("layout.addCustomSection")}
              </motion.button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-1"
              align="center"
            >
              <div className="flex flex-col gap-1">
                {filteredModules.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      const newSection = {
                        id: section.id,
                        title: t(
                          `layout.standardSections.${section.titleKey}`
                        ),
                        icon: section.icon,
                        enabled: true,
                        order: menuSections.length,
                      };
                      updateMenuSections([...menuSections, newSection]);
                      setActiveSection(section.id);
                      onSectionCreated?.();
                    }}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span>
                      {t(`layout.standardSections.${section.titleKey}`)}
                    </span>
                  </button>
                ))}

                {filteredModules.length > 0 && (
                  <div className="my-1 h-px bg-border" />
                )}

                <button
                  onClick={handleCreateSection}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm italic text-muted-foreground transition-colors hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                  {t("layout.addCustomSectionOption")}
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </section>
  );
}
