import {
  useCallback,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Baseline,
  FileText,
  Palette,
  PanelsLeftBottom,
  Settings2,
  SpellCheck2,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import TemplateSheet from "@/components/shared/TemplateSheet";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StyleSettingsPanel } from "@/components/workbench/StyleSettingsPanel";
import type { PreviewGeometry } from "@/components/preview/preview-geometry";
import { useAIConfiguration } from "@/hooks/useAIConfiguration";
import { useGrammarCheck } from "@/hooks/useGrammarCheck";
import { useTranslations } from "@/i18n/compat/client";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";
import { THEME_COLORS } from "@/types/resume";
import { getFontOptions, normalizeFontFamily } from "@/utils/fonts";

const FONT_SIZES = [12, 13, 14, 15, 16, 18, 20, 24];
const toolbarItemClassName =
  "h-full min-w-[64px] shrink-0 flex-col justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium leading-none text-muted-foreground hover:bg-accent hover:text-foreground [&_svg]:h-[18px] [&_svg]:w-[18px]";

interface ToolbarItemContentProps {
  icon: ReactNode;
  label: ReactNode;
}

function ToolbarItemContent({ icon, label }: ToolbarItemContentProps) {
  return (
    <>
      <span className="flex h-5 items-center justify-center" aria-hidden="true">
        {icon}
      </span>
      <span className="max-w-[92px] truncate leading-4">{label}</span>
    </>
  );
}

interface ToolbarIconButtonProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
}

function ToolbarIconButton({
  label,
  onClick,
  active = false,
  disabled = false,
  children,
}: ToolbarIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            toolbarItemClassName,
            active && "bg-primary/10 text-primary hover:bg-primary/15"
          )}
          aria-label={label}
          title={label}
          onClick={onClick}
          disabled={disabled}
        >
          <ToolbarItemContent icon={children} label={label} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

interface PreviewToolbarProps {
  mobile?: boolean;
  geometry?: PreviewGeometry | null;
}

