import { BasicFieldType } from "@/types/resume";

export const DEFAULT_FIELD_ORDER: BasicFieldType[] = [
  { id: "1", key: "name", label: "姓名", type: "text", visible: true },

  { id: "2", key: "title", label: "职位", type: "text", visible: true },
  {
    id: "3",
    key: "employementStatus",
    label: "状态",
    type: "text",
    visible: true
  },
  { id: "4", key: "birthDate", label: "生日", type: "date", visible: true },
  { id: "8", key: "age", label: "年龄", type: "text", visible: true },
  { id: "5", key: "email", label: "邮箱", type: "text", visible: true },
  { id: "6", key: "phone", label: "电话", type: "text", visible: true },
  { id: "7", key: "location", label: "所在地", type: "text", visible: true }
];

export const withDefaultBasicFields = (
  fieldOrder: BasicFieldType[] | undefined
): BasicFieldType[] => {
  const current = fieldOrder ?? [];
  const existingKeys = new Set(current.map((field) => field.key));
  const missing = DEFAULT_FIELD_ORDER.filter(
    (def) => !existingKeys.has(def.key)
  );
  return missing.length ? [...current, ...missing] : current;
};

export const GITHUB_REPO_URL = "https://github.com/Ericzhouyihe/aura-cv";

export const PDF_EXPORT_CONFIG = {
  SERVER_URL: "https://api.magicv.art/generate-pdf",
  TIMEOUT: 45000,
  MAX_RETRY: 2,
  MAX_CONTENT_SIZE: 5 * 1024 * 1024
} as const;
