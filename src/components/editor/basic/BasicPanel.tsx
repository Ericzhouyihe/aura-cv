import React, { useCallback, useEffect, useRef, useState } from "react";
import { PlusCircle, GripVertical, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "@/i18n/compat/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import PhotoUpload from "@/components/shared/PhotoSelector";
import IconSelector from "../IconSelector";
import AlignSelector from "./AlignSelector";
import Field from "../Field";
import { cn } from "@/lib/utils";
import { DEFAULT_FIELD_ORDER } from "@/config";
import { useResumeStore } from "@/store/useResumeStore";
import { BasicFieldType, CustomFieldType } from "@/types/resume";
import { generateUUID } from "@/utils/uuid";
interface CustomFieldProps {
  field: CustomFieldType;
  onUpdate: (field: CustomFieldType) => void;
  onDelete: (id: string) => void;
  onReorderEnd: () => void;
}

const itemAnimations = {
  initial: { opacity: 0, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 0 },
  transition: { type: "spring", stiffness: 500, damping: 50, mass: 1 },
};

const CustomField: React.FC<CustomFieldProps> = ({
  field,
  onUpdate,
  onDelete,
  onReorderEnd,
}) => {
  const t = useTranslations("workbench.basicPanel");

  return (
    <Reorder.Item
      value={field}
      id={field.id}
      className="group touch-none list-none"
      onDragEnd={onReorderEnd}
    >
      <motion.div
        {...itemAnimations}
        className={cn(
          "grid grid-cols-[auto_auto_minmax(0,1fr)] items-center gap-2 p-3 sm:grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)] md:grid-cols-[auto_auto_minmax(0,1fr)_minmax(0,1fr)_auto_auto] md:gap-3",
          "bg-card rounded-xl",
          "border border-border",
          "transition-all duration-200",
          "hover:border-primary/20",
          !field.visible && "!opacity-60"
        )}
      >
        <div className="flex items-center justify-center">
          <GripVertical
            className={cn(
              "w-4 h-4 cursor-grab active:cursor-grabbing",
              "text-muted-foreground",
              "transition-colors duration-200",
              "group-hover:text-foreground"
            )}
          />
        </div>
        <div className="flex items-center justify-center">
          <IconSelector
            value={field.icon}
            onChange={(value) => onUpdate({ ...field, icon: value })}
          />
        </div>
        <div className="col-span-3 min-w-0 sm:col-span-1">
          <Field
            value={field.label ?? ""}
            onChange={(value) =>
              onUpdate({
                ...field,
                label: value,
              })
            }
            placeholder={t("customFields.placeholders.label")}
            className={cn(
              "bg-background/50",
              "border-border",
              "focus:border-primary",
              "placeholder-muted-foreground"
            )}
          />
        </div>
        <div className="col-span-3 min-w-0 sm:col-span-2 md:col-span-1">
          <Field
            value={field.value}
            onChange={(value) =>
              onUpdate({
                ...field,
                value: value,
              })
            }
            placeholder={t("customFields.placeholders.value")}
            className={cn(
              "bg-background/50",
              "border-border",
              "focus:border-primary",
              "placeholder-muted-foreground"
            )}
          />
        </div>

        <div className="col-span-2 flex items-center gap-2 whitespace-nowrap sm:col-span-3 md:col-span-1">
          <Switch
            checked={field.displayLabel ?? false}
            onCheckedChange={(checked) =>
              onUpdate({
                ...field,
                displayLabel: checked,
              })
            }
          />
          <span className="text-xs text-muted-foreground">
            {t("customFields.displayLabel")}
          </span>
        </div>

        <div className="col-span-1 flex items-center justify-end space-x-1 md:col-span-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "shrink-0 h-8 px-2",
              "text-muted-foreground",
              "hover:text-foreground"
            )}
            onClick={() => onUpdate({ ...field, visible: !field.visible })}
          >
            {field.visible ? (
              <Eye className="w-4 h-4 text-primary" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(field.id)}
            className={cn(
              "shrink-0 h-8 px-2",
              "text-neutral-500 dark:text-neutral-400",
              "hover:text-red-600 dark:hover:text-red-400"
            )}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </motion.div>
    </Reorder.Item>
  );
};

