import { useState } from "react";
import { LayoutList } from "lucide-react";
import { ModuleNavigator } from "@/components/workbench/ModuleNavigator";
import { ModuleTabStrip } from "@/components/workbench/ModuleTabStrip";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslations } from "@/i18n/compat/client";

export function ModuleTabs() {
  const [modulesOpen, setModulesOpen] = useState(false);
  const t = useTranslations("workbench.desktop");

  return (
    <div className="h-16 shrink-0">
      <div className="flex h-full min-w-0 overflow-hidden rounded-lg border border-border bg-background">
        <ModuleTabStrip />

        <Popover open={modulesOpen} onOpenChange={setModulesOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="h-full min-w-[88px] shrink-0 flex-col gap-1 rounded-none border-l border-border px-3 py-2 text-xs font-medium"
              aria-label={t("manageModulesAria")}
            >
              <LayoutList className="h-[18px] w-[18px]" />
              <span>{t("manageModules")}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={8}
            className="flex max-h-[min(680px,calc(100vh-96px))] w-[min(420px,calc(100vw-24px))] flex-col gap-0 overflow-hidden p-0"
          >
            <div className="shrink-0 border-b border-border px-4 py-4 text-left">
              <h2 className="text-base font-semibold">{t("manageModules")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("modulesDescription")}
              </p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <ModuleNavigator onSectionCreated={() => setModulesOpen(false)} />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
