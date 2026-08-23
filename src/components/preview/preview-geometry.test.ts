import assert from "node:assert/strict";
import test from "node:test";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  MIN_PREVIEW_SCALE,
  calculatePreviewGeometry,
  calculatePreviewPageHeight,
} from "./preview-geometry";

test("fits the A4 page inside the preview with 16px side gutters", () => {
  const geometry = calculatePreviewGeometry(600);

  assert.equal(geometry.pageWidth, 568);
  assert.equal(geometry.pageLeft, 16);
  assert.equal(geometry.scale, 568 / A4_WIDTH_PX);
});

test("caps the preview at the original A4 width and centers it", () => {
  const geometry = calculatePreviewGeometry(1000);

  assert.equal(geometry.pageWidth, A4_WIDTH_PX);
  assert.equal(geometry.pageLeft, (1000 - A4_WIDTH_PX) / 2);
  assert.equal(geometry.scale, 1);
});

test("keeps the minimum preview scale in exceptionally narrow containers", () => {
  const geometry = calculatePreviewGeometry(240);

  assert.equal(geometry.scale, MIN_PREVIEW_SCALE);
  assert.equal(geometry.pageWidth, A4_WIDTH_PX * MIN_PREVIEW_SCALE);
  assert.equal(geometry.pageLeft, 16);
});

test("uses the scaled content height while preserving the A4 minimum", () => {
  assert.equal(calculatePreviewPageHeight(A4_HEIGHT_PX, 0.8), A4_HEIGHT_PX);
  assert.equal(calculatePreviewPageHeight(1500, 0.8), 1200);
});
