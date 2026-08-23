import { useState } from "react";
import { LayoutList } from "lucide-react";
import { ModuleNavigator } from "@/components/workbench/ModuleNavigator";
import { ModuleTabStrip } from "@/components/workbench/ModuleTabStrip";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTranslations } from "@/i18n/compat/client";

export function ModuleTabs() {
  const [modulesOpen, setModulesOpen] = useState(false);
  const t = useTranslations("workbench.desktop");

  return (
    <div className="h-16 shrink-0">
      <div className="flex h-full min-w-0 overflow-hidden rounded-lg border border-border bg-background">
        <ModuleTabStrip />

        <Button
          type="button"
          variant="ghost"
          className="h-full min-w-[88px] shrink-0 flex-col gap-1 rounded-none border-l border-border px-3 py-2 text-xs font-medium"
          aria-label={t("manageModulesAria")}
          onClick={() => setModulesOpen(true)}
        >
          <LayoutList className="h-[18px] w-[18px]" />
          <span>{t("manageModules")}</span>
        </Button>
      </div>

      <Sheet open={modulesOpen} onOpenChange={setModulesOpen}>
        <SheetContent className="flex w-[min(420px,calc(100vw-16px))] flex-col gap-0 p-0 sm:max-w-[420px]">
          <SheetHeader className="shrink-0 border-b border-border px-4 py-4 pr-12 text-left">
            <SheetTitle>{t("manageModules")}</SheetTitle>
            <SheetDescription>{t("modulesDescription")}</SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <ModuleNavigator onSectionCreated={() => setModulesOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
