import { useState } from "react";
import PreviewPanel from "@/components/preview";
import type { PreviewGeometry } from "@/components/preview/preview-geometry";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { EditorWorkspace } from "@/components/workbench/EditorWorkspace";
import { PreviewToolbar } from "@/components/workbench/PreviewToolbar";
import { useTranslations } from "@/i18n/compat/client";

export function WorkbenchShell() {
  const t = useTranslations("workbench");
  const [previewGeometry, setPreviewGeometry] =
    useState<PreviewGeometry | null>(null);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full bg-workbench-canvas p-2 2xl:p-3"
    >
      <ResizablePanel
        id="editor-workspace"
        order={1}
        defaultSize={53}
        minSize={30}
        className="min-w-0 overflow-hidden rounded-lg"
      >
        <EditorWorkspace />
      </ResizablePanel>

      <ResizableHandle
        withHandle
        aria-label={t("resizePanels")}
        className="z-20 w-2 shrink-0 bg-workbench-canvas text-muted-foreground transition-colors after:w-3 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 [&>div]:border-border [&>div]:bg-background"
      />

      <ResizablePanel
        id="resume-preview-panel"
        order={2}
        defaultSize={47}
        minSize={30}
        className="min-w-0 overflow-hidden rounded-lg"
      >
        <div className="flex h-full min-w-0 flex-col gap-2 overflow-hidden">
          <PreviewToolbar geometry={previewGeometry} />
          <div
            className="min-h-0 flex-1 overflow-auto rounded-lg bg-workbench-canvas"
            data-preview-scroll-container="true"
          >
            <PreviewPanel onGeometryChange={setPreviewGeometry} />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
