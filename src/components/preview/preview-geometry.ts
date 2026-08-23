export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;
export const PREVIEW_HORIZONTAL_PADDING = 32;
export const MIN_PREVIEW_SCALE = 0.3;

export interface PreviewGeometry {
  scale: number;
  pageWidth: number;
  pageLeft: number;
}

export function calculatePreviewGeometry(
  containerWidth: number
): PreviewGeometry {
  const sideGutter = PREVIEW_HORIZONTAL_PADDING / 2;
  const availableWidth = Math.max(
    0,
    containerWidth - PREVIEW_HORIZONTAL_PADDING
  );
  const scale = Math.min(
    1,
    Math.max(MIN_PREVIEW_SCALE, availableWidth / A4_WIDTH_PX)
  );
  const pageWidth = A4_WIDTH_PX * scale;

  return {
    scale,
    pageWidth,
    pageLeft: Math.max(sideGutter, (containerWidth - pageWidth) / 2),
  };
}

export function calculatePreviewPageHeight(
  contentHeight: number,
  contentScale: number
): number {
  return Math.max(A4_HEIGHT_PX, contentHeight * contentScale);
}
