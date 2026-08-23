import { useState } from "react";
import { Eye, FileText, LayoutList, Palette } from "lucide-react";
import { EditPanel } from "@/components/editor/EditPanel";
import PreviewPanel from "@/components/preview";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ModuleNavigator } from "@/components/workbench/ModuleNavigator";
import { ModuleTabStrip } from "@/components/workbench/ModuleTabStrip";
import { PreviewToolbar } from "@/components/workbench/PreviewToolbar";
import { StyleSettingsPanel } from "@/components/workbench/StyleSettingsPanel";
import { useTranslations } from "@/i18n/compat/client";
import { cn } from "@/lib/utils";

type WorkbenchMode = "content" | "preview";

export function MobileWorkbench() {
  const t = useTranslations("workbench.mobile");
  const tToolbar = useTranslations("workbench.toolbar");
  const [activeMode, setActiveMode] = useState<WorkbenchMode>("content");
  const [modulesOpen, setModulesOpen] = useState(false);
  const [stylesOpen, setStylesOpen] = useState(false);

  const handleSectionCreated = () => {
    setModulesOpen(false);
    setActiveMode("content");
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border bg-background py-2">
        <div className="scrollbar-hide w-full min-w-0 overflow-x-auto px-2">
          <div className="flex w-max min-w-full items-center gap-2">
            <div
              className="grid min-w-[154px] flex-1 grid-cols-2 rounded-md bg-muted p-0.5"
              aria-label={t("viewLabel")}
            >
            <button
              type="button"
              onClick={() => setActiveMode("content")}
              aria-label={t("contentAria")}
              aria-pressed={activeMode === "content"}
              className={cn(
                "flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-[4px] px-2 text-xs font-medium transition-colors",
                activeMode === "content"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t("content")}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode("preview")}
              aria-label={t("previewAria")}
              aria-pressed={activeMode === "preview"}
              className={cn(
                "flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-[4px] px-2 text-xs font-medium transition-colors",
                activeMode === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t("preview")}</span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 px-2.5 text-xs"
            aria-label={t("manageModulesAria")}
            onClick={() => setModulesOpen(true)}
          >
            <LayoutList className="h-4 w-4 shrink-0" />
            <span>{t("manageModules")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 shrink-0 gap-1.5 px-2.5 text-xs"
            aria-label={tToolbar("openStyleSettings")}
            onClick={() => setStylesOpen(true)}
          >
            <Palette className="h-4 w-4 shrink-0" />
            <span>{tToolbar("styleSettings")}</span>
          </Button>
          </div>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {activeMode === "content" ? (
          <div className="flex h-full min-h-0 flex-col">
            <div className="h-16 shrink-0 border-b border-border bg-background">
              <ModuleTabStrip touchOptimized />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
              <EditPanel />
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
            <PreviewToolbar mobile />
            <div
              className="min-h-0 flex-1 overflow-auto"
              data-preview-scroll-container="true"
            >
              <PreviewPanel />
            </div>
          </div>
        )}

        {activeMode === "content" && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[-10000px] top-0 h-px w-[794px] overflow-hidden opacity-0"
          >
            <PreviewPanel />
          </div>
        )}
      </div>

      <Sheet open={modulesOpen} onOpenChange={setModulesOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[86dvh] flex-col gap-0 p-0"
        >
          <SheetHeader className="shrink-0 border-b border-border px-4 py-3 pr-12 text-left">
            <SheetTitle className="text-base">{t("manageModules")}</SheetTitle>
            <SheetDescription className="text-xs">
              {t("modulesDescription")}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 overflow-y-auto p-3">
            <ModuleNavigator onSectionCreated={handleSectionCreated} />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={stylesOpen} onOpenChange={setStylesOpen}>
        <SheetContent
          side="bottom"
          className="flex max-h-[86dvh] flex-col gap-0 p-0"
        >
          <SheetHeader className="shrink-0 border-b border-border px-4 py-3 pr-12 text-left">
            <SheetTitle className="text-base">
              {tToolbar("styleSettings")}
            </SheetTitle>
            <SheetDescription className="text-xs">
              {tToolbar("styleSettingsDescription")}
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 overflow-y-auto p-3">
            <StyleSettingsPanel />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
