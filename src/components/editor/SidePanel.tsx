import { motion } from "framer-motion";
import { ModuleNavigator } from "@/components/workbench/ModuleNavigator";
import { StyleSettingsPanel } from "@/components/workbench/StyleSettingsPanel";
import { cn } from "@/lib/utils";

export function SidePanel({
  onSectionCreated,
}: {
  onSectionCreated?: () => void;
} = {}) {
  return (
    <motion.div
      className={cn(
        "w-[80] overflow-y-auto",
        "border-border bg-background"
      )}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="space-y-4 p-4">
        <ModuleNavigator onSectionCreated={onSectionCreated} />
        <StyleSettingsPanel />
      </div>
    </motion.div>
  );
}
