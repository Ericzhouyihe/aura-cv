import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@/i18n/compat/client";
import { Streamdown } from "streamdown";
import "streamdown/styles.css";
import { createMarkdownExit } from "markdown-exit";
import TurndownService from "turndown";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIConfigStore } from "@/store/useAIConfigStore";
import { AI_MODEL_CONFIGS } from "@/config/ai";
import { cn } from "@/lib/utils";

interface AIRewritePanelProps {
  open: boolean;
  content: string;
  onApply: (content: string) => void;
  onClose: () => void;
}

const CHIP_KEYS = ["chip1", "chip2", "chip3", "chip4", "chip5", "chip6"];

// markdown-exit 实例，用于将 AI 返回的 Markdown 转换为 Tiptap 兼容的 HTML
const md = createMarkdownExit({
  html: true, // 允许 HTML 标签透传
  breaks: true, // 将换行符转换为 <br>
  linkify: false // 简历内容不需要自动识别链接
});

// turndown 实例，用于将 Tiptap HTML 转换为 Markdown 发给 AI
const turndownService = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-"
});

// 模型偶尔仍会漏出 Markdown 修饰语法或思考标签，
// 面板展示与写回编辑器前统一清洗为纯文本（编辑器格式由用户通过工具栏控制）
const sanitizeModelOutput = (text: string) => {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "") // 推理模型的思考块
    .replace(/```[a-zA-Z]*\r?\n?/g, "") // 代码块围栏（保留内部正文）
    .replace(/\*\*([^*\n]+)\*\*/g, "$1") // **加粗**
    .replace(/__([^_\n]+)__/g, "$1") // __加粗__
    .replace(/\*([^*\n]+)\*/g, "$1") // *斜体*
    .replace(/~~([^~\n]+)~~/g, "$1") // ~~删除线~~
    .replace(/`([^`\n]+)`/g, "$1") // `代码`
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, "") // 行首 # 标题
    .replace(/^([ \t]*[-*][ \t]+)[ \t]*#{1,6}[ \t]+/gm, "$1"); // 列表项内 # 标题
};

export default function AIRewritePanel({
  open,
  content,
  onApply,
  onClose
}: AIRewritePanelProps) {
  const t = useTranslations("aiRewritePanel");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultContent, setResultContent] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [selectedChipIndex, setSelectedChipIndex] = useState<number | null>(null);
  const {
    selectedModel,
    doubaoApiKey,
    doubaoModelId,
    deepseekApiKey,
    deepseekModelId,
    openaiApiKey,
    openaiModelId,
    openaiApiEndpoint,
    geminiApiKey,
    geminiModelId,
    isConfigured
  } = useAIConfigStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // 发送内容即输入框内容（关键词点击后会自动填入）
  const buildInstructions = () => customInput.trim();

  const getErrorMessage = async (response: Response) => {
    const fallback = `${t("error.failed")} (${response.status})`;

    try {
      const contentType = response.headers.get("content-type") || "";
      const rawText = await response.text();

      if (!rawText) {
        return fallback;
      }

      if (contentType.includes("application/json") || rawText.startsWith("{")) {
        const data = JSON.parse(rawText) as {
          error?: string | { message?: string };
          message?: string;
        };

        if (typeof data.error === "string" && data.error.trim()) {
          return data.error.trim();
        }
        if (typeof data.error === "object" && data.error?.message?.trim()) {
          return data.error.message.trim();
        }
        if (data.message?.trim()) {
          return data.message.trim();
        }
      } else if (rawText.trim()) {
        return rawText.trim();
      }
    } catch {
      // 保持 fallback
    }

    return fallback;
  };

  const handleRewrite = async () => {
    if (isGenerating) return;

    if (!isConfigured()) {
      toast.error(t("error.configRequired"));
      return;
    }

    setIsGenerating(true);
    setResultContent("");
    abortControllerRef.current = new AbortController();

    try {
      const config = AI_MODEL_CONFIGS[selectedModel];
      const apiKey =
        selectedModel === "doubao"
          ? doubaoApiKey
          : selectedModel === "openai"
            ? openaiApiKey
            : selectedModel === "gemini"
              ? geminiApiKey
              : deepseekApiKey;
      const modelId =
        selectedModel === "doubao"
          ? doubaoModelId
          : selectedModel === "openai"
            ? openaiModelId
            : selectedModel === "gemini"
              ? geminiModelId
              : deepseekModelId;

      const customInstructions = buildInstructions();

      const response = await fetch("/api/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: turndownService.turndown(content),
          apiKey,
          apiEndpoint: selectedModel === "openai" ? openaiApiEndpoint : undefined,
          model: config.requiresModelId ? modelId : config.defaultModel,
          modelType: selectedModel,
          customInstructions: customInstructions.trim() || undefined
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setResultContent((prev) => prev + chunk);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      toast.error(error instanceof Error ? error.message : t("error.failed"));
    } finally {
      setIsGenerating(false);
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (resultContent && resultRef.current) {
      const container = resultRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [resultContent]);

  const resetPanel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setResultContent("");
    setCustomInput("");
    setSelectedChipIndex(null);
    setIsGenerating(false);
  };

  useEffect(() => {
    if (!open) {
      resetPanel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    resetPanel();
    onClose();
  };

  const handleApply = () => {
    const htmlContent = md.render(sanitizeModelOutput(resultContent));
    onApply(htmlContent);
    resetPanel();
    onClose();
    toast.success(t("toast.applied"));
  };

  // 单选：点击关键词自动填入输入框；再次点击同一个取消选择
  const handleChipClick = (index: number) => {
    const chipText = t(`chip${index + 1}`);
    if (selectedChipIndex === index) {
      setSelectedChipIndex(null);
      setCustomInput((prev) => (prev.trim() === chipText ? "" : prev));
      return;
    }
    setSelectedChipIndex(index);
    setCustomInput(chipText);
  };

  // 手动编辑输入框后，若内容不再与选中关键词一致，取消高亮
  const handleCustomInputChange = (value: string) => {
    setCustomInput(value);
    if (
      selectedChipIndex !== null &&
      value.trim() !== t(`chip${selectedChipIndex + 1}`)
    ) {
      setSelectedChipIndex(null);
    }
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleRewrite();
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="mt-2 space-y-3 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 dark:bg-primary/[0.06]">
            {/* 标题行 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {t("title")}
                </span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={isGenerating}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
                aria-label={t("button.close")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 关键词 chips（多选） */}
            <div className="flex flex-wrap gap-2">
              {CHIP_KEYS.map((key, index) => {
                const selected = selectedChipIndex === index;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleChipClick(index)}
                    disabled={isGenerating}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      "disabled:cursor-not-allowed disabled:opacity-50",
                      selected
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    {t(key)}
                  </button>
                );
              })}
            </div>

            {/* 输入行 */}
            <div className="flex items-center gap-2">
              <Input
                value={customInput}
                onChange={(e) => handleCustomInputChange(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={t("inputPlaceholder")}
                disabled={isGenerating}
                className="h-9 flex-1 rounded-lg bg-background text-sm"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleRewrite}
                disabled={isGenerating}
                className="h-9 gap-1.5 rounded-lg bg-gradient-to-r from-[#9333EA] to-[#EC4899] px-4 text-white shadow-md shadow-purple-500/20 hover:opacity-90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {resultContent ? t("button.regenerate") : t("button.go")}
                  </>
                )}
              </Button>
            </div>

            {/* 结果区 */}
            <AnimatePresence>
              {(resultContent || isGenerating) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-2 px-1">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                      <span className="text-xs font-medium text-primary">
                        {t("result")}
                      </span>
                    </div>
                    <div
                      ref={resultRef}
                      className="max-h-64 overflow-auto rounded-lg border border-primary/20 bg-background p-3 scroll-smooth"
                    >
                      <Streamdown
                        animated
                        isAnimating={isGenerating}
                        className="prose dark:prose-invert max-w-none text-sm text-neutral-800 dark:text-neutral-200"
                      >
                        {sanitizeModelOutput(resultContent)}
                      </Streamdown>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleClose}
                        className="h-8 rounded-lg text-xs"
                      >
                        {t("button.close")}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleApply}
                        disabled={!resultContent || isGenerating}
                        className="h-8 rounded-lg bg-primary text-xs text-white hover:bg-primary/90"
                      >
                        {t("button.apply")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