const BasicPanel: React.FC = () => {
  const { activeResume, updateBasicInfo } = useResumeStore();
  const { basic } = activeResume || {};
  const [customFields, setCustomFields] = useState<CustomFieldType[]>(
    basic?.customFields?.map((field) => ({
      ...field,
      visible: field.visible ?? true,
    })) || []
  );
  const [basicFields, setBasicFields] = useState<BasicFieldType[]>(() => {
    if (!basic?.fieldOrder) {
      return DEFAULT_FIELD_ORDER;
    }
    return basic.fieldOrder.map((field) => ({
      ...field,
      visible: field.visible ?? true,
    }));
  });
  const customFieldsRef = useRef(customFields);
  const t = useTranslations("workbench.basicPanel");

  useEffect(() => {
    const nextBasicFields = (basic?.fieldOrder || DEFAULT_FIELD_ORDER).map(
      (field) => ({
        ...field,
        visible: field.visible ?? true,
      })
    );
    const nextCustomFields = (basic?.customFields || []).map((field) => ({
      ...field,
      visible: field.visible ?? true,
    }));

    customFieldsRef.current = nextCustomFields;
    setBasicFields(nextBasicFields);
    setCustomFields(nextCustomFields);
  }, [activeResume?.id, basic?.fieldOrder, basic?.customFields]);

  useEffect(() => {
    customFieldsRef.current = customFields;
  }, [customFields]);

  const moveField = (fieldId: string, direction: "up" | "down") => {
    const index = basicFields.findIndex((field) => field.id === fieldId);
    if (index < 0) return;

    // name(0) 与 title(1) 固定，不可移动
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 2 || targetIndex >= basicFields.length) return;

    const newFields = [...basicFields];
    [newFields[index], newFields[targetIndex]] = [
      newFields[targetIndex],
      newFields[index],
    ];
    setBasicFields(newFields);
    updateBasicInfo({
      ...basic,
      fieldOrder: newFields,
    });
  };

  const toggleFieldVisibility = (fieldId: string, isVisible: boolean) => {
    const newFields = basicFields.map((field) =>
      field.id === fieldId ? { ...field, visible: isVisible } : field
    );
    setBasicFields(newFields);
    updateBasicInfo({
      ...basic,
      fieldOrder: newFields,
    });
  };

  const addCustomField = () => {
    const fieldToAdd: CustomFieldType = {
      id: generateUUID(),
      label: "",
      value: "",
      icon: "User",
      visible: true,
      displayLabel: false,
    };
    const updatedFields = [...customFields, fieldToAdd];
    setCustomFields(updatedFields);
    updateBasicInfo({
      ...basic,
      customFields: updatedFields,
    });
  };

  const updateCustomField = (updatedField: CustomFieldType) => {
    const updatedFields = customFields.map((field) =>
      field.id === updatedField.id ? updatedField : field
    );
    setCustomFields(updatedFields);
    updateBasicInfo({
      ...basic,
      customFields: updatedFields,
    });
  };

  const deleteCustomField = (id: string) => {
    const updatedFields = customFields.filter((field) => field.id !== id);
    setCustomFields(updatedFields);
    updateBasicInfo({
      ...basic,
      customFields: updatedFields,
    });
  };

  const handleCustomFieldsReorder = (newOrder: CustomFieldType[]) => {
    customFieldsRef.current = newOrder;
    setCustomFields(newOrder);
  };

  const commitCustomFieldsReorder = useCallback(() => {
    updateBasicInfo({
      customFields: customFieldsRef.current,
    });
  }, [updateBasicInfo]);

  const renderBasicField = (field: BasicFieldType) => {
    const selectedIcon = basic?.icons?.[field.key] || "User";
    const isProtected = field.key === "name" || field.key === "title";
    const index = basicFields.findIndex((f) => f.id === field.id);
    const canMoveUp = index > 2;
    const canMoveDown = index >= 2 && index < basicFields.length - 1;

    return (
      <motion.div
        {...itemAnimations}
        layout
        key={field.id}
        className={cn(
          "flex flex-col gap-2 p-3",
          "bg-card rounded-lg",
          "border border-border",
          "transition-all duration-200",
          !field.visible && "opacity-75"
        )}
      >
        <div className="flex items-center gap-2">
          {!isProtected && (
            <IconSelector
              value={selectedIcon}
              onChange={(value) => {
                updateBasicInfo({
                  ...basic,
                  icons: {
                    ...(basic?.icons || {}),
                    [field.key]: value,
                  },
                });
              }}
            />
          )}

          <span className="flex-1 text-sm font-medium text-foreground">
            {t(`basicFields.${field.key}`)}
          </span>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "shrink-0 h-7 w-7 p-0",
                "text-neutral-500 dark:text-neutral-400",
                "hover:text-neutral-700 dark:hover:text-neutral-200"
              )}
              onClick={() => toggleFieldVisibility(field.id, !field.visible)}
            >
              {field.visible ? (
                <Eye className="w-3.5 h-3.5 text-primary" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </Button>

            {!isProtected && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "shrink-0 h-7 w-7 p-0",
                  "text-muted-foreground hover:text-foreground",
                  "disabled:opacity-30"
                )}
                disabled={!canMoveUp}
                onClick={() => moveField(field.id, "up")}
                title={t("fieldStyle.moveUp")}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </Button>
            )}

            {!isProtected && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "shrink-0 h-7 w-7 p-0",
                  "text-muted-foreground hover:text-foreground",
                  "disabled:opacity-30"
                )}
                disabled={!canMoveDown}
                onClick={() => moveField(field.id, "down")}
                title={t("fieldStyle.moveDown")}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        <Field
          label=""
          value={(basic?.[field.key] as string) ?? ""}
          onChange={(value) =>
            updateBasicInfo({
              ...basic,
              [field.key]: value,
            })
          }
          placeholder={`请输入${field.label}`}
          type={field.type}
        />
      </motion.div>
    );
  };

  return (
    <div className="space-y-6 p-3 sm:p-6">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">{t("layout")}</h2>
          <div className=" bg-card rounded-lg">
            <AlignSelector
              value={basic?.layout || "left"}
              onChange={(value) =>
                updateBasicInfo({
                  ...basic,
                  layout: value,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">{t("title")}</h2>
          </div>

          <div className="space-y-4">
            <motion.div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl p-3 border border-border"
              >
                <PhotoUpload />
              </motion.div>

              <motion.div className="space-y-6">
                <motion.div className="space-y-3">
                  <motion.h3 className="font-medium text-neutral-900 dark:text-neutral-200 px-1">
                    {t("basicField")}
                  </motion.h3>
                  <AnimatePresence mode="popLayout">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {basicFields.map((field) => renderBasicField(field))}
                    </div>
                  </AnimatePresence>
                </motion.div>

                <motion.div className="space-y-3">
                  <motion.h3 className="font-medium text-neutral-900 dark:text-neutral-200 px-1">
                    {t("customField")}
                  </motion.h3>
                  <AnimatePresence mode="popLayout">
                    <Reorder.Group
                      axis="y"
                      as="div"
                      values={customFields}
                      onReorder={handleCustomFieldsReorder}
                      className="space-y-3"
                    >
                      {Array.isArray(customFields) &&
                        customFields.map((field) => (
                          <CustomField
                            key={field.id}
                            field={field}
                            onUpdate={updateCustomField}
                            onDelete={deleteCustomField}
                            onReorderEnd={commitCustomFieldsReorder}
                          />
                        ))}
                    </Reorder.Group>
                  </AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button onClick={addCustomField} className="w-full mt-4">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      {t("customFields.addButton")}
                    </Button>
                  </motion.div>
                </motion.div>
                <motion.div className="space-y-3">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <motion.h3 className="font-medium text-neutral-900 dark:text-neutral-200 px-1">
                        {t("githubContributions")}
                      </motion.h3>

                      <Switch
                        checked={basic?.githubContributionsVisible}
                        onCheckedChange={(checked) =>
                          updateBasicInfo({
                            ...basic,
                            githubContributionsVisible: checked,
                          })
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <div className="flex flex-col gap-2 sm:ml-3 sm:flex-row sm:items-center">
                        <div className="shrink-0 sm:w-[110px]">Access Token</div>
                        <Input
                          placeholder="请输入github access token"
                          className="min-w-0 flex-1"
                          value={basic?.githubKey}
                          onChange={(e) =>
                            updateBasicInfo({
                              ...basic,
                              githubKey: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:ml-3 sm:flex-row sm:items-center">
                        <div className="shrink-0 sm:w-[110px]">UseName</div>
                        <Input
                          className="min-w-0 flex-1"
                          placeholder="请输入github username"
                          value={basic?.githubUseName}
                          onChange={(e) =>
                            updateBasicInfo({
                              ...basic,
                              githubUseName: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicPanel;
