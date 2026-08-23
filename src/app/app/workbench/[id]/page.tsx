import { useEffect } from "react";
import { EditorHeader } from "@/components/editor/EditorHeader";
import { MobileWorkbench } from "@/components/mobile/MobileWorkbench";
import { WorkbenchShell } from "@/components/workbench/WorkbenchShell";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export const runtime = "edge";

export default function Home() {
  const isDesktop = useMediaQuery("(min-width: 1100px)");

  useEffect(() => {
    document.body.classList.add("workbench-body-lock");
    return () => {
      document.body.classList.remove("workbench-body-lock");
    };
  }, []);

  return (
    <main className="min-h-screen w-full overflow-hidden bg-background text-foreground">
      <EditorHeader />

      <div className="h-[calc(100vh-64px)] w-full">
        {isDesktop === true && <WorkbenchShell />}
        {isDesktop === false && <MobileWorkbench />}
      </div>
    </main>
  );
}
