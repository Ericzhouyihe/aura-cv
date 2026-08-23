
import { motion, Reorder, useDragControls } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MenuSection } from "@/types/resume";
import { useTranslations } from "@/i18n/compat/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface LayoutItemProps {
  item: MenuSection;
  isBasic?: boolean;
  activeSection: string;
  setActiveSection: (id: string) => void;
  toggleSectionVisibility: (id: string) => void;
  deleteSection: (sectionId: string) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

const LayoutItem = ({
  item,
  isBasic = false,
  activeSection,
  setActiveSection,
  toggleSectionVisibility,
  deleteSection,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
}: LayoutItemProps) => {
  const dragControls = useDragControls();
  const t = useTranslations("common");

  if (isBasic) {
    return (
      <div
        className={cn(
          "rounded-lg group border mb-2",
          "bg-card border-border",
          "hover:border-primary/50 transition-colors",
          activeSection === item.id &&
          "border-primary text-primary ring-1 ring-primary"
        )}
        onClick={() => setActiveSection(item.id)}
      >
        <div className="flex items-center p-3 pl-[32px] space-x-3">
          <span
            className={cn(
              "text-lg  ml-[12px]",
              "text-muted-foreground group-hover:text-foreground transition-colors"
            )}
          >
            {item.icon}
          </span>
          <span className={cn("text-sm flex-1 cursor-pointer")}>
            {item.title}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Reorder.Item
      id={item.id}
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "rounded-lg group border flex overflow-hidden ",
        "bg-card border-border",
        "hover:border-primary/50 transition-colors",
        activeSection === item.id &&
        "border-primary text-primary ring-1 ring-primary"
      )}
      whileHover={{ scale: 1.01 }}
      whileDrag={{ scale: 1.02 }}
    >
      <button
        type="button"
        aria-label={`拖拽排序${item.title}`}
        title={`拖拽排序${item.title}`}
        onPointerDown={(event) => {
          dragControls.start(event);
        }}
        className={cn(
          "flex w-8 shrink-0 touch-none items-center justify-center",
          "border-border",
          "cursor-grab hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
        )}
      >
        <GripVertical
          className={cn(
            "w-4 h-4",
            "text-muted-foreground",
            "transform transition-transform group-hover:scale-110"
          )}
        />
      </button>

      <div
        className="flex min-w-0 flex-1 cursor-pointer select-none items-center space-x-3 p-3"
        onClick={() => setActiveSection(item.id)}
      >
        <div className="flex flex-1 items-center">
          <span
            className={cn(
              "text-lg mr-2",
              "text-muted-foreground group-hover:text-foreground transition-colors"
            )}
          >
            {item.icon}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
          <div className="mr-1 flex shrink-0 items-center">
            <button
              type="button"
              aria-label={`上移${item.title}`}
              title={`上移${item.title}`}
              disabled={!canMoveUp}
              onClick={(event) => {
                event.stopPropagation();
                onMoveUp?.();
              }}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label={`下移${item.title}`}
              title={`下移${item.title}`}
              disabled={!canMoveDown}
              onClick={(event) => {
                event.stopPropagation();
                onMoveDown?.();
              }}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          <motion.button
            type="button"
            aria-label={`${item.enabled ? "隐藏" : "显示"}${item.title}`}
            title={`${item.enabled ? "隐藏" : "显示"}${item.title}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSectionVisibility(item.id);
            }}
            className={cn(
              "p-1.5 rounded-md mr-2",
              "hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            )}
          >
            {item.enabled ? (
              <Eye className="w-4 h-4 text-primary" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </motion.button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <motion.button
                type="button"
                aria-label={`删除${item.title}`}
                title={`删除${item.title}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                  "p-1.5 rounded-md text-primary",
                  "hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                )}
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </motion.button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("delete")} {item.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deleteModuleConfirm")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSection(item.id);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-orange-400 hover:from-rose-600 hover:to-orange-500 text-white shadow-sm border-0"
                >
                  {t("confirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Reorder.Item>
  );
};

export default LayoutItem;