export function PreviewToolbar({
  mobile = false,
  geometry,
}: PreviewToolbarProps = {}) {
  const t = useTranslations("previewDock");
  const tStyle = useTranslations("workbench.sidePanel");
  const tToolbar = useTranslations("workbench.toolbar");
  const { checkGrammar, isChecking } = useGrammarCheck();
  const { checkConfiguration } = useAIConfiguration();
  const {
    activeResume,
    setThemeColor,
    updateGlobalSettings,
  } = useResumeStore();
  const { globalSettings = {} } = activeResume || {};
  const selectedFontFamily = normalizeFontFamily(globalSettings.fontFamily);
  const themeColor = globalSettings.themeColor || THEME_COLORS[0];
  const fontOptions = useMemo(
    () => getFontOptions((key) => tStyle(`typography.font.${key}`)),
    [tStyle]
  );
  const selectedFontLabel =
    fontOptions.find((font) => font.value === selectedFontFamily)?.label ??
    selectedFontFamily;

  const handleGrammarCheck = useCallback(async () => {
    if (!checkConfiguration()) return;

    try {
      const previewContent = document.getElementById("resume-preview");
      const text = previewContent?.innerText?.trim();

      if (!text) {
        toast.error(t("grammarCheck.errorToast"));
        return;
      }

      await checkGrammar(text);
    } catch {
      toast.error(t("grammarCheck.errorToast"));
    }
  }, [checkConfiguration, checkGrammar, t]);

  const toggleAutoOnePage = () => {
    const nextValue = !globalSettings.autoOnePage;
    updateGlobalSettings({ autoOnePage: nextValue });
    toast.success(
      nextValue ? t("autoOnePage.enabled") : t("autoOnePage.disabled")
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "shrink-0",
          mobile ? "h-16 bg-workbench-canvas p-1" : "relative h-16"
        )}
      >
        <div
          className={cn(
            "h-full overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-background",
            mobile && "scrollbar-subtle-x"
          )}
          style={
            !mobile && geometry
              ? {
                  width: `${geometry.pageWidth}px`,
                  marginLeft: `${geometry.pageLeft}px`,
                }
              : undefined
          }
        >
          <div className="flex h-full min-w-max items-stretch gap-0.5 px-1">
            <Tooltip>
              <TemplateSheet
                trigger={
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className={toolbarItemClassName}
                      aria-label={t("switchTemplate")}
                      title={t("switchTemplate")}
                    >
                      <ToolbarItemContent
                        icon={<PanelsLeftBottom />}
                        label={t("switchTemplate")}
                      />
                    </Button>
                  </TooltipTrigger>
                }
              />
              <TooltipContent>{t("switchTemplate")}</TooltipContent>
            </Tooltip>

            <Select
              value={selectedFontFamily}
              onValueChange={(fontFamily) =>
                updateGlobalSettings({ fontFamily })
              }
            >
              <SelectTrigger
                className={cn(
                  toolbarItemClassName,
                  "relative w-[108px] border-0 bg-transparent pr-5 shadow-none focus:ring-1 focus:ring-ring focus:ring-offset-0 [&>svg]:absolute [&>svg]:right-1.5 [&>svg]:top-1/2 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:-translate-y-1/2"
                )}
                aria-label={tToolbar("selectFont")}
                title={tToolbar("selectFont")}
              >
                <span className="flex h-5 items-center justify-center" aria-hidden="true">
                  <Type className="h-[18px] w-[18px]" />
                </span>
                <SelectValue>
                  <span className="block max-w-[82px] truncate leading-4">
                    {selectedFontLabel}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={(globalSettings.baseFontSize || 16).toString()}
              onValueChange={(value) =>
                updateGlobalSettings({ baseFontSize: Number(value) })
              }
            >
              <SelectTrigger
                className={cn(
                  toolbarItemClassName,
                  "relative w-[68px] border-0 bg-transparent pr-5 shadow-none focus:ring-1 focus:ring-ring focus:ring-offset-0 [&>svg]:absolute [&>svg]:right-1.5 [&>svg]:top-1/2 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:-translate-y-1/2"
                )}
                aria-label={tToolbar("selectFontSize")}
                title={tToolbar("selectFontSize")}
              >
                <span className="flex h-5 items-center justify-center" aria-hidden="true">
                  <Baseline className="h-[18px] w-[18px]" />
                </span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}px
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ColorPicker
              value={themeColor}
              onChange={setThemeColor}
              variant="ghost"
              className={cn(
                toolbarItemClassName,
                "w-[64px] overflow-visible border-0 hover:scale-100"
              )}
              style={{ backgroundColor: "transparent" } as CSSProperties}
              aria-label={tToolbar("selectThemeColor")}
              title={tToolbar("selectThemeColor")}
            >
              <ToolbarItemContent
                icon={
                  <span
                    className="h-[18px] w-[18px] rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: themeColor }}
                  />
                }
                label={tToolbar("themeColor")}
              />
            </ColorPicker>

            {!mobile && (
              <Sheet>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className={toolbarItemClassName}
                        aria-label={tToolbar("openStyleSettings")}
                        title={tToolbar("openStyleSettings")}
                      >
                        <ToolbarItemContent
                          icon={<Settings2 />}
                          label={tToolbar("styleSettings")}
                        />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{tToolbar("styleSettings")}</TooltipContent>
                </Tooltip>
                <SheetContent className="w-[420px] overflow-y-auto p-4 sm:max-w-[420px]">
                  <SheetHeader className="mb-4 pr-8">
                    <SheetTitle>{tToolbar("styleSettings")}</SheetTitle>
                    <SheetDescription>
                      {tToolbar("styleSettingsDescription")}
                    </SheetDescription>
                  </SheetHeader>
                  <StyleSettingsPanel />
                </SheetContent>
              </Sheet>
            )}

            <div className="my-3 mx-0.5 w-px shrink-0 bg-border" />

            <ToolbarIconButton
              label={
                isChecking
                  ? t("grammarCheck.checking")
                  : t("grammarCheck.idle")
              }
              onClick={handleGrammarCheck}
              disabled={isChecking}
            >
              <SpellCheck2 className={cn(isChecking && "animate-spin")} />
            </ToolbarIconButton>

            <ToolbarIconButton
              label={t("autoOnePage.tooltip")}
              active={Boolean(globalSettings.autoOnePage)}
              onClick={toggleAutoOnePage}
            >
              <FileText />
            </ToolbarIconButton>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
