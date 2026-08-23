import assert from "node:assert/strict";
import test from "node:test";
import { initialResumeState } from "@/config/initialResumeData";
import type { ResumeData } from "@/types/resume";
import { useResumeStore } from "./useResumeStore";

const resumeId = "atomic-section-delete";

Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
  },
});

const createResume = (): ResumeData => ({
  ...structuredClone(initialResumeState),
  id: resumeId,
  title: "Atomic section delete",
  createdAt: "2026-08-22T00:00:00.000Z",
  updatedAt: "2026-08-22T00:00:00.000Z",
  templateId: null,
  activeSection: "custom-1",
  menuSections: [
    { id: "basic", title: "Basic", icon: "", enabled: true, order: 0 },
    {
      id: "education",
      title: "Education",
      icon: "",
      enabled: true,
      order: 1,
    },
    {
      id: "custom-1",
      title: "Custom",
      icon: "",
      enabled: true,
      order: 2,
    },
  ],
  customData: {
    "custom-1": [
      {
        id: "custom-item-1",
        title: "Custom item",
        subtitle: "",
        dateRange: "",
        description: "",
        visible: true,
      },
    ],
  },
});

const resetStore = () => {
  const resume = createResume();
  useResumeStore.setState({
    resumes: { [resumeId]: resume },
    activeResumeId: resumeId,
    activeResume: resume,
    history: { [resumeId]: [] },
    future: { [resumeId]: [] },
  });
};

test("hides the active section and selects a visible fallback atomically", () => {
  resetStore();

  useResumeStore.getState().toggleSectionVisibility("custom-1");

  let state = useResumeStore.getState();
  assert.equal(
    state.activeResume?.menuSections.find(
      (section) => section.id === "custom-1"
    )?.enabled,
    false
  );
  assert.equal(state.activeResume?.activeSection, "education");
  assert.equal(state.history[resumeId]?.length, 1);

  state.undo();

  state = useResumeStore.getState();
  assert.equal(
    state.activeResume?.menuSections.find(
      (section) => section.id === "custom-1"
    )?.enabled,
    true
  );
  assert.equal(state.activeResume?.activeSection, "custom-1");

  state.redo();

  state = useResumeStore.getState();
  assert.equal(
    state.activeResume?.menuSections.find(
      (section) => section.id === "custom-1"
    )?.enabled,
    false
  );
  assert.equal(state.activeResume?.activeSection, "education");
});

test("keeps deletion and immediate custom-section creation as separate undo steps", () => {
  resetStore();

  const store = useResumeStore.getState();
  store.deleteSection("custom-1");
  store.createCustomSection({
    id: "custom-2",
    title: "Second custom section",
    icon: "",
    enabled: true,
    order: 2,
  });

  let state = useResumeStore.getState();
  assert.equal(state.history[resumeId]?.length, 2);
  assert.deepEqual(
    state.activeResume?.menuSections.map((section) => section.id),
    ["basic", "education", "custom-2"]
  );

  state.undo();

  state = useResumeStore.getState();
  assert.deepEqual(
    state.activeResume?.menuSections.map((section) => section.id),
    ["basic", "education"]
  );
  assert.equal(state.activeResume?.customData["custom-1"], undefined);
  assert.equal(state.activeResume?.customData["custom-2"], undefined);

  state.undo();

  state = useResumeStore.getState();
  assert.deepEqual(
    state.activeResume?.menuSections.map((section) => section.id),
    ["basic", "education", "custom-1"]
  );
  assert.equal(state.activeResume?.customData["custom-1"]?.length, 1);
});

test("deletes a custom section as one undoable action", () => {
  resetStore();

  useResumeStore.getState().deleteSection("custom-1");

  let state = useResumeStore.getState();
  assert.deepEqual(
    state.activeResume?.menuSections.map((section) => section.id),
    ["basic", "education"]
  );
  assert.equal(state.activeResume?.customData["custom-1"], undefined);
  assert.equal(state.activeResume?.activeSection, "education");
  assert.equal(state.history[resumeId]?.length, 1);

  state.undo();

  state = useResumeStore.getState();
  assert.deepEqual(
    state.activeResume?.menuSections.map((section) => section.id),
    ["basic", "education", "custom-1"]
  );
  assert.equal(state.activeResume?.customData["custom-1"]?.length, 1);
  assert.equal(state.activeResume?.activeSection, "custom-1");
  assert.equal(state.history[resumeId]?.length, 0);
  assert.equal(state.future[resumeId]?.length, 1);

  state.redo();

  state = useResumeStore.getState();
  assert.deepEqual(
    state.activeResume?.menuSections.map((section) => section.id),
    ["basic", "education"]
  );
  assert.equal(state.activeResume?.customData["custom-1"], undefined);
  assert.equal(state.activeResume?.activeSection, "education");
  assert.equal(state.history[resumeId]?.length, 1);
  assert.equal(state.future[resumeId]?.length, 0);
});
