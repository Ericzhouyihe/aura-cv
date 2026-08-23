import { EditPanel } from "@/components/editor/EditPanel";
import { ModuleTabs } from "@/components/workbench/ModuleTabs";

export function EditorWorkspace() {
  return (
    <div className="flex h-full min-w-0 flex-col gap-2 overflow-hidden bg-workbench-canvas">
      <ModuleTabs />

      <section className="min-h-0 min-w-0 flex-1 overflow-hidden rounded-lg bg-background">
        <EditPanel />
      </section>
    </div>
  );
}
