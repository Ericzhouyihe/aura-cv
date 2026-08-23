
import React, { useEffect, useMemo, useState, useRef } from "react";
import throttle from "lodash/throttle";
import { toast } from "sonner";
import { DEFAULT_TEMPLATES } from "@/config";
import { cn } from "@/lib/utils";
import { useResumeStore } from "@/store/useResumeStore";
import { useAutoOnePage } from "@/hooks/useAutoOnePage";
import { useTranslations } from "@/i18n/compat/client";
import { normalizeFontFamily } from "@/utils/fonts";
import ResumeTemplateComponent from "../templates";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  MIN_PREVIEW_SCALE,
  calculatePreviewGeometry,
  calculatePreviewPageHeight,
  type PreviewGeometry,
} from "./preview-geometry";

const PageBreakLine = React.memo(
  ({
    pageNumber,
    contentPerPagePx,
    pagePadding,
  }: {
    pageNumber: number;
    contentPerPagePx: number;
    pagePadding: number;
  }) => {
    // 预览中 #resume-preview 有 padding-top，内容从 pagePadding 位置开始
    // 每页能容纳 contentPerPagePx 高度的内容（与 Puppeteer PDF margin 一致）
    // 第 N 页结束位置 = pagePadding + N * contentPerPagePx
    const top = pagePadding + pageNumber * contentPerPagePx;

    return (
      <div
        className="absolute left-0 right-0 pointer-events-none page-break-line"
        style={{ top: `${top}px` }}
      >
        <div className="relative w-full">
          <div className="absolute w-full border-t-2 border-dashed border-red-400" />
          <div className="absolute right-0 -top-6 text-xs text-red-500">
            第{pageNumber}页结束
          </div>
        </div>
      </div>
    );
  }
);

PageBreakLine.displayName = "PageBreakLine";

interface PreviewPanelProps {
  onGeometryChange?: (geometry: PreviewGeometry) => void;
}

