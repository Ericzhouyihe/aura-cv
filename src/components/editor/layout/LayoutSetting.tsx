import { Reorder } from "framer-motion";
import { MenuSection } from "@/types/resume";
import LayoutItem from "./LayoutItem";

interface LayoutPanelProps {
  menuSections: MenuSection[];
  activeSection: string;
  setActiveSection: (id: string) => void;
  toggleSectionVisibility: (id: string) => void;
  deleteSection: (sectionId: string) => void;
  reorderSections: (sections: MenuSection[]) => void;
}

const LayoutSetting = ({
  menuSections,
  activeSection,
  setActiveSection,
  toggleSectionVisibility,
  deleteSection,
  reorderSections,
}: LayoutPanelProps) => {
  const basicSection = menuSections.find((item) => item.id === "basic");
  const draggableSections = menuSections.filter((item) => item.id !== "basic");

  const moveSection = (index: number, offset: -1 | 1) => {
    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= draggableSections.length) {
      return;
    }

    const nextSections = [...draggableSections];
    [nextSections[index], nextSections[targetIndex]] = [
      nextSections[targetIndex],
      nextSections[index],
    ];
    reorderSections(nextSections);
  };

  return (
    <div className="space-y-4  rounded-lg dark:bg-neutral-900/30">
      {basicSection && (
        <LayoutItem
          item={basicSection}
          isBasic={true}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          toggleSectionVisibility={toggleSectionVisibility}
          deleteSection={deleteSection}
        />
      )}

      <Reorder.Group
        axis="y"
        values={draggableSections}
        onReorder={(newOrder) => {
          const updatedSections = [
            ...menuSections.filter((item) => item.id === "basic"),
            ...newOrder,
          ];
          reorderSections(updatedSections);
        }}
        className="space-y-2"
      >
        {draggableSections.map((item, index) => (
          <LayoutItem
            key={item.id}
            item={item}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            toggleSectionVisibility={toggleSectionVisibility}
            deleteSection={deleteSection}
            onMoveUp={() => moveSection(index, -1)}
            onMoveDown={() => moveSection(index, 1)}
            canMoveUp={index > 0}
            canMoveDown={index < draggableSections.length - 1}
          />
        ))}
      </Reorder.Group>
    </div>
  );
};

export default LayoutSetting;
