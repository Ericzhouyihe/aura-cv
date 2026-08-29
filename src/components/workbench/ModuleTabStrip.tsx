import { useEffect, useMemo, useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, X } from "lucide-react";
import { mergeEnabledSectionOrder } from "@/components/workbench/module-tabs-order";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTranslations } from "@/i18n/compat/client";
import { cn } from "@/lib/utils";
import { getModuleDisplayTitle } from "@/lib/moduleTitle";
import { useResumeStore } from "@/store/useResumeStore";
import type { MenuSection } from "@/types/resume";

const tabClassName =
  "relative flex h-full w-[76px] min-w-[76px] flex-col items-center justify-center gap-1 rounded-md px-2 pb-2 pt-2 text-xs font-medium transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity";

interface DraggableModuleTabProps {
  section: MenuSection;
  active: boolean;
  touchOptimized: boolean;
  buttonRef: (element: HTMLButtonElement | null) => void;
  onActivate: () => void;
  onDelete: () => void;
}

function DraggableModuleTab({
  section,
  active,
  touchOptimized,
  buttonRef,
  onActivate,
  onDelete,
}: DraggableModuleTabProps) {
  const dragControls = useDragControls();
  const t = useTranslations("workbench.desktop");
  const tCommon = useTranslations("common");
  const tSections = useTranslations(
    "workbench.sidePanel.layout.standardSections"
  );
  const displayTitle = getModuleDisplayTitle(section, tSections);

  return (
    <Reorder.Item
      as="div"
      value={section}
      dragListener={!touchOptimized}
      dragControls={dragControls}
      className={cn(
        "group relative flex h-full w-[76px] min-w-[76px] items-stretch",
        touchOptimized
          ? "cursor-default"
          : "cursor-grab active:cursor-grabbing"
      )}
      whileDrag={{ scale: 1.04, zIndex: 30 }}
      title={t("dragSection", { title: displayTitle })}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={onActivate}
        aria-label={t("editSection", { title: displayTitle })}
        aria-pressed={active}
        className={cn(
          tabClassName,
          active
            ? "bg-primary/10 text-primary after:opacity-100"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
      >
        <span
          className={cn(
            "relative flex h-5 w-8 items-center justify-center text-lg leading-none",
            touchOptimized && "touch-none cursor-grab active:cursor-grabbing"
          )}
          aria-hidden="true"
          onPointerDown={(event) => {
            if (!touchOptimized) return;
            dragControls.start(event);
          }}
        >
          {section.icon}
          {touchOptimized && (
            <GripVertical className="absolute -left-2 h-3 w-3 text-muted-foreground/50" />
          )}
        </span>
        <span className="block w-full truncate leading-4">{displayTitle}</span>
      </button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            aria-label={t("deleteSection", { title: displayTitle })}
            title={t("deleteSection", { title: displayTitle })}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "absolute right-0 top-0 z-10 flex items-center justify-center rounded-sm text-muted-foreground/60 transition-colors",
              "h-7 w-7 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            <X className="h-3 w-3" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tCommon("delete")} {displayTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tCommon("deleteModuleConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {tCommon("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Reorder.Item>
  );
}

interface ModuleTabStripProps {
  touchOptimized?: boolean;
  className?: string;
}

export function ModuleTabStrip({
  touchOptimized = false,
  className,
}: ModuleTabStripProps) {
  const t = useTranslations("workbench.desktop");
  const tSections = useTranslations(
    "workbench.sidePanel.layout.standardSections"
  );
  const { activeResume, setActiveSection, reorderSections, deleteSection } =
    useResumeStore();
  const { activeSection, menuSections = [] } = activeResume || {};
  const enabledSections = useMemo(
    () => menuSections.filter((section) => section.enabled),
    [menuSections]
  );
  const basicSection = enabledSections.find((section) => section.id === "basic");
  const draggableSections = enabledSections.filter(
    (section) => section.id !== "basic"
  );
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    if (enabledSections.length === 0) return;

    const activeIsVisible = enabledSections.some(
      (section) => section.id === activeSection
    );
    if (!activeIsVisible) {
      setActiveSection(enabledSections[0].id);
      return;
    }

    tabRefs.current[activeSection || ""]?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }, [activeSection, enabledSections, setActiveSection]);

  const handleReorder = (sections: MenuSection[]) => {
    reorderSections(mergeEnabledSectionOrder(menuSections, sections));
  };

  return (
    <ScrollArea className={cn("h-full min-w-0 flex-1 whitespace-nowrap", className)}>
      <div className="flex h-full min-w-max items-stretch px-1">
        {basicSection && (
          <button
            ref={(element) => {
              tabRefs.current[basicSection.id] = element;
            }}
            type="button"
            onClick={() => setActiveSection(basicSection.id)}
            aria-label={t("editSection", {
              title: basicSection
                ? getModuleDisplayTitle(basicSection, tSections)
                : ""
            })}
            aria-pressed={activeSection === basicSection.id}
            className={cn(
              tabClassName,
              activeSection === basicSection.id
                ? "bg-primary/10 text-primary after:opacity-100"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <span className="text-lg leading-none" aria-hidden="true">
              {basicSection.icon}
            </span>
            <span className="block w-full truncate leading-4">
              {basicSection && getModuleDisplayTitle(basicSection, tSections)}
            </span>
          </button>
        )}

        <Reorder.Group
          as="div"
          axis="x"
          values={draggableSections}
          onReorder={handleReorder}
          className="flex h-full items-stretch"
        >
          {draggableSections.map((section) => (
            <DraggableModuleTab
              key={section.id}
              section={section}
              active={activeSection === section.id}
              touchOptimized={touchOptimized}
              buttonRef={(element) => {
                tabRefs.current[section.id] = element;
              }}
              onActivate={() => setActiveSection(section.id)}
              onDelete={() => deleteSection(section.id)}
            />
          ))}
        </Reorder.Group>
      </div>
      <ScrollBar
        orientation="horizontal"
        className="h-1.5 border-t-0 bg-transparent p-0.5"
      />
    </ScrollArea>
  );
}
