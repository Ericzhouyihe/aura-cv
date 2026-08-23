import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Palette,
  SpaceIcon,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";
import debounce from "lodash/debounce";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "@/i18n/compat/client";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";
import { THEME_COLORS } from "@/types/resume";
import { getFontOptions, normalizeFontFamily } from "@/utils/fonts";

interface SettingGroupProps {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

function SettingGroup({
  icon: Icon,
  title,
  action,
  children,
}: SettingGroupProps) {
  return (
    <section className="border-b border-border pb-5 last:border-b-0 last:pb-0">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span>{title}</span>
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

interface SpacingControlProps {
  label: string;
  value: number;
  sliderMin: number;
  sliderMax: number;
  inputMin: number;
  inputMax: number;
  onSliderChange: (value: number) => void;
  onInputChange: (value: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  incrementLabel: string;
  decrementLabel: string;
}

function SpacingControl({
  label,
  value,
  sliderMin,
  sliderMax,
  inputMin,
  inputMax,
  onSliderChange,
  onInputChange,
  onIncrement,
  onDecrement,
  incrementLabel,
  decrementLabel,
}: SpacingControlProps) {
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-4">
        <Slider
          aria-label={label}
          value={[value]}
          min={sliderMin}
          max={sliderMax}
          step={1}
          onValueChange={([nextValue]) => onSliderChange(nextValue)}
          className="flex-1"
        />
        <div className="flex items-center">
          <div className="flex h-8 w-20 overflow-hidden rounded-md border border-input">
            <Input
              aria-label={label}
              type="number"
              min={inputMin}
              max={inputMax}
              step={1}
              value={value}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                if (!isNaN(nextValue)) {
                  onInputChange(nextValue);
                }
              }}
              className="no-spinner h-full w-12 border-0 text-center focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <div className="flex flex-col border-l border-input">
              <button
                type="button"
                className="flex h-4 w-8 items-center justify-center border-b border-input bg-transparent text-muted-foreground hover:bg-accent"
                onClick={onIncrement}
              >
                <span className="sr-only">{incrementLabel}</span>
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="flex h-4 w-8 items-center justify-center bg-transparent text-muted-foreground hover:bg-accent"
                onClick={onDecrement}
              >
                <span className="sr-only">{decrementLabel}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
          <span className="ml-1 text-sm text-muted-foreground">px</span>
        </div>
      </div>
    </div>
  );
}

export function StyleSettingsPanel() {
  const { activeResume, updateGlobalSettings, setThemeColor } = useResumeStore();
  const { globalSettings = {} } = activeResume || {};
  const { themeColor = THEME_COLORS[0] } = globalSettings;
  const t = useTranslations("workbench.sidePanel");
  const tToolbar = useTranslations("workbench.toolbar");
  const fontOptions = getFontOptions((key) => t(`typography.font.${key}`));
  const selectedFontFamily = normalizeFontFamily(globalSettings?.fontFamily);

  const debouncedSetColor = useMemo(
    () =>
      debounce((value: string) => {
        setThemeColor(value);
      }, 100),
    []
  );

  const fontSizes = [12, 13, 14, 15, 16, 18, 20, 24];
  const pagePadding = globalSettings?.pagePadding || 0;
  const sectionSpacing = globalSettings?.sectionSpacing || 0;
  const paragraphSpacing = globalSettings?.paragraphSpacing || 0;

  return (
    <div className="space-y-5 border border-border bg-card p-4 shadow-sm">
      <SettingGroup
        icon={Palette}
        title={t("theme.title")}
        action={
          <ColorPicker
            value={themeColor}
            onChange={(value) => debouncedSetColor(value)}
            className={cn(
              "flex h-7 w-auto items-center gap-1.5 rounded-full border px-3 py-0 shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
              !THEME_COLORS.includes(themeColor)
                ? "border-primary/40 bg-primary/5 text-primary hover:border-primary/60 hover:bg-primary/10"
                : "border-border bg-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
            style={{ backgroundColor: "transparent" }}
            title={t("theme.custom")}
          >
            <Palette className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{t("theme.custom")}</span>
            {!THEME_COLORS.includes(themeColor) && (
              <div
                className="ml-0.5 h-2.5 w-2.5 rounded-full border border-primary/20 shadow-sm"
                style={{ backgroundColor: themeColor }}
              />
            )}
          </ColorPicker>
        }
      >
        <div className="flex flex-wrap gap-2.5 pt-1">
          {THEME_COLORS.map((presetTheme) => (
            <button
              key={presetTheme}
              className={cn(
                "group relative h-6 w-6 overflow-hidden rounded-full transition-all duration-200 focus:outline-none",
                themeColor === presetTheme
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "ring-1 ring-border hover:scale-110 hover:ring-primary/50"
              )}
              onClick={() => setThemeColor(presetTheme)}
              title={presetTheme}
            >
              <div
                className="absolute inset-0"
                style={{ backgroundColor: presetTheme }}
              />
            </button>
          ))}
        </div>
      </SettingGroup>

      <SettingGroup icon={Type} title={t("typography.title")}>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              {t("typography.font.title")}
            </Label>
            <Select
              value={selectedFontFamily}
              onValueChange={(value) =>
                updateGlobalSettings?.({ fontFamily: value })
              }
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <SelectTrigger
                  aria-label={t("typography.font.title")}
                  className="border border-input bg-background transition-colors"
                >
                  <SelectValue />
                </SelectTrigger>
              </motion.div>
              <SelectContent className="border-border bg-popover">
                {fontOptions.map((font) => (
                  <SelectItem
                    key={font.value}
                    value={font.value}
                    className="cursor-pointer transition-colors hover:bg-accent focus:bg-accent"
                  >
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs leading-5 text-muted-foreground">
              {t("typography.font.note")}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">
              {t("typography.lineHeight.title")}
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                aria-label={t("typography.lineHeight.title")}
                value={[globalSettings?.lineHeight || 1.5]}
                min={1}
                max={2}
                step={0.1}
                onValueChange={([value]) =>
                  updateGlobalSettings?.({ lineHeight: value })
                }
              />
              <span className="min-w-[3ch] text-sm text-muted-foreground">
                {globalSettings?.lineHeight}
              </span>
            </div>
          </div>

          {[
            ["baseFontSize", "typography.baseFontSize.title"],
            ["headerSize", "typography.headerSize.title"],
            ["subheaderSize", "typography.subheaderSize.title"],
          ].map(([setting, label]) => (
            <div key={setting} className="space-y-2">
              <Label className="text-muted-foreground">{t(label)}</Label>
              <Select
                value={globalSettings?.[
                  setting as "baseFontSize" | "headerSize" | "subheaderSize"
                ]?.toString()}
                onValueChange={(value) =>
                  updateGlobalSettings?.({
                    [setting]: parseInt(value),
                  })
                }
              >
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <SelectTrigger
                    aria-label={t(label)}
                    className="border border-input bg-background transition-colors"
                  >
                    <SelectValue />
                  </SelectTrigger>
                </motion.div>
                <SelectContent className="border-border bg-popover">
                  {fontSizes.map((size) => (
                    <SelectItem
                      key={size}
                      value={size.toString()}
                      className="cursor-pointer transition-colors hover:bg-accent focus:bg-accent"
                    >
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </SettingGroup>

      <SettingGroup icon={SpaceIcon} title={t("spacing.title")}>
        <div className="space-y-6">
          <SpacingControl
            label={t("spacing.pagePadding.title")}
            value={pagePadding}
            sliderMin={0}
            sliderMax={100}
            inputMin={1}
            inputMax={100}
            onSliderChange={(value) =>
              updateGlobalSettings?.({ pagePadding: value })
            }
            onInputChange={(value) => {
              if (value >= 0 && value <= 100) {
                updateGlobalSettings?.({ pagePadding: value });
              }
            }}
            onIncrement={() => {
              if (pagePadding < 100) {
                updateGlobalSettings?.({ pagePadding: pagePadding + 1 });
              }
            }}
            onDecrement={() => {
              if (pagePadding > 0) {
                updateGlobalSettings?.({ pagePadding: pagePadding - 1 });
              }
            }}
            incrementLabel={tToolbar("increase")}
            decrementLabel={tToolbar("decrease")}
          />

          <SpacingControl
            label={t("spacing.sectionSpacing.title")}
            value={sectionSpacing}
            sliderMin={1}
            sliderMax={100}
            inputMin={1}
            inputMax={100}
            onSliderChange={(value) =>
              updateGlobalSettings?.({ sectionSpacing: value })
            }
            onInputChange={(value) => {
              if (value >= 1 && value <= 100) {
                updateGlobalSettings?.({ sectionSpacing: value });
              }
            }}
            onIncrement={() => {
              if (sectionSpacing < 100) {
                updateGlobalSettings?.({ sectionSpacing: sectionSpacing + 1 });
              }
            }}
            onDecrement={() => {
              if (sectionSpacing > 1) {
                updateGlobalSettings?.({ sectionSpacing: sectionSpacing - 1 });
              }
            }}
            incrementLabel={tToolbar("increase")}
            decrementLabel={tToolbar("decrease")}
          />

          <SpacingControl
            label={t("spacing.paragraphSpacing.title")}
            value={paragraphSpacing}
            sliderMin={1}
            sliderMax={50}
            inputMin={1}
            inputMax={100}
            onSliderChange={(value) =>
              updateGlobalSettings?.({ paragraphSpacing: value })
            }
            onInputChange={(value) => {
              if (value >= 1) {
                updateGlobalSettings?.({ paragraphSpacing: value });
              }
            }}
            onIncrement={() => {
              if (paragraphSpacing < 100) {
                updateGlobalSettings?.({
                  paragraphSpacing: paragraphSpacing + 1,
                });
              }
            }}
            onDecrement={() => {
              if (paragraphSpacing > 1) {
                updateGlobalSettings?.({
                  paragraphSpacing: paragraphSpacing - 1,
                });
              }
            }}
            incrementLabel={tToolbar("increase")}
            decrementLabel={tToolbar("decrease")}
          />
        </div>
      </SettingGroup>

      <SettingGroup icon={Zap} title={t("mode.title")}>
        <div className="space-y-4">
          {[
            ["useIconMode", "mode.useIconMode.title"],
            ["centerSubtitle", "mode.centerSubtitle.title"],
            ["flexibleHeaderLayout", "mode.flexibleHeaderLayout.title"],
          ].map(([setting, label]) => (
            <div key={setting} className="space-y-2">
              <Label className="text-muted-foreground">{t(label)}</Label>
              <div className="flex items-center gap-4">
                <Switch
                  aria-label={t(label)}
                  checked={
                    globalSettings[
                      setting as
                        | "useIconMode"
                        | "centerSubtitle"
                        | "flexibleHeaderLayout"
                    ]
                  }
                  onCheckedChange={(checked) =>
                    updateGlobalSettings({ [setting]: checked })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </SettingGroup>
    </div>
  );
}