const PreviewPanel = React.forwardRef<HTMLDivElement, PreviewPanelProps>(
  ({ onGeometryChange }, ref) => {
    const { activeResume, setActiveSection } = useResumeStore();
    const selectedFontFamily = normalizeFontFamily(
      activeResume?.globalSettings?.fontFamily
    );
    const t = useTranslations("previewDock");
    const template = useMemo(() => {
      return (
        DEFAULT_TEMPLATES.find((t) => t.id === activeResume?.templateId) ||
        DEFAULT_TEMPLATES[0]
      );
    }, [activeResume?.templateId]);

    const startRef = useRef<HTMLDivElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const internalResumeContentRef = useRef<HTMLDivElement>(null);
    const resumeContentRef = (ref as React.MutableRefObject<HTMLDivElement>) || internalResumeContentRef;
    const [contentHeight, setContentHeight] = useState(0);
    const [previewScale, setPreviewScale] = useState(MIN_PREVIEW_SCALE);

    useEffect(() => {
      const container = previewRef.current;
      if (!container) return;

      const updatePreviewScale = () => {
        const geometry = calculatePreviewGeometry(container.clientWidth);
        setPreviewScale(geometry.scale);
        onGeometryChange?.(geometry);
      };

      updatePreviewScale();
      const resizeObserver = new ResizeObserver(updatePreviewScale);
      resizeObserver.observe(container);

      return () => resizeObserver.disconnect();
    }, [activeResume?.id, onGeometryChange]);

    const updateContentHeight = () => {
      if (resumeContentRef.current) {
        const height = resumeContentRef.current.clientHeight;
        if (height > 0) {
          if (height !== contentHeight) {
            setContentHeight(height);
          }
        }
      }
    };

    useEffect(() => {
      const debouncedUpdate = throttle(() => {
        requestAnimationFrame(() => {
          updateContentHeight();
        });
      }, 100);

      const observer = new MutationObserver(debouncedUpdate);

      if (resumeContentRef.current) {
        observer.observe(resumeContentRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          characterData: true,
        });

        updateContentHeight();
      }

      const resizeObserver = new ResizeObserver(debouncedUpdate);

      if (resumeContentRef.current) {
        resizeObserver.observe(resumeContentRef.current);
      }

      return () => {
        observer.disconnect();
        resizeObserver.disconnect();
      };
    }, [activeResume?.id]);

    useEffect(() => {
      if (activeResume) {
        const timer = setTimeout(updateContentHeight, 300);
        return () => clearTimeout(timer);
      }
    }, [activeResume]);

    const pagePadding = activeResume?.globalSettings?.pagePadding || 0;
    const autoOnePageEnabled = activeResume?.globalSettings?.autoOnePage || false;

    const { scaleFactor, isScaled, cannotFit } = useAutoOnePage({
      contentHeight,
      pagePadding,
      enabled: autoOnePageEnabled,
    });

    const previewPageHeight = calculatePreviewPageHeight(
      contentHeight,
      isScaled ? scaleFactor : 1
    );

    useEffect(() => {
      if (cannotFit) {
        toast.warning(t("autoOnePage.cannotFit"), {
          duration: 4000,
        });
      }
    }, [cannotFit, t]);

    const { contentPerPagePx, pageBreakCount } = useMemo(() => {
      const MM_TO_PX = 3.78;
      const A4_HEIGHT_PX = 297 * MM_TO_PX;

      // 与 Puppeteer PDF 导出一致：margin: pagePadding px（上下各一份）
      // 每页可用内容高度 = A4 总高度 - 上 margin - 下 margin
      const baseContentPerPage = A4_HEIGHT_PX - 2 * pagePadding;

      // 一页纸模式启用且内容能完美一页时，才隐藏分页线
      // cannotFit 时内容仍超出一页，需要保留分页线
      if ((isScaled && !cannotFit) || contentHeight <= 0) {
        return { contentPerPagePx: baseContentPerPage, pageBreakCount: 0 };
      }

      // 缩放时，在容器本地坐标系下每页能容纳更多内容
      // 因为视觉上 effectiveContentPerPage * scaleFactor = baseContentPerPage
      const effectiveContentPerPage = isScaled
        ? baseContentPerPage / scaleFactor
        : baseContentPerPage;

      // contentHeight 包含 #resume-preview 的 padding（上+下）
      // 实际内容高度 = contentHeight - 2 * pagePadding
      const actualContentHeight = contentHeight - 2 * pagePadding;
      const pageCount = Math.max(1, Math.ceil(actualContentHeight / effectiveContentPerPage));
      const pageBreakCount = Math.max(0, pageCount - 1);

      return { contentPerPagePx: effectiveContentPerPage, pageBreakCount };
    }, [contentHeight, pagePadding, isScaled, cannotFit, scaleFactor]);

    if (!activeResume) return null;

    const handlePreviewClickCapture = (
      event: React.MouseEvent<HTMLDivElement>
    ) => {
      const target = event.target as HTMLElement | null;
      const sectionElement = target?.closest<HTMLElement>(
        "[data-resume-section-id]"
      );
      const sectionId = sectionElement?.dataset.resumeSectionId;

      if (!sectionId || sectionId === activeResume.activeSection) {
        return;
      }

      setActiveSection(sectionId);
    };

    return (
      <div
        ref={previewRef}
        className="relative min-h-full w-full bg-workbench-canvas"
        style={{
          fontFamily: selectedFontFamily,
        }}
      >
        <div className="flex min-h-full min-w-full p-4">
          <div
            className="relative mx-auto shrink-0"
            style={{
              width: `${A4_WIDTH_PX * previewScale}px`,
              height: `${previewPageHeight * previewScale}px`,
            }}
          >
            <div
              ref={startRef}
              className={cn(
                "absolute left-0 top-0 overflow-hidden w-[210mm] min-w-[210mm] min-h-[297mm]",
                "bg-white",
                "shadow-lg"
              )}
              style={{
                height: `${previewPageHeight}px`,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <div
                ref={resumeContentRef}
              id="resume-preview"
              onClickCapture={handlePreviewClickCapture}
              style={{
                fontFamily: selectedFontFamily,
                padding: `${activeResume.globalSettings?.pagePadding}px`,
                ...(isScaled
                  ? {
                    transform: `scale(${scaleFactor})`,
                    transformOrigin: "top left",
                    width: `${100 / scaleFactor}%`,
                  }
                  : {}),
              }}
              className="relative"
            >
              <style>{`
              .grammar-error {
                cursor: help;
                border-bottom: 2px dashed;
                transition: background-color 0.2s ease;
              }

              .grammar-error.spelling {
                border-color: #ef4444;
              }

              .grammar-error.grammar {
                border-color: #f59e0b;
              }

              .grammar-error:hover {
                background-color: rgba(239, 68, 68, 0.1);
              }

              /* 使用属性选择器匹配所有active-*类 */
              .grammar-error[class*="active-"] {
                animation: highlight 2s ease-in-out;
              }

              @keyframes highlight {
                0% {
                  background-color: transparent;
                }
                20% {
                  background-color: rgba(239, 68, 68, 0.2);
                }
                80% {
                  background-color: rgba(239, 68, 68, 0.2);
                }
                100% {
                  background-color: transparent;
                }
              }
            `}</style>
              <ResumeTemplateComponent data={activeResume} template={template} />
              {contentHeight > 0 && (
                <>
                  <div key={`page-breaks-container-${contentHeight}`}>
                    {Array.from(
                      { length: Math.min(pageBreakCount, 20) },
                      (_, i) => {
                        const pageNumber = i + 1;

                        const pageLinePosition =
                          pagePadding + pageNumber * contentPerPagePx;

                        if (pageLinePosition <= contentHeight) {
                          return (
                            <PageBreakLine
                              key={`page-break-${pageNumber}`}
                              pageNumber={pageNumber}
                              contentPerPagePx={contentPerPagePx}
                              pagePadding={pagePadding}
                            />
                          );
                        }
                        return null;
                      }
                    ).filter(Boolean)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  });

PreviewPanel.displayName = "PreviewPanel";

export default PreviewPanel;
